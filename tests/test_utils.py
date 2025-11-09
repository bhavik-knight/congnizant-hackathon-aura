import pytest
import json
import pandas as pd
from pathlib import Path
from backend.main import (
    time_to_minutes, minutes_to_time, calculate_energy_savings,
    calculate_renewable_percentage, get_forecast_data
)


class TestTimeUtilities:
    """Test time conversion utilities"""

    def test_time_to_minutes(self):
        """Test converting time string to minutes"""
        assert time_to_minutes("00:00") == 0
        assert time_to_minutes("01:30") == 90
        assert time_to_minutes("12:00") == 720
        assert time_to_minutes("23:59") == 1439

    def test_minutes_to_time(self):
        """Test converting minutes to time string"""
        assert minutes_to_time(0) == "00:00"
        assert minutes_to_time(90) == "01:30"
        assert minutes_to_time(720) == "12:00"
        assert minutes_to_time(1439) == "23:59"

    def test_time_round_trip(self):
        """Test that time conversion is reversible"""
        test_times = ["00:00", "06:30", "12:00", "18:45", "23:59"]

        for time_str in test_times:
            minutes = time_to_minutes(time_str)
            back_to_time = minutes_to_time(minutes)
            assert back_to_time == time_str


class TestEnergyCalculations:
    """Test energy and carbon savings calculations"""

    def test_calculate_energy_savings(self):
        """Test CO2 savings calculation"""
        # 100 gCO2/kWh * 0.5 kWh (washer) * 1 hour = 50g = 0.05kg
        savings = calculate_energy_savings(100.0, ["washer"], 1.0)
        assert abs(savings - 0.05) < 0.01

        # Multiple appliances
        savings = calculate_energy_savings(200.0, ["washer", "dryer"], 2.0)
        expected = (200 * (0.5 + 3.0) * 2) / 1000  # 0.5 + 3.0 = 3.5 kWh total
        assert abs(savings - expected) < 0.01

    def test_calculate_renewable_percentage(self):
        """Test renewable percentage calculation"""
        # 50 MW renewable out of 100 MW total = 50%
        row = {"Forecast_Load_MW": 100.0, "Renewable_Baseload_MW": 50.0}
        percentage = calculate_renewable_percentage(row)
        assert percentage == 50.0

        # Edge case: zero load
        row = {"Forecast_Load_MW": 0.0, "Renewable_Baseload_MW": 10.0}
        percentage = calculate_renewable_percentage(row)
        assert percentage == 0.0


class TestForecastData:
    """Test forecast data generation"""

    def test_get_forecast_data_structure(self):
        """Test that forecast data has correct structure"""
        forecast_df = get_forecast_data()

        # Check that it's a DataFrame
        assert isinstance(forecast_df, pd.DataFrame)

        # Check required columns exist
        required_columns = [
            'ds', 'Forecast_Load_MW', 'Renewable_Baseload_MW',
            'Fossil_Fuel_MW', 'Carbon_Intensity_gCO2_per_kWh',
            'hour', 'minute', 'time_minutes'
        ]

        for col in required_columns:
            assert col in forecast_df.columns

    def test_get_forecast_data_24_hours(self):
        """Test that forecast data contains 24 hours"""
        forecast_df = get_forecast_data()

        assert len(forecast_df) == 24

        # Check that timestamps are consecutive hours
        timestamps = forecast_df['ds'].tolist()
        for i in range(1, len(timestamps)):
            time_diff = (timestamps[i] - timestamps[i-1]).total_seconds() / 3600
            assert time_diff == 1.0  # 1 hour difference

    def test_get_forecast_data_positive_values(self):
        """Test that forecast data contains positive values"""
        forecast_df = get_forecast_data()

        # Load should be positive
        assert (forecast_df['Forecast_Load_MW'] > 0).all()

        # Carbon intensity should be non-negative
        assert (forecast_df['Carbon_Intensity_gCO2_per_kWh'] >= 0).all()


class TestDataFiles:
    """Test that required data files exist and are valid"""

    def test_seasonal_baseline_exists(self):
        """Test that seasonal baseline file exists"""
        seasonal_file = Path("outputs/seasonal_baseline.json")
        assert seasonal_file.exists()

        # Test that it's valid JSON
        with open(seasonal_file, 'r') as f:
            data = json.load(f)

        # Should have 12 months (1-12)
        assert isinstance(data, dict)
        assert len(data) == 12
        for month in range(1, 13):
            assert str(month) in data or month in data

    def test_model_file_exists(self):
        """Test that trained model file exists"""
        model_file = Path("outputs/aura_model.joblib")
        assert model_file.exists()

    def test_csv_data_files_exist(self):
        """Test that required CSV data files exist"""
        data_file = Path("data/hourly_load_data.csv")
        energy_file = Path("data/energy_sources_data.csv")

        assert data_file.exists()
        assert energy_file.exists()

        # Test that CSV files are readable
        df1 = pd.read_csv(data_file, nrows=5)
        assert len(df1) > 0

        df2 = pd.read_csv(energy_file, nrows=5)
        assert len(df2) > 0
