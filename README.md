# Instructions & Demo Guide

Document exactly how judges or mentors can experience your solution. Update this file as the project evolves so it remains the single source of truth.

## Quick Start
1. Clone the repo and check out your feature branch.
```bash
git clone git@github.com:bhavik-knight/Cognizant-BrAInstorm-Challenge-2025.git
cd Cognizant-BrAInstorm-Challenge-2025
cd Codebase
```

2. Install dependencies:
-- install uv
reference: https://docs.astral.sh/uv/getting-started/installation/#__tabbed_1_2


3. Set required environment variables or secrets (list them below).
```bash
uv sync
```

4. Run the project locally using the commands in the next section.

## Local Run Commands
-- call the model to do demand/supply forecast, and compute green window
```bash
uv run ml_models/seasonal_supply_model_builder.py
uv run ml_models/demand_forecast_model_trainer.py
uv run ml_models/compute_green_window.py
```

## run backend
```bash
uv run python -m backend.main
```

## run frontend
```bash
cd frontend
pnpm run dev
```

## Environment Variables
| Name | Purpose | Example |
| --- | --- | --- |
| `MODEL_PATH` | Codebase/outputs/aura_model.joblib

## Hosted Demo / Video
- Live app: [localhost](http://localhost:3000/)
- Video walkthrough: [Youtube](https://youtu.be/kdr3sY2mI48)

## Troubleshooting
- Common issue 1 → resolution steps (Dashboard takes time to load due to ML model - Loading screen added)

Keep this guide concise and up to date—reviewers will follow it verbatim.

## Team: GreenHuskies
Bhavik Kantilal Bhagat
Jayanta Sarker Shuva
Md Chistia Chowdhury
Jeevan Dhakal
