# AURA Backend API

A FastAPI-based backend service for the AURA (AI-powered Utility Resource Advisor) energy optimization system. This API provides endpoints for optimizing energy usage based on carbon intensity forecasts and user preferences.

## Overview

The AURA backend integrates machine learning models to forecast energy demand and carbon intensity, then provides optimized time windows for running appliances when renewable energy is most available and carbon emissions are lowest.

## Features

- **Energy Forecasting**: Uses trained ML models to predict 24-hour energy demand and carbon intensity
- **Green Window Optimization**: Identifies optimal time windows for appliance usage
- **Appliance Scheduling**: Validates and schedules appliance usage in optimal windows
- **Time Range Management**: Handles complex time ranges including overnight spans
- **Carbon Savings Calculation**: Estimates CO2 savings based on appliance energy consumption

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **Pydantic**: Data validation and serialization
- **Pandas/NumPy**: Data processing and analysis
- **Joblib**: ML model loading and prediction
- **Statsmodels**: Time series forecasting
- **Uvicorn**: ASGI server for production deployment

## Project Structure

```
backend/
├── main.py          # FastAPI application and endpoints
├── models.py        # Pydantic models for requests/responses
└── README.md        # This file
```

## Installation

### Prerequisites

- Python 3.13+
- uv package manager

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd aura
```

2. Install dependencies:
```bash
uv sync
```

## Running the Application

### Development

```bash
uv run python -m backend.main
```

The API will be available at `http://localhost:8000`

### Production

```bash
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. Health Check
**GET /**

Returns the API status and version information.

**Response:**
```json
{
  "message": "AURA Energy Optimization API",
  "status": "running"
}
```

#### 2. Optimize Windows
**POST /api/optimize-windows**

Gets optimized green windows based on user time preferences and appliance requirements.

**Request Body:**
```json
{
  "start_time": "18:00",
  "end_time": "08:00",
  "number_of_windows": 3,
  "appliances": ["washer", "dryer", "ev_charger"]
}
```

**Parameters:**
- `start_time`: Start time in HH:MM format (24-hour)
- `end_time`: End time in HH:MM format (24-hour, can span midnight)
- `number_of_windows`: Number of optimal windows to return (1-10)
- `appliances`: Optional list of appliances to consider

**Response:**
```json
{
  "success": true,
  "data": {
    "optimal_windows": [
      {
        "start_time": "02:00",
        "end_time": "03:00",
        "carbon_intensity": 404.1,
        "renewable_percentage": 65.2,
        "appliances": ["washer", "dryer"],
        "energy_savings_kg": 2.1
      }
    ],
    "total_carbon_savings": 4.2,
    "time_range_used": "18:00 - 08:00",
    "baseline_threshold": 409.8,
    "window_breakdown": {
      "green_windows": 2,
      "dirty_windows": 1
    }
  },
  "message": "Found 3 optimal windows (2 green, 1 dirty)"
}
```

#### 3. Available Time Ranges
**GET /api/available-time-ranges**

Returns predefined time range suggestions for common use cases.

**Response:**
```json
{
  "success": true,
  "data": {
    "time_ranges": [
      {"label": "Evening (6PM-12AM)", "start": "18:00", "end": "00:00"},
      {"label": "Overnight (10PM-8AM)", "start": "22:00", "end": "08:00"},
      {"label": "Morning (6AM-12PM)", "start": "06:00", "end": "12:00"},
      {"label": "Afternoon (12PM-6PM)", "start": "12:00", "end": "18:00"},
      {"label": "All Day (12AM-12AM)", "start": "00:00", "end": "00:00"}
    ]
  }
}
```

#### 4. Schedule Appliances
**POST /api/schedule-appliances**

Finalizes and schedules appliances in optimal windows with user preferences.

**Request Body:**
```json
{
  "schedule": [
    {
      "appliance": "washer",
      "window_start": "02:00",
      "window_end": "03:00",
      "duration_minutes": 60
    }
  ],
  "user_preferences": {
    "allow_overnight": true,
    "max_carbon_intensity": 200
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scheduled_tasks": [
      {
        "appliance": "washer",
        "scheduled_start": "02:00",
        "scheduled_end": "03:00",
        "duration_minutes": 60,
        "estimated_savings_kg": 0.3,
        "carbon_intensity": 404.1,
        "window_type": "green_window"
      }
    ],
    "total_carbon_savings": 3.8,
    "confirmation_id": "sched_12345",
    "baseline_threshold": 409.8,
    "window_breakdown": {
      "green_windows": 1,
      "dirty_windows": 0
    }
  },
  "message": "Successfully scheduled 1 appliance (1 in green windows, 0 in dirty windows)"
}
```

#### 5. Compute Green Window
**POST /api/compute-green-window**

Triggers computation of the optimal green energy window using ML models and returns the results. This endpoint runs the green window computation script and provides the latest optimal time window data.

**Request Body:**
None required (empty POST request)

**Response:**
```json
{
  "success": true,
  "data": {
    "green_window": {
      "start_time": "2025-01-01T02:00:00",
      "end_time": "2025-01-01T05:00:00",
      "average_carbon_intensity": 404.91,
      "duration_hours": 4,
      "baseline_threshold": 409.8,
      "window_type": "green_window",
      "hourly_data": [
        {
          "ds": "2025-01-01T02:00:00",
          "forecast_load_mw": 1203.5,
          "renewable_baseload_mw": 499.4,
          "fossil_fuel_mw": 704.1,
          "carbon_intensity_gco2_per_kwh": 409.53,
          "window_type": "green_window"
        }
      ]
    },
    "complete_forecast": {
      "forecast_period": {
        "start": "2025-01-01T00:00:00",
        "end": "2025-01-01T23:00:00",
        "baseline_threshold": 409.8,
        "current_month": 11
      },
      "hourly_classifications": [
        {
          "timestamp": "2025-01-01T00:00:00",
          "hour": 0,
          "forecast_load_mw": 1261.23,
          "carbon_intensity_gco2_per_kwh": 422.83,
          "window_type": "dirty_window"
        }
      ]
    },
    "computation_timestamp": "2025-11-09T10:30:00",
    "status": "computed"
  },
  "message": "Successfully computed green window for 4 hours"
}
```

#### 6. Get 24-Hour Forecast
**GET /api/forecast-24h**

Retrieves the latest 24-hour carbon intensity forecast data for visualization and analysis. This endpoint returns pre-computed data without running ML calculations.

**Request Body:**
None required (GET request)

**Response:**
```json
{
  "success": true,
  "data": {
    "forecast_period": {
      "start": "2025-01-01T00:00:00",
      "end": "2025-01-01T23:00:00",
      "baseline_threshold": 409.8,
      "current_month": 11
    },
    "hourly_data": [
      {
        "timestamp": "2025-01-01T00:00:00",
        "hour": 0,
        "forecast_load_mw": 1261.23,
        "renewable_baseload_mw": 499.4,
        "fossil_fuel_mw": 761.83,
        "carbon_intensity_gco2_per_kwh": 422.83,
        "window_type": "dirty_window"
      }
    ],
    "summary": {
      "total_hours": 24,
      "green_windows": 4,
      "dirty_windows": 20,
      "avg_carbon_intensity": 415.67,
      "min_carbon_intensity": 402.21,
      "max_carbon_intensity": 461.47
    }
  },
  "message": "Retrieved 24-hour forecast with 4 green windows and 20 dirty windows"
}
```

This endpoint is perfect for displaying carbon intensity charts, green vs dirty window visualizations, and 24-hour forecast analysis in the frontend.

## Data Models

### Request Models

#### OptimizeRequest
```python
class OptimizeRequest(BaseModel):
    start_time: str  # HH:MM format, validated regex
    end_time: str    # HH:MM format, validated regex
    number_of_windows: int  # 1-10
    appliances: Optional[List[str]] = None
```

#### ScheduleAppliancesRequest
```python
class ScheduleAppliancesRequest(BaseModel):
    schedule: List[ApplianceSchedule]
    user_preferences: UserPreferences
```

### Response Models

#### TimeWindow
```python
class TimeWindow(BaseModel):
    start_time: str
    end_time: str
    carbon_intensity: float
    renewable_percentage: float
    appliances: List[str]
    energy_savings_kg: float
```

#### Standard Response Format
All endpoints return responses in this format:
```python
class StandardResponse(BaseModel):
    success: bool
    data: dict
    message: str
```

## Appliance Energy Consumption

The API uses these approximate energy consumption rates (kWh/hour):

| Appliance | Consumption (kWh/h) |
|-----------|-------------------|
| Washer | 0.5 |
| Dryer | 3.0 |
| Dishwasher | 1.8 |
| EV Charger | 7.2 |
| Oven | 2.3 |
| Microwave | 1.2 |
| Refrigerator | 0.1 |
| AC | 1.5 |
| Heater | 1.5 |
| Water Heater | 4.0 |

## ML Model Integration

The backend integrates with pre-trained ML models located in `../ml_models/`:

- `aura_model.joblib`: Trained forecasting model
- `seasonal_baseline.json`: Seasonal baseline data
- `hourly_load_data.csv`: Historical load data

The system generates 24-hour forecasts and identifies optimal time windows based on:
- Carbon intensity (gCO2/kWh)
- Renewable energy percentage
- Historical patterns and seasonal baselines

## Error Handling

The API uses standard HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid input)
- `500`: Internal Server Error (forecast/model issues)

Error responses include detailed messages for debugging.

## Development

### Testing

Run the API and test endpoints:

```bash
# Start the server
uv run python -m backend.main

# Test health endpoint
curl http://localhost:8000/

# Test with sample data
curl -X POST http://localhost:8000/api/optimize-windows \
  -H "Content-Type: application/json" \
  -d '{"start_time": "18:00", "end_time": "08:00", "number_of_windows": 2}'
```

### Interactive API Documentation

When running the server, visit `http://localhost:8000/docs` for interactive Swagger UI documentation.

## Deployment

### Docker (if applicable)

```dockerfile
FROM python:3.13-slim

WORKDIR /app
COPY . .
RUN pip install -r requirements.txt

EXPOSE 8000
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables

- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: 0.0.0.0)

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new endpoints
3. Update documentation for API changes
4. Ensure backward compatibility

## License

[Add license information here]</content>
<parameter name="filePath">/home/bhavik/Desktop/aura/backend/README.md
