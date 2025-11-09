import {
    Container,
    Typography,
    Box,
    Grid,
    Button,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Timeline as TimelineIcon,
    PieChart as PieChartIcon,
} from '@mui/icons-material';

import CarbonTimeline from '../components/CarbonTimeline';
import EnergyMixChart from '../components/EnergyMixChart';
import MetricCard from '../components/MetricCard';
import { useDashboardData } from '../hooks/useAuraData';

const LoadingOverlay = () => (
    <Box
        sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255,255,255,0.8)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(5px)',
        }}
    >
        <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                Loading Dashboard...
            </Typography>
        </Box>
    </Box>
);

const DashboardPage = () => {
    const { data, loading, error, refreshData } = useDashboardData();

    if (loading && !data.carbonForecast) {
        return <LoadingOverlay />;
    }

    return (
        <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                        Energy Dashboard
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Real-time insights for NS Power grid optimization
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={refreshData}
                    disabled={loading}
                >
                    Refresh Data
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Key Metrics */}
            <Box
                component="section"
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    flexWrap: 'wrap',
                    justifyContent: 'space-evenly',
                    alignItems: 'stretch',
                    mb: 4,
                }}
            >
                <Box sx={{ px: 1, display: 'flex', flex: '1 1 220px' }}>
                    <MetricCard
                        title="Active Users"
                        value="2,847"
                        subtitle="Participating customers"
                        icon={TimelineIcon}
                        trend="up"
                        trendValue="12%"
                        color="primary"
                    />
                </Box>
                <Box sx={{ px: 1, display: 'flex', flex: '1 1 220px' }}>
                    <MetricCard
                        title="CO₂ Saved Today"
                        value="1.2 tons"
                        subtitle="Carbon emissions reduced"
                        icon={PieChartIcon}
                        trend="up"
                        trendValue="8%"
                        color="secondary"
                    />
                </Box>
                <Box sx={{ px: 1, display: 'flex', flex: '1 1 220px' }}>
                    <MetricCard
                        title="Green Windows"
                        value="18/24 hrs"
                        subtitle="Available optimization periods"
                        icon={TimelineIcon}
                        trend="neutral"
                        trendValue="Optimal"
                        color="success"
                    />
                </Box>
                <Box sx={{ px: 1, display: 'flex', flex: '1 1 220px' }}>
                    <MetricCard
                        title="Grid Efficiency"
                        value="94.2%"
                        subtitle="Peak demand optimization"
                        icon={PieChartIcon}
                        trend="up"
                        trendValue="2.1%"
                        color="warning"
                    />
                </Box>
            </Box>

            {/* Charts Section */}
            <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                    <CarbonTimeline
                        data={data.carbonForecast?.data?.hourly_data?.map(item => ({
                            hour: item.hour != null ? `${String(item.hour).padStart(2, '0')}:00` : (item.timestamp ? item.timestamp : ''),
                            carbonIntensity: item.carbon_intensity_gco2_per_kwh ?? item.carbon_intensity_gco2_per_kwh,
                            windowType: item.window_type ?? item.windowType ?? 'dirty',
                            baselineThreshold: data.carbonForecast?.data?.forecast_period?.baseline_threshold
                        }))}
                    />
                </Grid>

                <Grid item xs={12} lg={4}>
                    <EnergyMixChart
                        data={[
                            { name: 'Renewable', value: 65, color: '#16a34a' },
                            { name: 'Fossil Fuel', value: 35, color: '#dc2626' },
                        ]}
                    />

                    {/* Quick Actions */}
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Quick Actions
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button variant="contained" fullWidth>
                                Send Green Window Alert
                            </Button>
                            <Button variant="outlined" fullWidth>
                                Generate Report
                            </Button>
                            <Button variant="outlined" fullWidth>
                                View Customer Insights
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Additional Insights */}
            <Box sx={{ mt: 6 }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Today&apos;s Insights
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                p: 3,
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Peak Optimization Opportunity
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                                Current grid conditions show optimal timing for demand response.
                                Green windows are available for the next 18 hours.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        bgcolor: 'success.main',
                                        color: 'white',
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        fontWeight: 600,
                                    }}
                                >
                                    LOW CARBON: 6AM - 10PM
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        bgcolor: 'warning.main',
                                        color: 'white',
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        fontWeight: 600,
                                    }}
                                >
                                    PEAK DEMAND: 2PM - 6PM
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                p: 3,
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Customer Engagement Status
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                                72% of customers are actively participating in energy optimization.
                                Recent campaigns have increased engagement by 15%.
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Participation Rate
                                </Typography>
                                <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600 }}>
                                    72%
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 8,
                                    bgcolor: 'grey.200',
                                    borderRadius: 4,
                                    mt: 1,
                                    overflow: 'hidden',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '72%',
                                        height: '100%',
                                        bgcolor: 'success.main',
                                        borderRadius: 4,
                                    }}
                                />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default DashboardPage;
