import {
    Container,
    Typography,
    Box,
    Grid,
    Button,
    Alert,
    CircularProgress,
    Paper,
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

const DashboardPage = () => {
    const { data, loading, error, refreshData } = useDashboardData();

    if (loading && !data.carbonForecast) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress size={60} />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
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

            {/* Main Content Grid */}
            <Grid container spacing={4}>
                {/* Dashboard Content - Full Width */}
                <Grid item xs={12}>
                    {/* Key Metrics */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} lg={3}>
                            <MetricCard
                                title="Active Users"
                                value="2,847"
                                subtitle="Participating customers"
                                icon={TimelineIcon}
                                trend="up"
                                trendValue="12%"
                                color="primary"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <MetricCard
                                title="CO₂ Saved Today"
                                value="1.2 tons"
                                subtitle="Carbon emissions reduced"
                                icon={PieChartIcon}
                                trend="up"
                                trendValue="8%"
                                color="secondary"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <MetricCard
                                title="Green Windows"
                                value="18/24 hrs"
                                subtitle="Available optimization periods"
                                icon={TimelineIcon}
                                trend="neutral"
                                trendValue="Optimal"
                                color="success"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} lg={3}>
                            <MetricCard
                                title="Grid Efficiency"
                                value="94.2%"
                                subtitle="Peak demand optimization"
                                icon={PieChartIcon}
                                trend="up"
                                trendValue="2.1%"
                                color="warning"
                            />
                        </Grid>
                    </Grid>

                    {/* Charts Section */}
                    <Grid container spacing={4} sx={{ mb: 4 }}>
                        <Grid item xs={12}>
                            <CarbonTimeline
                                data={data.carbonForecast?.data?.hourly_data?.map(item => ({
                                    hour: item.time,
                                    carbonIntensity: item.carbon_intensity_gco2_per_kwh,
                                    windowType: item.window_type,
                                }))}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <EnergyMixChart
                                data={[
                                    { name: 'Renewable', value: 65, color: '#16a34a' },
                                    { name: 'Fossil Fuel', value: 35, color: '#dc2626' },
                                ]}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            {/* Quick Actions */}
                            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                    Quick Actions
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                                    <Button variant="contained" fullWidth size="large">
                                        Send Green Window Alert
                                    </Button>
                                    <Button variant="outlined" fullWidth size="large">
                                        Generate Report
                                    </Button>
                                    <Button variant="outlined" fullWidth size="large">
                                        View Customer Insights
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Additional Insights */}
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                            Today&apos;s Insights
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} lg={6}>
                                <Paper sx={{ p: 3, height: '100%' }}>
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
                                </Paper>
                            </Grid>

                            <Grid item xs={12} lg={6}>
                                <Paper sx={{ p: 3, height: '100%' }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                        Customer Engagement Status
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                                        72% of customers are actively participating in energy optimization.
                                        Recent campaigns have increased engagement by 15%.
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DashboardPage;
