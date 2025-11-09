import json
from pathlib import Path
import pandas as pd
import joblib
import numpy as np

ROOT = Path(__file__).parent.parent
DATA = ROOT / 'data' / 'hourly_load_data.csv'
MODEL = ROOT / 'outputs' / 'aura_model.joblib'
SEASONAL = ROOT / 'outputs' / 'seasonal_baseline.json'
OUTPUTS_DIR = ROOT / 'outputs'
OUT_CSV = OUTPUTS_DIR / 'aura_forecast_24h_with_carbon.csv'
OUT_WINDOW = OUTPUTS_DIR / 'aura_green_window.json'

def detect_header(csv_path):
    for hr in range(5):
        try:
            tmp = pd.read_csv(csv_path, header=hr, nrows=0)
            cols = [str(c).strip().lower() for c in tmp.columns]
            if any('date' in c or 'time' in c for c in cols) and any('load' in c or 'mw' in c for c in cols):
                return hr
        except Exception:
            continue
    return 0


def load_load_series():
    if not DATA.exists():
        raise FileNotFoundError(DATA)
    header = detect_header(DATA)
    df = pd.read_csv(DATA, header=header)
    df.columns = [str(c).strip().lower().replace(' ', '_') for c in df.columns]
    date_col = next((c for c in df.columns if 'date' in c or 'time' in c), None)
    load_col = next((c for c in df.columns if 'load' in c or 'mw' in c), None)
    if date_col is None or load_col is None:
        raise KeyError('Could not detect date/load columns')
    df = df[[date_col, load_col]].copy()
    df.columns = ['ds', 'y']
    df['ds'] = pd.to_datetime(df['ds'], errors='coerce')
    df['y'] = pd.to_numeric(df['y'], errors='coerce')
    df.dropna(inplace=True)
    df.set_index('ds', inplace=True)
    df = df.sort_index()
    df = df[~df.index.duplicated(keep='first')]
    df = df.asfreq('h')
    df['y'] = df['y'].fillna(df['y'].mean())
    return df


def forecast_24h_demand(steps=24):
    """
    Forecast the next 24 hours demand, renewable baseload, and fossil fuel components
    based on the trained model.

    Returns:
        pd.DataFrame: Forecast data with columns:
        - ds: timestamp
        - Forecast_Load_MW: forecasted load
        - Renewable_Baseload_MW: renewable baseload
        - Fossil_Fuel_MW: fossil fuel component
    """
    # Load data
    df = load_load_series()

    # Load seasonal baseline
    with open(SEASONAL, 'r') as f:
        seasonal = json.load(f)

    # Load model
    if not MODEL.exists():
        raise FileNotFoundError(f"Model file not found: {MODEL}")
    try:
        results = joblib.load(MODEL)
    except Exception as e:
        raise RuntimeError(f"Could not load model: {e}")

    # Forecast next 24 hours
    try:
        forecast_res = results.get_forecast(steps=steps)
        forecast_mean = forecast_res.predicted_mean
    except Exception as e:
        # fallback: simple persistence forecast (last value)
        print('Model forecasting failed, using persistence fallback:', e)
        last = df['y'].iloc[-1]
        forecast_mean = pd.Series([last]*steps)

    last_ts = df.index.max()
    future_index = pd.date_range(start=last_ts + pd.Timedelta(hours=1), periods=steps, freq='H')
    forecast_df = pd.DataFrame({'ds': future_index, 'Forecast_Load_MW': np.round(forecast_mean.values, 2)})

    # Map seasonal baseline per month using timestamp's actual month
    def baseline_for_ts(ts):
        m = pd.Timestamp(ts).month  # Ensure we get month from timestamp
        # seasonal keys may be strings or ints
        return float(seasonal.get(str(m)) or seasonal.get(m) or 0.0)

    forecast_df['Renewable_Baseload_MW'] = forecast_df['ds'].map(baseline_for_ts).astype(float)
    forecast_df['Fossil_Fuel_MW'] = forecast_df['Forecast_Load_MW'] - forecast_df['Renewable_Baseload_MW']
    # Clip negative fossil (renewables exceed load)
    forecast_df['Fossil_Fuel_MW'] = forecast_df['Fossil_Fuel_MW'].clip(lower=0.0)

    return forecast_df


def compute_carbon_intensity(forecast_df):
    """
    Compute carbon intensity for the next 24 hours demand forecast.

    Args:
        forecast_df (pd.DataFrame): Forecast data from forecast_24h_demand()

    Returns:
        pd.DataFrame: Forecast data with added Carbon_Intensity_gCO2_per_kWh column
    """
    # Compute carbon intensity (gCO2/kWh)
    def compute_ci(row):
        load = row['Forecast_Load_MW']
        if load <= 0:
            return np.nan
        fossil = row['Fossil_Fuel_MW']
        return (fossil * 700.0) / load

    forecast_df = forecast_df.copy()
    forecast_df['Carbon_Intensity_gCO2_per_kWh'] = forecast_df.apply(compute_ci, axis=1)

    return forecast_df


def classify_windows_by_carbon_intensity(forecast_df):
    """
    Task 3: Compare carbon intensity of next 24 hours to seasonal_baseline.json for that month,
    and apply "green_window" or "dirty_window" labels.

    Args:
        forecast_df (pd.DataFrame): Forecast data with Carbon_Intensity_gCO2_per_kWh column

    Returns:
        pd.DataFrame: Forecast data with added window_type column
    """
    # Load seasonal baseline (assuming it contains carbon intensity thresholds in gCO2/kWh)
    with open(SEASONAL, 'r') as f:
        seasonal_baselines = json.load(f)

    # Get month from the forecast data's timestamp
    current_month = pd.Timestamp(forecast_df['ds'].iloc[0]).month  # Use the month from forecast data
    baseline_threshold = float(seasonal_baselines.get(str(current_month)) or seasonal_baselines.get(current_month) or 400.0)  # Default to 400 gCO2/kWh

    print(f'Current month: {current_month}, Carbon intensity baseline threshold: {baseline_threshold} gCO2/kWh')

    # Classify windows: green if carbon intensity < baseline, dirty otherwise
    forecast_df = forecast_df.copy()
    forecast_df['window_type'] = forecast_df['Carbon_Intensity_gCO2_per_kWh'].apply(
        lambda ci: 'green_window' if pd.notna(ci) and ci < baseline_threshold else 'dirty_window'
    )

    return forecast_df, baseline_threshold


def main():
    # Create outputs directory if it doesn't exist
    OUTPUTS_DIR.mkdir(exist_ok=True)

    # Forecast next 24 hours demand
    forecast_df = forecast_24h_demand(steps=24)

    # Compute carbon intensity
    forecast_df = compute_carbon_intensity(forecast_df)

    # Task 3: Classify windows by carbon intensity comparison to seasonal baseline
    forecast_df, baseline_threshold = classify_windows_by_carbon_intensity(forecast_df)

    # Save CSV with classifications
    forecast_df.to_csv(OUT_CSV, index=False)
    print('Wrote', OUT_CSV)

    # Identify Green and Dirty Windows
    green_windows = forecast_df[forecast_df['window_type'] == 'green_window']
    dirty_windows = forecast_df[forecast_df['window_type'] == 'dirty_window']

    print(f'\nGreen windows (carbon intensity < {baseline_threshold}): {len(green_windows)} hours')
    if len(green_windows) > 0:
        print(green_windows[['ds', 'Carbon_Intensity_gCO2_per_kWh', 'window_type']].to_string(index=False))

    print(f'\nDirty windows (carbon intensity >= {baseline_threshold}): {len(dirty_windows)} hours')
    if len(dirty_windows) > 0:
        print(dirty_windows[['ds', 'Carbon_Intensity_gCO2_per_kWh', 'window_type']].to_string(index=False))

    # Find best contiguous green window (longest sequence of green hours)
    if len(green_windows) > 0:
        # Find consecutive green windows using a simpler approach
        green_indices = forecast_df[forecast_df['window_type'] == 'green_window'].index
        if len(green_indices) > 0:
            # Find consecutive sequences
            consecutive_groups = []
            current_group = [green_indices[0]]

            for i in range(1, len(green_indices)):
                if green_indices[i] == green_indices[i-1] + 1:
                    current_group.append(green_indices[i])
                else:
                    consecutive_groups.append(current_group)
                    current_group = [green_indices[i]]
            consecutive_groups.append(current_group)

            # Find the longest group
            longest_group = max(consecutive_groups, key=len)
            longest_window = forecast_df.loc[longest_group]

            best_start = longest_window['ds'].min()
            best_end = longest_window['ds'].max()
            best_avg = longest_window['Carbon_Intensity_gCO2_per_kWh'].mean()
            window_len = len(longest_window)

            print(f'\nBest contiguous green window: {window_len} hours from {best_start} to {best_end}')

            # Create JSON output for the best green window
            window_df = longest_window.reset_index()
            out = {
                'start': best_start.isoformat(),
                'end': best_end.isoformat(),
                'avg_carbon_intensity_gco2_per_kwh': float(best_avg),
                'length_hours': window_len,
                'baseline_threshold': baseline_threshold,
                'window_type': 'green_window',
                'rows': []
            }
            for _, r in window_df.iterrows():
                out['rows'].append({
                    'ds': r['ds'].isoformat(),
                    'forecast_load_mw': float(r['Forecast_Load_MW']),
                    'renewable_baseload_mw': float(r['Renewable_Baseload_MW']),
                    'fossil_fuel_mw': float(r['Fossil_Fuel_MW']),
                    'carbon_intensity_gco2_per_kwh': float(r['Carbon_Intensity_gCO2_per_kWh']),
                    'window_type': r['window_type']
                })
        else:
            # No green windows found, use the cleanest dirty window
            print('\nNo green windows found. Using cleanest dirty window.')
            cleanest_dirty = dirty_windows.nsmallest(3, 'Carbon_Intensity_gCO2_per_kWh')
            best_start = cleanest_dirty['ds'].min()
            best_end = cleanest_dirty['ds'].max()
            best_avg = cleanest_dirty['Carbon_Intensity_gCO2_per_kWh'].mean()
            window_len = len(cleanest_dirty)

            window_df = cleanest_dirty.reset_index()
            out = {
                'start': best_start.isoformat(),
                'end': best_end.isoformat(),
                'avg_carbon_intensity_gco2_per_kwh': float(best_avg),
                'length_hours': window_len,
                'baseline_threshold': baseline_threshold,
                'window_type': 'dirty_window',
                'rows': []
            }
            for _, r in window_df.iterrows():
                out['rows'].append({
                    'ds': r['ds'].isoformat(),
                    'forecast_load_mw': float(r['Forecast_Load_MW']),
                    'renewable_baseload_mw': float(r['Renewable_Baseload_MW']),
                    'fossil_fuel_mw': float(r['Fossil_Fuel_MW']),
                    'carbon_intensity_gco2_per_kwh': float(r['Carbon_Intensity_gCO2_per_kWh']),
                    'window_type': r['window_type']
                })
    else:
        # No green windows at all, use the 3 cleanest hours
        print('\nNo green windows found in forecast. Using 3 cleanest hours.')
        cleanest_hours = forecast_df.nsmallest(3, 'Carbon_Intensity_gCO2_per_kWh')
        best_start = cleanest_hours['ds'].min()
        best_end = cleanest_hours['ds'].max()
        best_avg = cleanest_hours['Carbon_Intensity_gCO2_per_kWh'].mean()
        window_len = len(cleanest_hours)

        window_df = cleanest_hours.reset_index()
        out = {
            'start': best_start.isoformat(),
            'end': best_end.isoformat(),
            'avg_carbon_intensity_gco2_per_kwh': float(best_avg),
            'length_hours': window_len,
            'baseline_threshold': baseline_threshold,
            'window_type': 'dirty_window',
            'rows': []
        }
        for _, r in window_df.iterrows():
            out['rows'].append({
                'ds': r['ds'].isoformat(),
                'forecast_load_mw': float(r['Forecast_Load_MW']),
                'renewable_baseload_mw': float(r['Renewable_Baseload_MW']),
                'fossil_fuel_mw': float(r['Fossil_Fuel_MW']),
                'carbon_intensity_gco2_per_kwh': float(r['Carbon_Intensity_gCO2_per_kWh']),
                'window_type': r['window_type']
            })

    # Save the JSON output
    with open(OUT_WINDOW, 'w') as f:
        json.dump(out, f, indent=2)
    print('Wrote', OUT_WINDOW)

    # Also save complete 24-hour classification data for plotting
    complete_data = {
        'forecast_period': {
            'start': forecast_df['ds'].min().isoformat(),
            'end': forecast_df['ds'].max().isoformat(),
            'baseline_threshold': baseline_threshold,
            'current_month': pd.Timestamp.now().month
        },
        'hourly_classifications': []
    }

    for _, row in forecast_df.iterrows():
        complete_data['hourly_classifications'].append({
            'timestamp': row['ds'].isoformat(),
            'hour': row['ds'].hour,
            'forecast_load_mw': float(row['Forecast_Load_MW']),
            'renewable_baseload_mw': float(row['Renewable_Baseload_MW']),
            'fossil_fuel_mw': float(row['Fossil_Fuel_MW']),
            'carbon_intensity_gco2_per_kwh': float(row['Carbon_Intensity_gCO2_per_kWh']),
            'window_type': row['window_type']
        })

    # Save complete classification data
    complete_out_path = OUTPUTS_DIR / 'complete_window_classification.json'
    with open(complete_out_path, 'w') as f:
        json.dump(complete_data, f, indent=2)
    print('Wrote complete classification data to', complete_out_path)


if __name__ == '__main__':
    main()
