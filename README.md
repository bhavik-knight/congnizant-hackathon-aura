# AURA - AI-Powered Energy Optimization Platform

AURA (AI-powered Utility Resource Assistant) is an intelligent energy optimization platform that helps users reduce their carbon footprint by scheduling household appliances during optimal "green energy" windows. The system uses machine learning to predict energy demand, identify carbon-efficient time periods, and provide personalized scheduling recommendations.

**✨ Key Innovation**: AURA features an advanced notification system with gamification and discount rewards to encourage sustainable energy usage patterns, making eco-friendly behavior both fun and financially beneficial.

## 🌟 Features

### 🤖 Built and Trained SARIMAX Model
 - For time-series forcasting
 - Demand prediction for the next 24-hours (can be scaled and Fine-tuned)

### 🤖 AI-Powered Chatbot
- Natural language processing for scheduling requests
- Voice input support for hands-free interaction
- Intelligent intent recognition and entity extraction
- Persistent chat history across sessions

### 📊 Real-Time Energy Analytics
- Live carbon intensity monitoring
- 24-hour energy demand forecasting
- Green window identification and optimization
- Interactive data visualizations

### 🏠 Smart Appliance Scheduling
- Automated scheduling for household appliances
- Carbon-aware optimization algorithms
- Multi-appliance conflict resolution
- Real-time scheduling adjustments

### 🔔 Smart Notifications & Gamification
- **Personalized Alerts**: Real-time notifications for optimal green energy windows
- **Discount Rewards**: Unlock discounts and incentives for consistent green window usage

## 🌱 Canada Climate Accord 2030
 - To reduce emission to 40%-45% compared to 2005 levels by 2030
 - To recude emmision to net-zero by 2050


### 🎯 Key Capabilities
- **Green Window Detection**: Identifies optimal low-carbon energy periods
- **Demand Forecasting**: Predicts energy consumption patterns using ML models
- **Carbon Impact Analysis**: Calculates CO₂ savings for different scheduling scenarios
- **User Engagement**: Tracks participation and optimization impact
- **Smart Notifications**: AI-powered alerts for optimal usage timing
- **Gamification Engine**: Points, badges, and rewards for sustainable behavior
- **Discount Integration**: Automated incentives for green energy adoption

## 🏗️ Architecture

```
AURA/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── services/      # API service layer
│   └── package.json
├── backend/           # FastAPI server
│   ├── main.py           # Main API server
│   └── models.py         # Pydantic models
├── ml_models/         # Machine learning components
│   ├── compute_green_window.py
│   ├── demand_forecast_model_trainer.py
│   └── seasonal_supply_model_builder.py
├── data/              # Energy datasets
├── outputs/           # ML model outputs and forecasts
└── tests/             # Test suites
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.13+** with `uv` package manager
- **Node.js 18+** with `pnpm` package manager
- **Git** for version control

### Manual Setup (Alternative)
clone the git repo
```bash
git clone <repo-name>
cd <repo-name>
```


#### 1. Install Python Dependencies
```bash
# Install uv if not already installed
reference: https://docs.astral.sh/uv/getting-started/installation/#__tabbed_1_2

- Mac/Linux (Unix System)
curl -LsSf https://astral.sh/uv/install.sh | sh
- Windows
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Install project dependencies
uv sync
```

#### 2. Install Frontend Dependencies
```bash
cd frontend
pnpm install
```

#### 3. Run ML Model Training
```bash
# Train seasonal supply model
uv run ml_models/seasonal_supply_model_builder.py

# Train demand forecast model
uv run ml_models/demand_forecast_model_trainer.py

# Compute green energy windows
uv run ml_models/compute_green_window.py
```

#### 4. Start Backend Server
```bash
uv run python -m backend.main
```

#### 5. Start Frontend Development Server
```bash
cd frontend
pnpm run dev
```

## 📋 API Endpoints

### Core Endpoints
- `GET /api/predict-demand` - Get 24-hour energy demand forecast
- `GET /api/find-green-windows` - Identify optimal green energy periods
- `POST /api/optimize-windows` - Optimize appliance scheduling
- `POST /api/schedule-appliances` - Finalize appliance schedules

### Notification & Gamification Endpoints (Planned)
- `GET /api/notifications` - Get personalized green window alerts
- `POST /api/notifications/send` - Send bulk notifications to users
- `GET /api/gamification/leaderboard` - Get community leaderboard
- `GET /api/user/rewards` - Get user points, badges, and available discounts
- `POST /api/user/claim-reward` - Claim earned rewards and discounts

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=backend --cov=ml_models
```

## 🛠️ Development

### Frontend Development
```bash
cd frontend
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run lint         # Run ESLint
pnpm run preview      # Preview production build
```

### Backend Development
```bash
# Run with auto-reload
uv run uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# View API documentation
open http://localhost:8000/docs
```

### ML Model Development
```bash
# Retrain models after data updates
uv run ml_models/seasonal_supply_model_builder.py
uv run ml_models/demand_forecast_model_trainer.py

# Test model predictions
uv run python -c "from ml_models.compute_green_window import *; print('Models loaded successfully')"
```

## 📊 Data Sources

The system uses historical energy data from NS Power (Nova Scotia Power) including:
- Hourly load data (`data/hourly_load_data.csv`)
- Carbon intensity measurements
- Seasonal baseline calculations

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Backend Configuration
HOST=0.0.0.0
PORT=8000

# ML Model Configuration
MODEL_PATH=outputs/aura_model.joblib
SEASONAL_BASELINE=outputs/seasonal_baseline.json

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Notification Configuration
NOTIFICATION_ENABLED=true
NOTIFICATION_FREQUENCY=hourly
NOTIFICATION_TYPES=green_window,achievements,discounts
```

### Model Parameters
Adjust ML model parameters in the respective Python files:
- `ml_models/demand_forecast_model_trainer.py` - Forecasting model settings
- `ml_models/seasonal_supply_model_builder.py` - Seasonal baseline calculation
- `ml_models/compute_green_window.py` - Green window detection thresholds


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- NS Power for providing energy data
- The open-source ML and data science community
- Contributors and maintainers of FastAPI, React, and the broader ecosystem

## 📞 Support

For questions or support:
- Open an issue on GitHub
- Check the API documentation at `http://localhost:8000/docs`
- Review the troubleshooting section below

## 🔍 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check Python version
python --version  # Should be 3.13+

# Reinstall dependencies
uv sync --reinstall
```

**Frontend build fails:**
```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**ML models not found:**
```bash
# Ensure models are trained
./run.sh  # This will train all models

# Or manually:
uv run ml_models/compute_green_window.py
```

**Port conflicts:**
```bash
# Kill processes on ports 3000 and 8000
lsof -ti:3000,8000 | xargs kill -9

# Or use different ports
uv run uvicorn backend.main:app --port 8001
cd frontend && pnpm run dev --port 3001
```

**Built with ❤️ for a sustainable future**
