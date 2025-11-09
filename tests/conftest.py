import pytest
import sys
from pathlib import Path

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.main import app
from fastapi.testclient import TestClient


@pytest.fixture
def client():
    """FastAPI test client fixture"""
    return TestClient(app)


@pytest.fixture
def sample_forecast_data():
    """Sample forecast data for testing"""
    return {
        "start_time": "06:00",
        "end_time": "18:00",
        "number_of_windows": 2,
        "appliances": ["washer", "dryer"]
    }


@pytest.fixture
def sample_schedule_data():
    """Sample appliance scheduling data for testing"""
    return {
        "schedule": [
            {
                "appliance": "washer",
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
