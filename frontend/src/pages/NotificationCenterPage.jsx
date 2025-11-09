import { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardHeader,
    Button,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
} from '@mui/material';
import {
    Send as SendIcon,
    History as HistoryIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

import NotificationComposer from '../components/NotificationComposer';
import MetricCard from '../components/MetricCard';
import { useNotificationData } from '../hooks/useAuraData';

const NotificationCenterPage = () => {
    const { data, error, sendNotification } = useNotificationData();
    const [showComposer, setShowComposer] = useState(false);

    const handleSendNotification = async (notificationData) => {
        try {
            await sendNotification(notificationData);
            setShowComposer(false);
            // Show success message
        } catch (err) {
            // Handle error
        }
    };

    const notificationStats = [
        { title: 'Sent Today', value: '1,247', subtitle: 'Notifications delivered', trend: 'up', trendValue: '15%' },
        { title: 'Open Rate', value: '68%', subtitle: 'Average engagement', trend: 'up', trendValue: '5%' },
        { title: 'Click Rate', value: '24%', subtitle: 'Action taken', trend: 'up', trendValue: '8%' },
        { title: 'Active Campaigns', value: '3', subtitle: 'Running now', trend: 'neutral', trendValue: 'Stable' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered':
                return 'success';
            case 'sending':
                return 'warning';
            case 'failed':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Container maxWidth="lg">
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                        Notification Center
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Engage customers with personalized energy optimization alerts
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={() => setShowComposer(!showComposer)}
                    size="large"
                >
                    {showComposer ? 'Cancel' : 'Compose Notification'}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {notificationStats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <MetricCard
                            title={stat.title}
                            value={stat.value}
                            subtitle={stat.subtitle}
                            trend={stat.trend}
                            trendValue={stat.trendValue}
                            color="primary"
                        />
                    </Grid>
                ))}
            </Grid>

            {/* Main Content */}
            <Grid container spacing={4}>
                {/* Notification Composer */}
                {showComposer && (
                    <Grid item xs={12}>
                        <NotificationComposer onSend={handleSendNotification} />
                    </Grid>
                )}

                {/* Campaign Performance */}
                <Grid item xs={12} lg={8}>
                    <Card>
                        <CardHeader
                            title="Campaign Performance"
                            subheader="Track engagement and effectiveness of your notification campaigns"
                        />
                        <CardContent>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Recent Campaigns
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Campaign</TableCell>
                                                <TableCell align="right">Recipients</TableCell>
                                                <TableCell align="right">Open Rate</TableCell>
                                                <TableCell align="right">Status</TableCell>
                                                <TableCell align="right">Sent</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.history.map((campaign) => (
                                                <TableRow key={campaign.id} hover>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {campaign.subject}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                ID: {campaign.id}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">{campaign.recipients.toLocaleString()}</TableCell>
                                                    <TableCell align="right">
                                                        <Chip
                                                            label={`${campaign.openRate}%`}
                                                            color={campaign.openRate > 60 ? 'success' : campaign.openRate > 40 ? 'warning' : 'error'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip
                                                            label={campaign.status}
                                                            color={getStatusColor(campaign.status)}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        {new Date(campaign.sentAt).toLocaleDateString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick Actions & Insights */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ mb: 3 }}>
                        <CardHeader title="Quick Actions" />
                        <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button variant="contained" fullWidth startIcon={<SendIcon />}>
                                    Green Window Alert
                                </Button>
                                <Button variant="outlined" fullWidth startIcon={<HistoryIcon />}>
                                    Weekly Summary
                                </Button>
                                <Button variant="outlined" fullWidth startIcon={<TrendingUpIcon />}>
                                    Performance Report
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader title="Engagement Insights" />
                        <CardContent>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Best performing time
                                </Typography>
                                <Typography variant="h6" sx={{ color: 'success.main' }}>
                                    2:00 PM - 4:00 PM
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Most engaged segment
                                </Typography>
                                <Typography variant="h6" sx={{ color: 'primary.main' }}>
                                    High Usage Customers
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Average response time
                                </Typography>
                                <Typography variant="h6" sx={{ color: 'warning.main' }}>
                                    2.3 hours
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Campaign Templates */}
            <Box sx={{ mt: 6 }}>
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Campaign Templates
                </Typography>

                <Grid container spacing={3}>
                    {[
                        {
                            name: 'Green Window Alert',
                            description: 'Notify customers about upcoming low-carbon periods',
                            usage: 'High',
                            lastUsed: '2 hours ago',
                        },
                        {
                            name: 'Weekly Energy Report',
                            description: 'Share personalized energy savings and tips',
                            usage: 'Medium',
                            lastUsed: '1 day ago',
                        },
                        {
                            name: 'Peak Demand Warning',
                            description: 'Alert during high-demand periods',
                            usage: 'Low',
                            lastUsed: '3 days ago',
                        },
                    ].map((template, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                                        {template.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {template.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Chip
                                            label={`Usage: ${template.usage}`}
                                            size="small"
                                            color={template.usage === 'High' ? 'success' : template.usage === 'Medium' ? 'warning' : 'default'}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {template.lastUsed}
                                        </Typography>
                                    </Box>
                                    <Button variant="outlined" fullWidth size="small">
                                        Use Template
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Container>
    );
};

export default NotificationCenterPage;
