from pathlib import Path
import pandas as pd
import json

print("--- Starting Supply Model Builder ---")

try:
    # Load the monthly generation data
    csv_path = Path(__file__).parent.parent.joinpath("data/energy_sources_data.csv")
    df = pd.read_csv(csv_path)

    # Filter for Nova Scotia and relevant renewable types
    df_ns = df[df['GEO'] == 'Nova Scotia'].copy()
    renewables = ['Hydraulic turbine', 'Wind power turbine', 'Tidal power turbine', 'Solar']
    df_ns_renew = df_ns[df_ns['Type of electricity generation'].isin(renewables)]

    # Convert REF_DATE to datetime and extract month/year
    df_ns_renew['REF_DATE'] = pd.to_datetime(df_ns_renew['REF_DATE'], format='%Y-%m')
    df_ns_renew['month'] = df_ns_renew['REF_DATE'].dt.month
    df_ns_renew['year'] = df_ns_renew['REF_DATE'].dt.year

    # Group by year and month, sum the VALUE (MWh)
    df_monthly_sum = df_ns_renew.groupby(['year', 'month'])['VALUE'].sum().reset_index()

    # Get the average MWh for each month across all years
    df_avg_monthly = df_monthly_sum.groupby('month')['VALUE'].mean().reset_index()

    # Convert "Average Monthly MWh" to "Average Hourly MW"
    # This is the crucial step for our rule-based model
    days_in_month = {
        1: 31, 2: 28.25, 3: 31, 4: 30, 5: 31, 6: 30,
        7: 31, 8: 31, 9: 30, 10: 31, 11: 30, 12: 31
    }

    df_avg_monthly['hours_in_month'] = df_avg_monthly['month'].map(lambda m: days_in_month[m] * 24)
    df_avg_monthly['average_hourly_mw'] = df_avg_monthly['VALUE'] / df_avg_monthly['hours_in_month']

    # Create the final lookup table (our "formula")
    seasonal_baseline_dict = df_avg_monthly.set_index('month')['average_hourly_mw'].round(1).to_dict()

    # Create outputs directory if it doesn't exist
    outputs_dir = Path(__file__).parent.parent / 'outputs'
    outputs_dir.mkdir(exist_ok=True)

    # Save the lookup table to a JSON file in outputs directory
    output_path = outputs_dir / 'seasonal_baseline.json'
    with open(output_path, 'w') as f:
        json.dump(seasonal_baseline_dict, f, indent=4)

    print(f"--- Success! Created '{output_path}' ---")
    print(seasonal_baseline_dict)

except FileNotFoundError:
    print(f"Error: energy_sources_data.csv not found.")
except Exception as e:
    print(f"An error occurred: {e}")
