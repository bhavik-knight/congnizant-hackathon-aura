import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import NotificationCenterPage from './pages/NotificationCenterPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Material-UI Theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#2563eb', // Blue
            light: '#60a5fa',
            dark: '#1d4ed8',
        },
        secondary: {
            main: '#16a34a', // Green
            light: '#4ade80',
            dark: '#15803d',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontFamily: '"Poppins", "Inter", sans-serif',
            fontWeight: 700,
        },
        h2: {
            fontFamily: '"Poppins", "Inter", sans-serif',
            fontWeight: 600,
        },
        h3: {
            fontFamily: '"Poppins", "Inter", sans-serif',
            fontWeight: 600,
        },
        h4: {
            fontFamily: '"Poppins", "Inter", sans-serif',
            fontWeight: 500,
        },
        h5: {
            fontFamily: '"Poppins", "Inter", sans-serif',
            fontWeight: 500,
        },
        h6: {
            fontFamily: '"Poppins", "Inter", sans-serif',
            fontWeight: 500,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 500,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                },
            },
        },
    },
});

function App() {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                    <Navbar onMenuClick={toggleSidebar} />
                    <Sidebar open={sidebarOpen} onClose={toggleSidebar} />

                    <Box
                        component="main"
                        sx={{
                            flexGrow: 1,
                            p: 3,
                            mt: 8, // Account for fixed navbar
                            ml: { xs: 0, md: '240px' }, // Account for sidebar on desktop
                            transition: 'margin-left 0.3s ease-in-out',
                        }}
                    >
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/notifications" element={<NotificationCenterPage />} />
                            <Route path="/analytics" element={<AnalyticsPage />} />
                        </Routes>
                    </Box>
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export default App;
