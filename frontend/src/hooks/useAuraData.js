import { useState, useEffect } from 'react';
import { dashboardAPI, analyticsAPI, notificationAPI } from '../services/auraAPI';

// Custom hook for dashboard data
export const useDashboardData = () => {
    const [data, setData] = useState({
        carbonForecast: null,
        demandPrediction: null,
        greenWindow: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch data in parallel
                // Helper function for retrying failed requests
                const retryRequest = async (request, retries = 3, delay = 2000) => {
                    for (let i = 0; i < retries; i++) {
                        try {
                            return await request();
                        } catch (err) {
                            if (i === retries - 1) throw err;
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                    }
                };

                const [forecastResponse, demandResponse] = await Promise.allSettled([
                    retryRequest(() => dashboardAPI.getCarbonForecast()),
                    retryRequest(() => dashboardAPI.getDemandPrediction()),
                ]);

                const newData = {};

                if (forecastResponse.status === 'fulfilled') {
                    newData.carbonForecast = forecastResponse.value;
                } else {
                    console.error('Failed to fetch carbon forecast:', forecastResponse.reason);
                }

                if (demandResponse.status === 'fulfilled') {
                    newData.demandPrediction = demandResponse.value;
                } else {
                    console.error('Failed to fetch demand prediction:', demandResponse.reason);
                }

                setData(newData);
            } catch (err) {
                setError(err.message || 'Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const refreshData = () => {
        setLoading(true);
        setError(null);
        // Re-trigger the effect by updating a dependency
        setData({ ...data });
    };

    return { data, loading, error, refreshData };
};

// Custom hook for analytics data
export const useAnalyticsData = () => {
    const [data, setData] = useState({
        carbonMetrics: null,
        gridOptimization: null,
        environmentalImpact: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [metricsResponse, gridResponse, impactResponse] = await Promise.allSettled([
                    analyticsAPI.getCarbonMetrics(),
                    analyticsAPI.getGridOptimization(),
                    analyticsAPI.getEnvironmentalImpact(),
                ]);

                const newData = {};

                if (metricsResponse.status === 'fulfilled') {
                    newData.carbonMetrics = metricsResponse.value;
                }

                if (gridResponse.status === 'fulfilled') {
                    newData.gridOptimization = gridResponse.value;
                }

                if (impactResponse.status === 'fulfilled') {
                    newData.environmentalImpact = impactResponse.value;
                }

                setData(newData);
            } catch (err) {
                setError(err.message || 'Failed to fetch analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchAnalyticsData();
    }, []);

    return { data, loading, error };
};

// Custom hook for notification data
export const useNotificationData = () => {
    const [data, setData] = useState({
        history: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNotificationData = async () => {
            try {
                setLoading(true);
                setError(null);

                const historyResponse = await notificationAPI.getNotificationHistory();
                setData({
                    history: historyResponse.data || [],
                });
            } catch (err) {
                setError(err.message || 'Failed to fetch notification data');
            } finally {
                setLoading(false);
            }
        };

        fetchNotificationData();
    }, []);

    const sendNotification = async (notificationData) => {
        try {
            setError(null);
            const result = await notificationAPI.sendNotification(notificationData);
            // Refresh history after sending
            const historyResponse = await notificationAPI.getNotificationHistory();
            setData({
                history: historyResponse.data || [],
            });
            return result;
        } catch (err) {
            setError(err.message || 'Failed to send notification');
            throw err;
        }
    };

    return { data, loading, error, sendNotification };
};

// Custom hook for green window computation
export const useGreenWindow = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const computeGreenWindow = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await dashboardAPI.computeGreenWindow();
            setData(response);
            return response;
        } catch (err) {
            setError(err.message || 'Failed to compute green window');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, computeGreenWindow };
};
