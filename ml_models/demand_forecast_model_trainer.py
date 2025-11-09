from pathlib import Path
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
import joblib
import warnings

print("--- Starting Demand Model Trainer (This will take a few minutes) ---")
warnings.filterwarnings("ignore") # Suppress convergence warnings

try:
    # Load the hourly load data, skipping the messy header rows
    csv_path = Path(__file__).parent.parent.joinpath("data/hourly_load_data.csv")
    load_df = pd.read_csv(csv_path)

    # Select and rename columns
    data = load_df[['Date/time', 'Load [MW]']].copy()
    data.rename(columns={'Date/time': 'ds', 'Load [MW]': 'y'}, inplace=True)

    # --- Robust data cleaning ---
    # Force 'y' to numeric, setting junk rows to NaN
    data['y'] = pd.to_numeric(data['y'], errors='coerce')

    # Force 'ds' to datetime, setting junk rows to NaT (Not a Time)
    data['ds'] = pd.to_datetime(data['ds'], errors='coerce')

    # Now, drop all rows that had junk data in *either* column
    data.dropna(inplace=True)

    # Set 'ds' as the index
    data.set_index('ds', inplace=True)

    # --- FIX for asfreq error ---
    # The 'asfreq' method fails if the index is not unique or not sorted.

    # 1. Sort the index to make it monotonic (required for asfreq)
    data.sort_index(inplace=True)

    # 2. Remove any duplicate timestamps (e.g., from daylight saving)
    # We keep the 'first' instance of any duplicate timestamp
    data = data[~data.index.duplicated(keep='first')]

    # --- END FIX ---

    # Now, resample to a clean hourly frequency.
    # This will fill any *missing* hours with NaN.
    data = data.asfreq('h')

    # Fill any missing (NaN) values with the mean
    data['y'] = data['y'].fillna(data['y'].mean())

    print(f"Loaded and cleaned {len(data)} hourly data points.")

    # --- Train SARIMAX Model ---
    print("Training SARIMAX model... This is the long part.")

    # We use (1,1,1) for the non-seasonal part (trend)
    # We use (1,1,1,24) for the seasonal part (daily cycle)
    # This is a strong, standard model for hourly data with a daily pattern.
    model = SARIMAX(data['y'],
                    order=(1, 1, 1),
                    seasonal_order=(1, 1, 1, 24),
                    enforce_stationarity=False,
                    enforce_invertibility=False)

    # Fit the model
    results = model.fit(disp=False)

    print("--- Model Training Complete ---")

    # --- Save the Model as a File ---
    # Create outputs directory if it doesn't exist
    outputs_dir = Path(__file__).parent.parent / 'outputs'
    outputs_dir.mkdir(exist_ok=True)

    model_filename = outputs_dir / 'aura_model.joblib'
    joblib.dump(results, model_filename)

    print(f"--- Success! Model saved as '{model_filename}' ---")

except FileNotFoundError:
    print(f"Error: hourly_load_data.csv not found.")
except Exception as e:
    print(f"An error occurred: {e}")
