# Aura - AI-Powered Energy Optimization Platform

A professional React frontend for NS Power's AI-powered energy optimization platform that helps customers reduce carbon emissions while optimizing grid operations.

## 🚀 Features

- **Real-time Energy Dashboard**: 24-hour carbon intensity forecasting with green window identification
- **Customer Communication Center**: Professional notification system for sending Green Window alerts
- **Performance Analytics**: Comprehensive metrics tracking carbon reduction and grid optimization impact
- **Responsive Design**: Mobile-first approach suitable for utility company administrators
- **Professional UI**: Corporate aesthetic designed for energy sector stakeholders

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with Vite
- **UI Library**: Material-UI (MUI) with Emotion styling
- **Styling**: Tailwind CSS for utility classes
- **Charts**: Recharts for data visualization
- **Routing**: React Router DOM
- **HTTP Client**: Axios for API communication
- **Build Tool**: Vite for fast development and optimized production builds

## 📋 Prerequisites

- **Node.js**: 22 LTS (managed with `fnm`)
- **Package Manager**: pnpm
- **Backend**: FastAPI server running on `http://localhost:8000`

## 🚀 Getting Started

### 1. Install Node.js 22 LTS
```bash
curl -o- https://fnm.vercel.app/install | bash
fnm install 22
fnm use 22
```

### 2. Install pnpm
```bash
corepack enable pnpm
```

### 3. Install Dependencies
```bash
cd frontend
pnpm install
```

### 4. Start Development Server
```bash
pnpm run dev
```

The application will be available at `http://localhost:3000/`

### 5. Build for Production
```bash
pnpm run build
```

### 6. Preview Production Build
```bash
pnpm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx       # Top navigation bar
│   │   ├── Sidebar.jsx      # Left sidebar navigation
│   │   ├── MetricCard.jsx   # KPI display cards
│   │   ├── CarbonTimeline.jsx # 24-hour carbon intensity chart
│   │   ├── EnergyMixChart.jsx # Energy source breakdown
│   │   └── NotificationComposer.jsx # Email composer
│   ├── pages/               # Main page components
│   │   ├── HomePage.jsx     # Landing page
│   │   ├── DashboardPage.jsx # Energy insights dashboard
│   │   ├── NotificationCenterPage.jsx # Customer communications
│   │   └── AnalyticsPage.jsx # Performance tracking
│   ├── hooks/               # Custom React hooks
│   │   └── useAuraData.js   # Data fetching hooks
│   ├── services/            # API services
│   │   ├── api.js           # Axios configuration
│   │   └── auraAPI.js       # Aura-specific API functions
│   ├── styles/              # Global styles
│   │   └── index.css        # Tailwind imports and custom styles
│   └── utils/               # Utility functions
├── public/                  # Static assets
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── index.html               # Main HTML template
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563eb) - Professional, trustworthy
- **Secondary**: Green (#16a34a) - Environmental, sustainable
- **Accent**: Amber (#eab308) - Energy, warmth
- **Neutral**: Grays (#6b7280) - Corporate, clean

### Typography
- **Primary Font**: Inter (system font stack)
- **Display Font**: Poppins (headings)
- **Scale**: Material-UI typography system

### Components
- **Material-UI**: Professional component library
- **Tailwind CSS**: Utility-first styling
- **Responsive**: Mobile-first breakpoints

## 🔌 API Integration

The frontend integrates with the Aura FastAPI backend:

### Endpoints Used
- `GET /api/predict-demand` - 24-hour demand forecasting
- `GET /api/forecast-24h` - Carbon intensity timeline
- `POST /api/compute-green-window` - ML model execution
- `GET /api/available-time-ranges` - Time range suggestions

### Data Flow
1. **Custom Hooks**: `useDashboardData`, `useAnalyticsData`, `useNotificationData`
2. **API Services**: Centralized Axios configuration with error handling
3. **State Management**: React hooks for local state management

## 📱 Pages Overview

### 1. Home (`/`)
- Hero section with Aura mission
- Key benefits for NS Power
- Statistics visualization
- Call-to-action for administrators

### 2. Dashboard (`/dashboard`)
- 24-hour carbon intensity forecast
- Green window identification
- Real-time energy mix charts
- Key performance metrics

### 3. Notification Center (`/notifications`)
- Email template composer
- Customer segmentation
- Campaign scheduling
- Engagement analytics

### 4. Analytics (`/analytics`)
- Carbon reduction tracking
- Grid optimization metrics
- Customer participation rates
- Environmental impact reports

## 🔧 Development

### Code Quality
- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code formatting (via ESLint)
- **TypeScript**: Type checking (planned)

### Performance
- **Vite**: Fast development and optimized builds
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Component lazy loading

### Accessibility
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG compliant colors
- **Semantic HTML**: Proper semantic markup

## 🚀 Deployment

### Production Build
```bash
pnpm run build
```

### Environment Variables
Create a `.env` file for production:
```env
VITE_API_URL=https://api.aura.nspower.ca
VITE_APP_TITLE=Aura Energy Platform
```

### Static Hosting
The built files in `dist/` can be deployed to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting service

## 🤝 Contributing

1. Follow the existing code style
2. Use functional components with hooks
3. Maintain TypeScript compatibility (future)
4. Test components thoroughly
5. Update documentation

## 📄 License

Copyright © 2025 NS Power. All rights reserved.

## 👥 Team

- **Frontend Development**: React + Material-UI
- **Backend Development**: FastAPI + Python
- **ML Engineering**: SARIMAX forecasting models
- **Design**: Professional energy sector UI/UX

---

Built with ❤️ for NS Power's clean energy future
