import pytest
from fastapi.testclient import TestClient


class TestPredictDemand:
    """Test cases for /api/predict-demand endpoint (Scenario 1)"""

    def test_predict_demand_success(self, client: TestClient):
        """Test successful demand prediction"""
        response = client.get("/api/predict-demand")

        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert "data" in data
        assert "message" in data

        # Check response structure
        forecast_data = data["data"]
        assert "forecast_period" in forecast_data
        assert "hourly_forecast" in forecast_data
        assert "summary" in forecast_data

        # Check summary data
        summary = forecast_data["summary"]
        assert "total_hours" in summary
        assert "avg_demand_mw" in summary
        assert "avg_carbon_intensity" in summary
        assert "green_windows" in summary
        assert "dirty_windows" in summary

        # Check that we have 24 hours of data
        assert summary["total_hours"] == 24
        assert len(forecast_data["hourly_forecast"]) == 24

    def test_predict_demand_hourly_data_structure(self, client: TestClient):
        """Test that hourly forecast data has correct structure"""
        response = client.get("/api/predict-demand")
        assert response.status_code == 200

        data = response.json()
        hourly_data = data["data"]["hourly_forecast"][0]  # Check first hour

        required_fields = [
            "timestamp", "hour", "demand_mw", "renewable_baseload_mw",
            "fossil_fuel_mw", "carbon_intensity_gco2_per_kwh", "window_type"
        ]

        for field in required_fields:
            assert field in hourly_data


class TestFindGreenWindows:
    """Test cases for /api/find-green-windows endpoint (Scenario 2)"""

    def test_find_green_windows_with_green_available(self, client: TestClient):
        """Test finding green windows when they are available"""
        response = client.get("/api/find-green-windows")

        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert "green_windows" in data["data"] or "fallback_windows" in data["data"]

        response_data = data["data"]

        if "green_windows" in response_data:
            # Green windows found
            assert len(response_data["green_windows"]) > 0
            assert response_data["fallback_available"] is False

            # Check window structure
            window = response_data["green_windows"][0]
            assert "start_time" in window
            assert "end_time" in window
            assert "carbon_intensity" in window
            assert "window_type" in window
            assert window["window_type"] == "green_window"

        elif "fallback_windows" in response_data:
            # Fallback windows (least carbon intensive)
            assert len(response_data["fallback_windows"]) > 0
            assert response_data["fallback_available"] is True
            assert "fallback_reason" in response_data


class TestOptimizeWindows:
    """Test cases for /api/optimize-windows endpoint (Scenario 3)"""

    def test_optimize_windows_with_filters(self, client: TestClient, sample_forecast_data):
        """Test optimizing windows with time and count filters"""
        response = client.post("/api/optimize-windows", json=sample_forecast_data)

        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert "optimal_windows" in data["data"]
        assert len(data["data"]["optimal_windows"]) <= sample_forecast_data["number_of_windows"]

        # Check window structure
        if data["data"]["optimal_windows"]:
            window = data["data"]["optimal_windows"][0]
            assert "start_time" in window
            assert "end_time" in window
            assert "carbon_intensity" in window
            assert "appliances" in window

    def test_optimize_windows_invalid_time_format(self, client: TestClient):
        """Test error handling for invalid time format"""
        invalid_data = {
            "start_time": "25:00",  # Invalid hour
            "end_time": "18:00",
            "number_of_windows": 2
        }

        response = client.post("/api/optimize-windows", json=invalid_data)
        assert response.status_code == 422  # Validation error

    def test_optimize_windows_missing_required_fields(self, client: TestClient):
        """Test error handling for missing required fields"""
        incomplete_data = {
            "start_time": "06:00"
            # Missing end_time and number_of_windows
        }

        response = client.post("/api/optimize-windows", json=incomplete_data)
        assert response.status_code == 422  # Validation error


class TestAvailableTimeRanges:
    """Test cases for /api/available-time-ranges endpoint"""

    def test_get_available_time_ranges(self, client: TestClient):
        """Test getting predefined time ranges"""
        response = client.get("/api/available-time-ranges")

        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert "time_ranges" in data["data"]

        time_ranges = data["data"]["time_ranges"]
        assert len(time_ranges) > 0

        # Check structure of first time range
        time_range = time_ranges[0]
        assert "label" in time_range
        assert "start" in time_range
        assert "end" in time_range


class TestScheduleAppliances:
    """Test cases for /api/schedule-appliances endpoint"""

    def test_schedule_appliances_success(self, client: TestClient, sample_schedule_data):
        """Test successful appliance scheduling"""
        response = client.post("/api/schedule-appliances", json=sample_schedule_data)

        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert "scheduled_tasks" in data["data"]
        assert "confirmation_id" in data["data"]

    def test_schedule_appliances_invalid_appliance(self, client: TestClient):
        """Test scheduling with invalid appliance data"""
        invalid_data = {
            "schedule": [
                {
                    "appliance": "nonexistent_appliance",
                    "window_start": "14:00",
                    "window_end": "15:00",
                    "duration_minutes": 60
                }
            ],
            "user_preferences": {
                "allow_overnight": False,
                "max_carbon_intensity": 500.0
            }
        }

        response = client.post("/api/schedule-appliances", json=invalid_data)
        # Should still work but might have empty results
        assert response.status_code in [200, 400]


class TestComputeGreenWindow:
    """Test cases for /api/compute-green-window endpoint"""

    def test_compute_green_window_success(self, client: TestClient):
        """Test successful green window computation"""
        response = client.post("/api/compute-green-window")

        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert "green_window" in data["data"]
        assert "complete_forecast" in data["data"]

        green_window = data["data"]["green_window"]
        assert "start_time" in green_window
        assert "end_time" in green_window
        assert "average_carbon_intensity" in green_window
        assert "duration_hours" in green_window


class TestForecast24h:
    """Test cases for /api/forecast-24h endpoint"""

    def test_get_forecast_24h_after_computation(self, client: TestClient):
        """Test getting 24h forecast after computation"""
        # First compute the green window to generate data
        compute_response = client.post("/api/compute-green-window")
        assert compute_response.status_code == 200

        # Then get the forecast
        response = client.get("/api/forecast-24h")

        assert response.status_code == 200
        data = response.json()

        assert data["success"] is True
        assert "hourly_data" in data["data"]
        assert "summary" in data["data"]

        summary = data["data"]["summary"]
        assert "total_hours" in summary
        assert "green_windows" in summary
        assert "dirty_windows" in summary

    def test_get_forecast_24h_without_computation(self, client: TestClient):
        """Test getting forecast when no data is available"""
        # This might fail if no data exists, but let's see
        response = client.get("/api/forecast-24h")

        # Either succeeds (if data exists) or returns 404
        assert response.status_code in [200, 404]


class TestHealthCheck:
    """Test cases for health check endpoint"""

    def test_root_endpoint(self, client: TestClient):
        """Test the root health check endpoint"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()

        assert "message" in data
        assert "status" in data
        assert data["status"] == "running"
