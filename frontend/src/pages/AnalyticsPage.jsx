import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Alert,
    CircularProgress,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    Nature as NatureIcon,
    Assessment as AssessmentIcon,
    Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

import MetricCard from '../components/MetricCard';
import { useAnalyticsData } from '../hooks/useAuraData';

const AnalyticsPage = () => {
    const { loading, error } = useAnalyticsData();

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress size={60} />
                </Box>
            </Container>
        );
    }

    // Mock data for charts
    const carbonSavingsData = [
        { month: 'Aug', savings: 890, target: 800 },
        { month: 'Sep', savings: 945, target: 850 },
        { month: 'Oct', savings: 1120, target: 900 },
        { month: 'Nov', savings: 1250, target: 950 },
    ];

    const participationData = [
        { segment: 'High Usage', count: 456, percentage: 16 },
        { segment: 'Medium Usage', count: 1247, percentage: 44 },
        { segment: 'Low Usage', count: 892, percentage: 31 },
        { segment: 'Pilot Program', count: 252, percentage: 9 },
    ];

    const environmentalImpactData = [
        { name: 'CO₂ Reduction', value: 40, color: '#16a34a' },
        { name: 'Energy Savings', value: 35, color: '#2563eb' },
        { name: 'Grid Efficiency', value: 15, color: '#eab308' },
        { name: 'Cost Reduction', value: 10, color: '#dc2626' },
    ];

    return (
        <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                    Analytics & Performance
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Track carbon reduction progress and grid optimization impact
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Key Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Total CO₂ Saved"
                        value="1,250 kg"
                        subtitle="This month"
                        icon={NatureIcon}
                        trend="up"
                        trendValue="15%"
                        color="secondary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Active Participants"
                        value="2,847"
                        subtitle="72% participation rate"
                        icon={AssessmentIcon}
                        trend="up"
                        trendValue="8%"
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Grid Efficiency"
                        value="94.2%"
                        subtitle="Peak demand optimization"
                        icon={TrendingUpIcon}
                        trend="up"
                        trendValue="2.1%"
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Cost Savings"
                        value="$125K"
                        subtitle="Monthly operational savings"
                        icon={TimelineIcon}
                        trend="up"
                        trendValue="12%"
                        color="warning"
                    />
                </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={4}>
                {/* Carbon Savings Trend */}
                <Grid item xs={12} lg={8}>
                    <Card>
                        <CardHeader
                            title="Carbon Reduction Progress"
                            subheader="Monthly CO₂ savings vs targets (kg)"
                        />
                        <CardContent>
                            <Box sx={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={carbonSavingsData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value, name) => [
                                                `${value} kg`,
                                                name === 'savings' ? 'Actual Savings' : 'Target'
                                            ]}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="savings"
                                            stroke="#16a34a"
                                            strokeWidth={3}
                                            name="savings"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="target"
                                            stroke="#dc2626"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            name="target"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Environmental Impact */}
                <Grid item xs={12} lg={4}>
                    <Card>
                        <CardHeader
                            title="Environmental Impact"
                            subheader="Breakdown of benefits achieved"
                        />
                        <CardContent>
                            <Box sx={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={environmentalImpactData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="value"
                                            label={({ name, value }) => `${name}: ${value}%`}
                                        >
                                            {environmentalImpactData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${value}%`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Customer Participation */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardHeader
                            title="Customer Participation by Segment"
                            subheader="Distribution of active users across usage categories"
                        />
                        <CardContent>
                            <Box sx={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={participationData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="segment" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value, name) => [
                                                name === 'count' ? value : `${value}%`,
                                                name === 'count' ? 'Customers' : 'Percentage'
                                            ]}
                                        />
                                        <Bar dataKey="count" fill="#2563eb" name="count" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Performance Metrics */}
                <Grid item xs={12} lg={6}>
                    <Card>
                        <CardHeader
                            title="Key Performance Indicators"
                            subheader="Monthly progress towards 2030 climate goals"
                        />
                        <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {[
                                    { label: 'Carbon Reduction Goal', current: 78, target: 100, unit: '%' },
                                    { label: 'Customer Engagement', current: 72, target: 80, unit: '%' },
                                    { label: 'Grid Reliability', current: 99.2, target: 99.5, unit: '%' },
                                    { label: 'Cost Efficiency', current: 85, target: 90, unit: '%' },
                                ].map((metric, index) => (
                                    <Box key={index}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {metric.label}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {metric.current}/{metric.target} {metric.unit}
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
                                                    width: `${(metric.current / metric.target) * 100}%`,
                                                    height: '100%',
                                                    bgcolor: metric.current >= metric.target * 0.8 ? 'success.main' : 'warning.main',
                                                    borderRadius: 4,
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Summary Insights */}
            <Box sx={{ mt: 6 }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Executive Summary
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
                                    ✅ Achievements This Month
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography variant="body2">• Exceeded carbon reduction target by 32%</Typography>
                                    <Typography variant="body2">• 72% customer participation rate achieved</Typography>
                                    <Typography variant="body2">• $125K in operational cost savings</Typography>
                                    <Typography variant="body2">• 15.2 MW peak demand reduction</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'warning.main' }}>
                                    🎯 Next Month Priorities
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Typography variant="body2">• Expand pilot program to 500 additional customers</Typography>
                                    <Typography variant="body2">• Improve notification open rates to 75%</Typography>
                                    <Typography variant="body2">• Integrate with NS Power billing system</Typography>
                                    <Typography variant="body2">• Launch mobile app for customer engagement</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default AnalyticsPage;
