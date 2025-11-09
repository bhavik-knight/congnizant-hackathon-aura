import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot/Chatbot';

// Pages
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import NotificationCenterPage from './pages/NotificationCenterPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ChatBotPage from './pages/ChatBotPage';

// Material-UI Theme
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2563eb', // Blue
            light: '#60a5fa',
            dark: '#1d4ed8',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#16a34a', // Green
            light: '#4ade80',
            dark: '#15803d',
            contrastText: '#ffffff',
        },
        success: {
            main: '#059669',
            light: '#34d399',
            dark: '#047857',
            contrastText: '#ffffff',
        },
        warning: {
            main: '#d97706',
            light: '#fbbf24',
            dark: '#b45309',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f8fafc',
            paper: '#ffffff',
        },
        gradients: {
            primary: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
            secondary: 'linear-gradient(135deg, #16a34a 0%, #4ade80 100%)',
            success: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
            warning: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
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

const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route
                    path="/"
                    element={
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <HomePage />
                        </motion.div>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <DashboardPage />
                        </motion.div>
                    }
                />
                <Route
                    path="/notifications"
                    element={
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <NotificationCenterPage />
                        </motion.div>
                    }
                />
                <Route
                    path="/analytics"
                    element={
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AnalyticsPage />
                        </motion.div>
                    }
                />
            </Routes>
        </AnimatePresence>
    );
};

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
                        <AnimatedRoutes />
                    </Box>

                    {/* Chatbot */}
                    <Chatbot />
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export default App;
