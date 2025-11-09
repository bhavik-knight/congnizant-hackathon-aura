# AURA Backend Tests

This directory contains comprehensive tests for the AURA energy optimization backend API.

## Test Structure

```
tests/
├── conftest.py          # Shared test fixtures and configuration
├── test_api.py          # API endpoint tests
├── test_utils.py        # Utility function tests
└── test_ml_models.py    # ML model and script tests
```

## Running Tests

### Run all tests
```bash
pytest
```

### Run with verbose output
```bash
pytest -v
```

### Run specific test file
```bash
pytest tests/test_api.py
```

### Run specific test class
```bash
pytest tests/test_api.py::TestPredictDemand
```

### Run specific test method
```bash
pytest tests/test_api.py::TestPredictDemand::test_predict_demand_success
```

### Run tests with coverage
```bash
pytest --cov=backend --cov-report=html
```

## Test Categories

### API Tests (`test_api.py`)
- **PredictDemand**: Tests for `/api/predict-demand` endpoint (Scenario 1)
- **FindGreenWindows**: Tests for `/api/find-green-windows` endpoint (Scenario 2)
- **OptimizeWindows**: Tests for `/api/optimize-windows` endpoint (Scenario 3)
- **AvailableTimeRanges**: Tests for predefined time range suggestions
- **ScheduleAppliances**: Tests for appliance scheduling
- **ComputeGreenWindow**: Tests for ML computation endpoint
- **Forecast24h**: Tests for 24-hour forecast retrieval
- **HealthCheck**: Tests for root endpoint

### Utility Tests (`test_utils.py`)
- **TimeUtilities**: Time conversion functions
- **EnergyCalculations**: CO2 savings and renewable percentage calculations
- **ForecastData**: Forecast data generation and validation
- **DataFiles**: Required data file existence and validity

### ML Model Tests (`test_ml_models.py`)
- **MLScripts**: Tests that ML training and computation scripts run successfully
- **OutputFiles**: Validation of output file structure and content

## Test Fixtures

### `client`
FastAPI TestClient instance for making API requests

### `sample_forecast_data`
Sample data for testing forecast optimization endpoints

### `sample_schedule_data`
Sample data for testing appliance scheduling

## Prerequisites

Make sure you have the required dependencies installed:

```bash
uv sync
```

## Data Requirements

Tests expect the following data files to exist:
- `data/hourly_load_data.csv`
- `data/energy_sources_data.csv`

And will generate these output files during testing:
- `outputs/aura_model.joblib`
- `outputs/seasonal_baseline.json`
- `outputs/aura_forecast_24h_with_carbon.csv`
- `outputs/aura_green_window.json`
- `outputs/complete_window_classification.json`

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    uv sync
    pytest --cov=backend --cov-report=xml
```

## Test Coverage

The tests cover:
- ✅ All API endpoints with success and error cases
- ✅ Input validation and error handling
- ✅ Data structure validation
- ✅ ML model execution and output validation
- ✅ Utility function correctness
- ✅ File I/O operations

## Adding New Tests

When adding new API endpoints or functionality:

1. Add corresponding test methods to `test_api.py`
2. Update fixtures in `conftest.py` if needed
3. Add utility tests to `test_utils.py` for new helper functions
4. Add ML tests to `test_ml_models.py` for new model scripts

## Troubleshooting

### Common Issues

1. **Missing data files**: Ensure CSV data files exist in `data/` directory
2. **Import errors**: Make sure you're running tests from the project root
3. **Model not found**: Run the model training script first if needed

### Debug Mode

Run tests with detailed output:
```bash
pytest -v -s --tb=long
```
