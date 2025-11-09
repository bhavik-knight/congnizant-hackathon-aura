# run ML Models for supply and demand forecasting, and compute green window
uv run ml_models/seasonal_supply_model_builder.py
uv run ml_models/demand_forecast_model_trainer.py
uv run ml_models/compute_green_window.py


# run backend
uv run python -m backend.main

# run frontend
cd frontend
pnpm run dev
