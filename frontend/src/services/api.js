import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 45000, // Increased timeout
    headers: {
        'Content-Type': 'application/json',
    },
    // Configure retry behavior for specific status codes
    validateStatus: function (status) {
        return (status >= 200 && status < 300) || status === 408 || status === 503;
    },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('aura_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('aura_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
