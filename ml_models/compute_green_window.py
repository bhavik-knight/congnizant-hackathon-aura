import json
from pathlib import Path
import pandas as pd
import joblib
import numpy as np

ROOT = Path(__file__).parent.parent
DATA = ROOT / 'data' / 'hourly_load_data.csv'
MODEL = Path(__file__).parent / 'aura_model.joblib'
SEASONAL = Path(__file__).parent / 'seasonal_baseline.json'
OUT_CSV = Path(__file__).parent / 'aura_forecast_24h_with_carbon.csv'
OUT_WINDOW = Path(__file__).parent / 'aura_green_window.json'

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


def main():
    # Load data
    df = load_load_series()

    # Load seasonal baseline
    with open(SEASONAL, 'r') as f:
        seasonal = json.load(f)

    # Load model
    if not MODEL.exists():
        print('Model file not found, exiting')
        return
    try:
        results = joblib.load(MODEL)
    except Exception as e:
        print('Could not load model:', e)
        return

    # Forecast next 24 hours
    steps = 24
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

    # Map seasonal baseline per month
    def baseline_for_ts(ts):
        m = ts.month
        # seasonal keys may be strings or ints
        return float(seasonal.get(str(m)) or seasonal.get(m) or 0.0)

    forecast_df['Renewable_Baseload_MW'] = forecast_df['ds'].map(baseline_for_ts).astype(float)
    forecast_df['Fossil_Fuel_MW'] = forecast_df['Forecast_Load_MW'] - forecast_df['Renewable_Baseload_MW']
    # Clip negative fossil (renewables exceed load)
    forecast_df['Fossil_Fuel_MW'] = forecast_df['Fossil_Fuel_MW'].clip(lower=0.0)

    # Compute carbon intensity (gCO2/kWh)
    def compute_ci(row):
        load = row['Forecast_Load_MW']
        if load <= 0:
            return np.nan
        fossil = row['Fossil_Fuel_MW']
        return (fossil * 700.0) / load

    forecast_df['Carbon_Intensity_gCO2_per_kWh'] = forecast_df.apply(compute_ci, axis=1)

    # Save CSV
    forecast_df.to_csv(OUT_CSV, index=False)
    print('Wrote', OUT_CSV)

    # Identify Green Window: the hours with lowest carbon intensity
    sorted_df = forecast_df.sort_values('Carbon_Intensity_gCO2_per_kWh')
    # List top 6 greenest hours
    green_hours = sorted_df.head(6)[['ds', 'Forecast_Load_MW', 'Renewable_Baseload_MW', 'Carbon_Intensity_gCO2_per_kWh']]
    print('\nTop 6 greenest hours (lowest carbon intensity):')
    print(green_hours.to_string(index=False))

    # Also compute best contiguous window (default 3 hours) and save as JSON
    window_len = 3
    if len(forecast_df) >= window_len:
        ci_series = forecast_df.set_index('ds')['Carbon_Intensity_gCO2_per_kWh']
        rolling = ci_series.rolling(window=window_len, min_periods=window_len).mean()
        best_start = rolling.idxmin()
        best_avg = float(rolling.min())
        best_end = best_start + pd.Timedelta(hours=window_len - 1)

        window_df = forecast_df.set_index('ds').loc[best_start:best_end].reset_index()
        out = {
            'start': best_start.isoformat(),
            'end': best_end.isoformat(),
            'avg_carbon_intensity_gco2_per_kwh': best_avg,
            'length_hours': window_len,
            'rows': []
        }
        for _, r in window_df.iterrows():
            out['rows'].append({
                'ds': r['ds'].isoformat(),
                'forecast_load_mw': float(r['Forecast_Load_MW']),
                'renewable_baseload_mw': float(r['Renewable_Baseload_MW']),
                'fossil_fuel_mw': float(r['Fossil_Fuel_MW']),
                'carbon_intensity_gco2_per_kwh': float(r['Carbon_Intensity_gCO2_per_kWh'])
            })

        with open(OUT_WINDOW, 'w') as f:
            json.dump(out, f, indent=2)
        print('Wrote', OUT_WINDOW)


if __name__ == '__main__':
    main()
