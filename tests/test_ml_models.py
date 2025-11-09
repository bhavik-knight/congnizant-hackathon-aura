import pytest
import subprocess
import json
import pandas as pd
from pathlib import Path


class TestMLScripts:
    """Test ML model training and computation scripts"""

    def test_demand_forecast_model_trainer(self):
        """Test that the demand forecast model trainer runs successfully"""
        script_path = Path("ml_models/demand_forecast_model_trainer.py")

        # Run the script
        result = subprocess.run(
            ["python", str(script_path)],
            capture_output=True,
            text=True,
            cwd=Path(".")
        )

        # Should complete successfully
        assert result.returncode == 0

        # Check that model file was created
        model_file = Path("outputs/aura_model.joblib")
        assert model_file.exists()

        # Check that output contains success message
        assert "Success! Model saved" in result.stdout

    def test_seasonal_supply_model_builder(self):
        """Test that the seasonal supply model builder runs successfully"""
        script_path = Path("ml_models/seasonal_supply_model_builder.py")

        # Run the script
        result = subprocess.run(
            ["python", str(script_path)],
            capture_output=True,
            text=True,
            cwd=Path(".")
        )

        # Should complete successfully
        assert result.returncode == 0

        # Check that seasonal baseline file was created
        baseline_file = Path("outputs/seasonal_baseline.json")
        assert baseline_file.exists()

        # Check that output contains success message
        assert "Success! Created" in result.stdout

        # Verify the JSON content
        with open(baseline_file, 'r') as f:
            data = json.load(f)

        assert isinstance(data, dict)
        assert len(data) == 12  # 12 months

    def test_compute_green_window(self):
        """Test that the green window computation runs successfully"""
        script_path = Path("ml_models/compute_green_window.py")

        # Run the script
        result = subprocess.run(
            ["python", str(script_path)],
            capture_output=True,
            text=True,
            cwd=Path(".")
        )

        # Should complete successfully
        assert result.returncode == 0

        # Check that output files were created
        csv_file = Path("outputs/aura_forecast_24h_with_carbon.csv")
        json_file = Path("outputs/aura_green_window.json")
        complete_file = Path("outputs/complete_window_classification.json")

        assert csv_file.exists()
        assert json_file.exists()
        assert complete_file.exists()

        # Check that output contains success messages
        assert "Wrote" in result.stdout

        # Verify CSV content
        df = pd.read_csv(csv_file)
        assert len(df) == 24  # 24 hours
        assert "window_type" in df.columns

        # Verify JSON content
        with open(json_file, 'r') as f:
            data = json.load(f)
        assert "start" in data
        assert "end" in data
        assert "window_type" in data

        # Verify complete classification content
        with open(complete_file, 'r') as f:
            data = json.load(f)
        assert "forecast_period" in data
        assert "hourly_classifications" in data
        assert len(data["hourly_classifications"]) == 24


class TestOutputFiles:
    """Test the structure and content of output files"""

    def test_csv_forecast_structure(self):
        """Test CSV forecast file structure"""
        csv_file = Path("outputs/aura_forecast_24h_with_carbon.csv")
        assert csv_file.exists()

        df = pd.read_csv(csv_file)

        # Should have 24 rows (hours)
        assert len(df) == 24

        # Check required columns
        required_columns = [
            'ds', 'Forecast_Load_MW', 'Renewable_Baseload_MW',
            'Fossil_Fuel_MW', 'Carbon_Intensity_gCO2_per_kWh', 'window_type'
        ]

        for col in required_columns:
            assert col in df.columns

    def test_green_window_json_structure(self):
        """Test green window JSON file structure"""
        json_file = Path("outputs/aura_green_window.json")
        assert json_file.exists()

        with open(json_file, 'r') as f:
            data = json.load(f)

        # Check required fields
        required_fields = [
            'start', 'end', 'avg_carbon_intensity_gco2_per_kwh',
            'length_hours', 'baseline_threshold', 'window_type', 'rows'
        ]

        for field in required_fields:
            assert field in data

        # Check rows structure
        assert isinstance(data['rows'], list)
        if data['rows']:
            row = data['rows'][0]
            assert 'ds' in row
            assert 'forecast_load_mw' in row
            assert 'carbon_intensity_gco2_per_kwh' in row

    def test_complete_classification_structure(self):
        """Test complete classification JSON file structure"""
        json_file = Path("outputs/complete_window_classification.json")
        assert json_file.exists()

        with open(json_file, 'r') as f:
            data = json.load(f)

        # Check required fields
        assert 'forecast_period' in data
        assert 'hourly_classifications' in data

        # Check forecast period
        period = data['forecast_period']
        assert 'start' in period
        assert 'end' in period
        assert 'baseline_threshold' in period

        # Check hourly classifications
        classifications = data['hourly_classifications']
        assert len(classifications) == 24

        # Check first classification
        if classifications:
            classification = classifications[0]
            required_fields = [
                'timestamp', 'hour', 'forecast_load_mw',
                'carbon_intensity_gco2_per_kwh', 'window_type'
            ]
            for field in required_fields:
                assert field in classification
