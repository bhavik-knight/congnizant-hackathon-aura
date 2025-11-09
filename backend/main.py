from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.models import (
    OptimizeRequest, OptimizeResponse, TimeWindow,
    AvailableTimeRangesResponse, TimeRange,
    ScheduleAppliancesRequest, ScheduleAppliancesResponse,
    GreenWindowRequest, GreenWindow, GreenWindowsResponse, PredictDemandResponse
)
import json
import os
import time
import pandas as pd
import numpy as np
from pathlib import Path
import joblib
import uuid
from typing import List
import subprocess

app = FastAPI(title="AURA Energy Optimization API", version="1.0.0")

origins = [
    "http://localhost",
    "http://localhost:3000",  # Allow your frontend origin
    "http://localhost:5173",  # Vite dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
ROOT = Path(__file__).parent.parent
DATA = ROOT / 'data' / 'hourly_load_data.csv'
MODEL = ROOT / 'outputs' / 'aura_model.joblib'
SEASONAL = ROOT / 'outputs' / 'seasonal_baseline.json'

# Appliance energy consumption (kWh per hour) - approximate values
APPLIANCE_CONSUMPTION = {
    "washer": 0.5,
    "dryer": 3.0,
    "dishwasher": 1.8,
    "ev_charger": 7.2,
    "oven": 2.3,
    "microwave": 1.2,
    "refrigerator": 0.1,
    "ac": 1.5,
    "heater": 1.5,
    "water_heater": 4.0
}

def time_to_minutes(time_str: str) -> int:
    """Convert HH:MM to minutes since midnight"""
    hours, minutes = map(int, time_str.split(':'))
    return hours * 60 + minutes

def minutes_to_time(minutes: int) -> str:
    """Convert minutes since midnight to HH:MM"""
    hours = minutes // 60 % 24
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}"

def load_load_series():
    """Load and preprocess load data"""
    if not DATA.exists():
        raise FileNotFoundError(DATA)
    # Simplified version - assuming standard format
    df = pd.read_csv(DATA)
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

def get_forecast_data():
    """Get 24-hour forecast data"""
    try:
        # Load data
        df = load_load_series()

        # Load seasonal baseline
        with open(SEASONAL, 'r') as f:
            seasonal = json.load(f)

        # Load model
        results = joblib.load(MODEL)

        # Forecast next 24 hours
        steps = 24
        forecast_res = results.get_forecast(steps=steps)
        forecast_mean = forecast_res.predicted_mean

        last_ts = df.index.max()
        future_index = pd.date_range(start=last_ts + pd.Timedelta(hours=1), periods=steps, freq='h')
        forecast_df = pd.DataFrame({'ds': future_index, 'Forecast_Load_MW': np.round(forecast_mean.values, 2)})

        # Map seasonal baseline per month
        def baseline_for_ts(ts):
            m = ts.month
            return float(seasonal.get(str(m)) or seasonal.get(m) or 0.0)

        forecast_df['Renewable_Baseload_MW'] = forecast_df['ds'].map(baseline_for_ts).astype(float)
        forecast_df['Fossil_Fuel_MW'] = forecast_df['Forecast_Load_MW'] - forecast_df['Renewable_Baseload_MW']
        forecast_df['Fossil_Fuel_MW'] = forecast_df['Fossil_Fuel_MW'].clip(lower=0.0)

        # Compute carbon intensity (gCO2/kWh)
        def compute_ci(row):
            load = row['Forecast_Load_MW']
            if load <= 0:
                return np.nan
            fossil = row['Fossil_Fuel_MW']
            return (fossil * 700.0) / load

        forecast_df['Carbon_Intensity_gCO2_per_kWh'] = forecast_df.apply(compute_ci, axis=1)

        # Add hour of day for filtering
        forecast_df['hour'] = forecast_df['ds'].dt.hour
        forecast_df['minute'] = forecast_df['ds'].dt.minute
        forecast_df['time_minutes'] = forecast_df['hour'] * 60 + forecast_df['minute']

        return forecast_df

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate forecast: {str(e)}")

def calculate_energy_savings(carbon_intensity: float, appliances: List[str], duration_hours: float) -> float:
    """Calculate CO2 savings in kg for given appliances and duration"""
    total_kwh = sum(APPLIANCE_CONSUMPTION.get(app, 1.0) for app in appliances) * duration_hours
    return (carbon_intensity * total_kwh) / 1000

def calculate_renewable_percentage(row) -> float:
    """Calculate renewable percentage"""
    load = row['Forecast_Load_MW']
    renewable = row['Renewable_Baseload_MW']
    return (renewable / load * 100) if load > 0 else 0

@app.get("/api/predict-demand", response_model=PredictDemandResponse)
async def predict_demand():
    """
    Scenario 1: Predict next 24 hours demand with carbon intensity.
    Generates fresh forecast data and returns it.
    """
    try:
        # Check if we have cached forecast data that's less than 15 minutes old
        cache_file = Path(__file__).parent / '.forecast_cache.json'
        if cache_file.exists():
            cache_age = time.time() - cache_file.stat().st_mtime
            if cache_age < 900:  # 15 minutes in seconds
                with open(cache_file, 'r') as f:
                    return PredictDemandResponse(**json.load(f))

        # Generate fresh forecast data
        forecast_df = get_forecast_data()

        # Get current month baseline
        current_month = pd.Timestamp.now().month
        seasonal = json.loads((ROOT / 'outputs' / 'seasonal_baseline.json').read_text())
        baseline_value = float(seasonal.get(str(current_month)) or seasonal.get(current_month) or 0.0)

        # Classify windows
        forecast_df['window_type'] = forecast_df['Carbon_Intensity_gCO2_per_kWh'].apply(
            lambda ci: 'green_window' if ci < baseline_value else 'dirty_window'
        )

        # Prepare response data
        hourly_data = []
        for _, row in forecast_df.iterrows():
            hourly_data.append({
                "timestamp": row['ds'].isoformat(),
                "hour": row['ds'].hour,
                "demand_mw": round(row['Forecast_Load_MW'], 2),
                "renewable_baseload_mw": round(row['Renewable_Baseload_MW'], 2),
                "fossil_fuel_mw": round(row['Fossil_Fuel_MW'], 2),
                "carbon_intensity_gco2_per_kwh": round(row['Carbon_Intensity_gCO2_per_kWh'], 2),
                "window_type": row['window_type']
            })

        response_data = {
            "forecast_period": {
                "start": forecast_df['ds'].min().isoformat(),
                "end": forecast_df['ds'].max().isoformat(),
                "baseline_threshold": baseline_value,
                "current_month": current_month
            },
            "hourly_forecast": hourly_data,
            "summary": {
                "total_hours": len(hourly_data),
                "avg_demand_mw": round(forecast_df['Forecast_Load_MW'].mean(), 2),
                "avg_carbon_intensity": round(forecast_df['Carbon_Intensity_gCO2_per_kWh'].mean(), 2),
                "green_windows": sum(1 for h in hourly_data if h["window_type"] == "green_window"),
                "dirty_windows": sum(1 for h in hourly_data if h["window_type"] == "dirty_window")
            }
        }

        response = PredictDemandResponse(
            success=True,
            data=response_data,
            message="Successfully predicted 24-hour demand with carbon intensity"
        )

        # Cache the response
        cache_file = Path(__file__).parent / '.forecast_cache.json'
        with open(cache_file, 'w') as f:
            json.dump(response.model_dump(), f)

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to predict demand: {str(e)}")

@app.get("/api/find-green-windows", response_model=GreenWindowsResponse)
async def find_green_windows():
    """
    Scenario 2: Find green windows without filters.
    Shows green windows only, or offers least carbon intensive windows if none found.
    """
    try:
        # Get forecast data
        forecast_df = get_forecast_data()

        # Get current month baseline
        current_month = pd.Timestamp.now().month
        seasonal = json.loads((ROOT / 'outputs' / 'seasonal_baseline.json').read_text())
        baseline_value = float(seasonal.get(str(current_month)) or seasonal.get(current_month) or 0.0)

        # Classify all windows
        forecast_df['window_type'] = forecast_df['Carbon_Intensity_gCO2_per_kWh'].apply(
            lambda ci: 'green_window' if ci < baseline_value else 'dirty_window'
        )

        # Find green windows
        green_windows_df = forecast_df[forecast_df['window_type'] == 'green_window'].copy()

        if len(green_windows_df) > 0:
            # Return green windows
            green_windows = []
            for _, row in green_windows_df.iterrows():
                window_start = minutes_to_time(int(row['time_minutes']))
                window_end_minutes = (row['time_minutes'] + 60) % (24 * 60)
                window_end = minutes_to_time(window_end_minutes)

                renewable_pct = calculate_renewable_percentage(row)

                window = GreenWindow(
                    start_time=window_start,
                    end_time=window_end,
                    carbon_intensity=round(row['Carbon_Intensity_gCO2_per_kWh'], 1),
                    renewable_percentage=round(renewable_pct, 1),
                    window_type="green_window"
                )
                green_windows.append(window)

            response_data = {
                "green_windows": [w.model_dump() for w in green_windows],
                "baseline_threshold": baseline_value,
                "total_green_windows": len(green_windows),
                "fallback_available": False
            }

            return GreenWindowsResponse(
                success=True,
                data=response_data,
                message=f"Found {len(green_windows)} green windows available"
            )

        else:
            # No green windows found - offer least carbon intensive
            least_carbon_windows = forecast_df.nsmallest(3, 'Carbon_Intensity_gCO2_per_kWh').copy()

            fallback_windows = []
            for _, row in least_carbon_windows.iterrows():
                window_start = minutes_to_time(int(row['time_minutes']))
                window_end_minutes = (row['time_minutes'] + 60) % (24 * 60)
                window_end = minutes_to_time(window_end_minutes)

                renewable_pct = calculate_renewable_percentage(row)

                window = GreenWindow(
                    start_time=window_start,
                    end_time=window_end,
                    carbon_intensity=round(row['Carbon_Intensity_gCO2_per_kWh'], 1),
                    renewable_percentage=round(renewable_pct, 1),
                    window_type="dirty_window"
                )
                fallback_windows.append(window)

            response_data = {
                "fallback_windows": [w.model_dump() for w in fallback_windows],
                "baseline_threshold": baseline_value,
                "total_fallback_windows": len(fallback_windows),
                "fallback_available": True,
                "fallback_reason": "No green windows found for today"
            }

            return GreenWindowsResponse(
                success=True,
                data=response_data,
                message="No green windows found. Here are the 3 least carbon intensive windows available."
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to find green windows: {str(e)}")

@app.post("/api/optimize-windows", response_model=OptimizeResponse)
async def optimize_windows(request: OptimizeRequest):
    """
    Scenario 3: Find green windows with filters (start_time, end_time, number_of_windows).
    If no green windows found, offer least carbon intensive windows.
    """
    try:
        # Get forecast data
        forecast_df = get_forecast_data()

        # Get current month baseline for classification
        current_month = pd.Timestamp.now().month
        seasonal = json.loads((ROOT / 'outputs' / 'seasonal_baseline.json').read_text())
        baseline_value = float(seasonal.get(str(current_month)) or seasonal.get(current_month) or 0.0)

        # Classify all windows as green or dirty
        forecast_df['window_type'] = forecast_df['Carbon_Intensity_gCO2_per_kWh'].apply(
            lambda ci: 'green_window' if ci < baseline_value else 'dirty_window'
        )

        # Apply time filters
        start_minutes = time_to_minutes(request.start_time)
        end_minutes = time_to_minutes(request.end_time)

        # Handle overnight ranges
        if end_minutes <= start_minutes:
            mask = (forecast_df['time_minutes'] >= start_minutes) | (forecast_df['time_minutes'] <= end_minutes)
        else:
            mask = (forecast_df['time_minutes'] >= start_minutes) & (forecast_df['time_minutes'] <= end_minutes)

        filtered_df = forecast_df[mask].copy()

        if len(filtered_df) == 0:
            raise HTTPException(status_code=400, detail="No data available for the specified time range")

        # Find green windows in the filtered range
        green_windows_df = filtered_df[filtered_df['window_type'] == 'green_window'].copy()

        if len(green_windows_df) > 0:
            # Sort green windows by carbon intensity (lowest first)
            green_windows_df = green_windows_df.sort_values('Carbon_Intensity_gCO2_per_kWh')

            # Take top N green windows (or all if fewer than requested)
            num_windows = min(request.number_of_windows, len(green_windows_df))
            optimal_hours = green_windows_df.head(num_windows)

            optimal_windows = []
            total_savings = 0

            for _, row in optimal_hours.iterrows():
                window_start = minutes_to_time(int(row['time_minutes']))
                window_end_minutes = (row['time_minutes'] + 60) % (24 * 60)
                window_end = minutes_to_time(window_end_minutes)

                appliances = request.appliances or ["washer", "dryer"]
                duration_hours = 1.0
                savings = calculate_energy_savings(
                    row['Carbon_Intensity_gCO2_per_kWh'],
                    appliances,
                    duration_hours
                )

                renewable_pct = calculate_renewable_percentage(row)

                window = TimeWindow(
                    start_time=window_start,
                    end_time=window_end,
                    carbon_intensity=round(row['Carbon_Intensity_gCO2_per_kWh'], 1),
                    renewable_percentage=round(renewable_pct, 1),
                    appliances=appliances,
                    energy_savings_kg=round(savings, 1)
                )
                optimal_windows.append(window)
                total_savings += savings

            response_data = {
                "optimal_windows": [w.model_dump() for w in optimal_windows],
                "total_carbon_savings": round(total_savings, 1),
                "time_range_used": f"{request.start_time} - {request.end_time}",
                "baseline_threshold": baseline_value,
                "window_breakdown": {
                    "green_windows": len(optimal_windows),
                    "dirty_windows": 0
                },
                "fallback_available": False
            }

            return OptimizeResponse(
                success=True,
                data=response_data,
                message=f"Found {len(optimal_windows)} green windows in the specified time range"
            )

        else:
            # No green windows found - offer least carbon intensive windows from the filtered range
            least_carbon_windows = filtered_df.nsmallest(request.number_of_windows, 'Carbon_Intensity_gCO2_per_kWh').copy()

            optimal_windows = []
            total_savings = 0

            for _, row in least_carbon_windows.iterrows():
                window_start = minutes_to_time(int(row['time_minutes']))
                window_end_minutes = (row['time_minutes'] + 60) % (24 * 60)
                window_end = minutes_to_time(window_end_minutes)

                appliances = request.appliances or ["washer", "dryer"]
                duration_hours = 1.0
                savings = calculate_energy_savings(
                    row['Carbon_Intensity_gCO2_per_kWh'],
                    appliances,
                    duration_hours
                )

                renewable_pct = calculate_renewable_percentage(row)

                window = TimeWindow(
                    start_time=window_start,
                    end_time=window_end,
                    carbon_intensity=round(row['Carbon_Intensity_gCO2_per_kWh'], 1),
                    renewable_percentage=round(renewable_pct, 1),
                    appliances=appliances,
                    energy_savings_kg=round(savings, 1)
                )
                optimal_windows.append(window)
                total_savings += savings

            response_data = {
                "optimal_windows": [w.model_dump() for w in optimal_windows],
                "total_carbon_savings": round(total_savings, 1),
                "time_range_used": f"{request.start_time} - {request.end_time}",
                "baseline_threshold": baseline_value,
                "window_breakdown": {
                    "green_windows": 0,
                    "dirty_windows": len(optimal_windows)
                },
                "fallback_available": True,
                "fallback_reason": "No green windows found in the specified time range"
            }

            return OptimizeResponse(
                success=True,
                data=response_data,
                message=f"No green windows found. Showing {len(optimal_windows)} least carbon intensive windows instead."
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

@app.get("/api/available-time-ranges", response_model=AvailableTimeRangesResponse)
async def get_available_time_ranges():
    """Get predefined time range suggestions"""
    time_ranges = [
        TimeRange(label="Evening (6PM-12AM)", start="18:00", end="00:00"),
        TimeRange(label="Overnight (10PM-8AM)", start="22:00", end="08:00"),
        TimeRange(label="Morning (6AM-12PM)", start="06:00", end="12:00"),
        TimeRange(label="Afternoon (12PM-6PM)", start="12:00", end="18:00"),
        TimeRange(label="All Day (12AM-12AM)", start="00:00", end="00:00")
    ]

    return AvailableTimeRangesResponse(
        success=True,
        data={"time_ranges": [tr.model_dump() for tr in time_ranges]}
    )

@app.post("/api/schedule-appliances", response_model=ScheduleAppliancesResponse)
async def schedule_appliances(request: ScheduleAppliancesRequest):
    """Finalize and schedule appliances in optimal windows"""
    try:
        scheduled_tasks = []
        total_savings = 0
        confirmation_id = f"sched_{uuid.uuid4().hex[:8]}"

        # Get forecast data for validation
        forecast_df = get_forecast_data()

        # Get current month baseline for classification
        current_month = pd.Timestamp.now().month
        seasonal = json.loads((ROOT / 'outputs' / 'seasonal_baseline.json').read_text())
        baseline_value = float(seasonal.get(str(current_month)) or seasonal.get(current_month) or 0.0)

        # Classify all windows
        forecast_df['window_type'] = forecast_df['Carbon_Intensity_gCO2_per_kWh'].apply(
            lambda ci: 'green_window' if ci < baseline_value else 'dirty_window'
        )

        for item in request.schedule:
            window_start_minutes = time_to_minutes(item.window_start)
            window_end_minutes = time_to_minutes(item.window_end)

            if not request.user_preferences.allow_overnight:
                if window_end_minutes < window_start_minutes:
                    continue

            mask = forecast_df['time_minutes'] == window_start_minutes
            if not mask.any():
                continue

            row = forecast_df[mask].iloc[0]

            if row['Carbon_Intensity_gCO2_per_kWh'] > request.user_preferences.max_carbon_intensity:
                continue

            duration_hours = item.duration_minutes / 60.0
            savings = calculate_energy_savings(
                row['Carbon_Intensity_gCO2_per_kWh'],
                [item.appliance],
                duration_hours
            )

            task = {
                "appliance": item.appliance,
                "scheduled_start": item.window_start,
                "scheduled_end": item.window_end,
                "duration_minutes": item.duration_minutes,
                "estimated_savings_kg": round(savings, 2),
                "carbon_intensity": round(row['Carbon_Intensity_gCO2_per_kWh'], 1),
                "window_type": row['window_type']
            }
            scheduled_tasks.append(task)
            total_savings += savings

        # Count green vs dirty windows in scheduled tasks
        green_count = sum(1 for task in scheduled_tasks if task['window_type'] == 'green_window')
        dirty_count = len(scheduled_tasks) - green_count

        response_data = {
            "scheduled_tasks": scheduled_tasks,
            "total_carbon_savings": round(total_savings, 2),
            "confirmation_id": confirmation_id,
            "baseline_threshold": baseline_value,
            "window_breakdown": {
                "green_windows": green_count,
                "dirty_windows": dirty_count
            }
        }

        return ScheduleAppliancesResponse(
            success=True,
            data=response_data,
            message=f"Successfully scheduled {len(scheduled_tasks)} appliances ({green_count} in green windows, {dirty_count} in dirty windows)"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scheduling failed: {str(e)}")

@app.post("/api/compute-green-window")
async def compute_green_window():
    """
    Compute and return the optimal green energy window by running the ML model.
    This endpoint triggers the green window computation and returns the results.
    """
    try:
        # Path to the compute_green_window.py script
        script_path = ROOT / 'ml_models' / 'compute_green_window.py'

        if not script_path.exists():
            raise HTTPException(status_code=500, detail="Green window computation script not found")

        # Run the script to generate the green window JSON
        result = subprocess.run(
            ['python', str(script_path)],
            capture_output=True,
            text=True,
            cwd=ROOT
        )

        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Green window computation failed: {result.stderr}"
            )

        # Read the generated JSON file
        green_window_file = ROOT / 'outputs' / 'aura_green_window.json'

        if not green_window_file.exists():
            raise HTTPException(status_code=500, detail="Green window JSON file was not generated")

        with open(green_window_file, 'r') as f:
            green_window_data = json.load(f)

        # Also read the complete classification data for plotting
        complete_classification_file = ROOT / 'outputs' / 'complete_window_classification.json'
        complete_data = None
        if complete_classification_file.exists():
            with open(complete_classification_file, 'r') as f:
                complete_data = json.load(f)

        # Transform the data for frontend consumption
        response_data = {
            "green_window": {
                "start_time": green_window_data["start"],
                "end_time": green_window_data["end"],
                "average_carbon_intensity": green_window_data["avg_carbon_intensity_gco2_per_kwh"],
                "duration_hours": green_window_data["length_hours"],
                "baseline_threshold": green_window_data.get("baseline_threshold", 0),
                "window_type": green_window_data.get("window_type", "unknown"),
                "hourly_data": green_window_data["rows"]
            },
            "complete_forecast": complete_data,
            "computation_timestamp": pd.Timestamp.now().isoformat(),
            "status": "computed"
        }

        return {
            "success": True,
            "data": response_data,
            "message": f"Successfully computed green window for {green_window_data['length_hours']} hours"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compute green window: {str(e)}")

@app.get("/api/forecast-24h")
async def get_24h_forecast():
    """
    Get the 24-hour carbon intensity forecast data for visualization.
    Returns the latest computed forecast without running ML computation.
    """
    try:
        # Read the complete classification data
        complete_classification_file = ROOT / 'outputs' / 'complete_window_classification.json'

        if not complete_classification_file.exists():
            raise HTTPException(
                status_code=404,
                detail="24-hour forecast data not available. Please run /api/compute-green-window first."
            )

        with open(complete_classification_file, 'r') as f:
            forecast_data = json.load(f)

        # Transform for frontend consumption
        response_data = {
            "forecast_period": forecast_data["forecast_period"],
            "hourly_data": forecast_data["hourly_classifications"],
            "summary": {
                "total_hours": len(forecast_data["hourly_classifications"]),
                "green_windows": sum(1 for h in forecast_data["hourly_classifications"] if h["window_type"] == "green_window"),
                "dirty_windows": sum(1 for h in forecast_data["hourly_classifications"] if h["window_type"] == "dirty_window"),
                "avg_carbon_intensity": round(sum(h["carbon_intensity_gco2_per_kwh"] for h in forecast_data["hourly_classifications"]) / len(forecast_data["hourly_classifications"]), 2),
                "min_carbon_intensity": min(h["carbon_intensity_gco2_per_kwh"] for h in forecast_data["hourly_classifications"]),
                "max_carbon_intensity": max(h["carbon_intensity_gco2_per_kwh"] for h in forecast_data["hourly_classifications"])
            }
        }

        return {
            "success": True,
            "data": response_data,
            "message": f"Retrieved 24-hour forecast with {response_data['summary']['green_windows']} green windows and {response_data['summary']['dirty_windows']} dirty windows"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve forecast data: {str(e)}")


@app.get("/api/seasonal-baseline")
async def get_seasonal_baseline():
    """
    Return the seasonal baseline JSON file (monthly carbon intensity baselines).
    """
    try:
        seasonal_file = ROOT / 'outputs' / 'seasonal_baseline.json'
        if not seasonal_file.exists():
            raise HTTPException(status_code=404, detail="seasonal_baseline.json not found")

        with open(seasonal_file, 'r') as f:
            seasonal = json.load(f)

        return {"success": True, "data": seasonal}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read seasonal baseline: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AURA Energy Optimization API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
