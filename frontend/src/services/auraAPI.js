import api from './api';

// Dashboard APIs
export const dashboardAPI = {
    // Get 24-hour carbon intensity forecast
    getCarbonForecast: async () => {
        try {
            const response = await api.get('/api/forecast-24h');
            return response.data;
        } catch (error) {
            console.error('Error fetching carbon forecast:', error);
            throw error;
        }
    },

    // Get demand prediction
    getDemandPrediction: async () => {
        try {
            const response = await api.get('/api/predict-demand');
            return response.data;
        } catch (error) {
            console.error('Error fetching demand prediction:', error);
            throw error;
        }
    },

    // Compute green window
    computeGreenWindow: async () => {
        try {
            const response = await api.post('/api/compute-green-window');
            return response.data;
        } catch (error) {
            console.error('Error computing green window:', error);
            throw error;
        }
    },
};

// Notification APIs
export const notificationAPI = {
    // Send notification
    sendNotification: async (notificationData) => {
        try {
            // Mock API call - replace with actual endpoint
            console.log('Sending notification:', notificationData);
            return { success: true, message: 'Notification sent successfully' };
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    },

    // Get notification history
    getNotificationHistory: async () => {
        // Mock data - replace with actual API call
        return {
            success: true,
            data: [
                {
                    id: 'notif_001',
                    subject: 'Green Window Alert - Evening Hours',
                    sentAt: '2025-11-15T14:30:00Z',
                    recipients: 1247,
                    openRate: 68,
                    status: 'delivered',
                },
                {
                    id: 'notif_002',
                    subject: 'Weekly Energy Savings Report',
                    sentAt: '2025-11-08T09:00:00Z',
                    recipients: 2156,
                    openRate: 52,
                    status: 'delivered',
                },
                {
                    id: 'notif_003',
                    subject: 'Peak Demand Warning',
                    sentAt: '2025-11-05T16:45:00Z',
                    recipients: 892,
                    openRate: 71,
                    status: 'delivered',
                },
                {
                    id: 'notif_004',
                    subject: 'Carbon Reduction Achievement',
                    sentAt: '2025-11-02T11:15:00Z',
                    recipients: 1654,
                    openRate: 63,
                    status: 'delivered',
                },
                {
                    id: 'notif_005',
                    subject: 'Weekly Energy Report',
                    sentAt: '2025-11-02T09:00:00Z',
                    recipients: 2847,
                    openRate: 45,
                    status: 'delivered',
                },
            ],
        };
    },
};

// Analytics APIs
export const analyticsAPI = {
    // Get carbon reduction metrics
    getCarbonMetrics: async () => {
        // Mock data - replace with actual API call
        return {
            success: true,
            data: {
                totalCarbonSaved: 1250.5, // kg
                monthlyTrend: [
                    { month: 'Aug', savings: 890 },
                    { month: 'Sep', savings: 945 },
                    { month: 'Oct', savings: 1120 },
                    { month: 'Nov', savings: 1250 },
                ],
                participationRate: 72, // percentage
                activeUsers: 2847,
            },
        };
    },

    // Get grid optimization data
    getGridOptimization: async () => {
        // Mock data - replace with actual API call
        return {
            success: true,
            data: {
                peakDemandReduction: 15.2, // MW
                greenWindowUtilization: 68, // percentage
                fossilFuelDisplacement: 42.5, // MWh
                costSavings: 125000, // CAD
            },
        };
    },

    // Get environmental impact
    getEnvironmentalImpact: async () => {
        // Mock data - replace with actual API call
        return {
            success: true,
            data: {
                co2Reduction: 1250.5, // kg CO2
                treesEquivalent: 25, // number of trees
                carMilesEquivalent: 8500, // miles
                homeEnergyEquivalent: 45, // days of home energy
            },
        };
    },
};

// Utility functions
export const utils = {
    // Format date for display
    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    },

    // Format number with appropriate units
    formatNumber: (value, unit = '') => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M${unit}`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K${unit}`;
        }
        return `${value}${unit}`;
    },

    // Calculate percentage change
    calculateChange: (current, previous) => {
        if (!previous) return 0;
        return ((current - previous) / previous) * 100;
    },
};
