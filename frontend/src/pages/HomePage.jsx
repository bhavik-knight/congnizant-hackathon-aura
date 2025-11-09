import {
    Container,
    Typography,
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    useTheme,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    Group as GroupIcon,
    Spa as EcoIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

// HMR Test - Hot Module Replacement is enabled
const HomePage = () => {
    const theme = useTheme();

    const benefits = [
        {
            icon: <EcoIcon sx={{ fontSize: 48, color: theme.palette.secondary.main }} />,
            title: 'Carbon Reduction',
            description: 'Help customers reduce their carbon footprint by optimizing energy usage during low-carbon periods.',
            stats: '1,250 kg CO₂ saved this month',
        },
        {
            icon: <TrendingUpIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
            title: 'Virtual Power Plant',
            description: 'Transform distributed energy resources into a coordinated virtual power plant for grid optimization.',
            stats: '15.2 MW peak demand reduction',
        },
        {
            icon: <GroupIcon sx={{ fontSize: 48, color: theme.palette.success.main }} />,
            title: 'Customer Engagement',
            description: 'Increase customer satisfaction and participation through personalized energy optimization recommendations.',
            stats: '72% customer participation rate',
        },
    ];

    const stats = [
        { value: '2,847', label: 'Active Customers', trend: '+12%' },
        { value: '1,250 kg', label: 'CO₂ Saved Today', trend: '+8%' },
        { value: '18/24 hrs', label: 'Green Windows', trend: 'Optimal' },
        { value: '$125K', label: 'Monthly Savings', trend: '+15%' },
    ];

    return (
        <Container maxWidth="lg">
            {/* Hero Section */}
            <Box
                sx={{
                    textAlign: 'center',
                    py: { xs: 8, md: 12 },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
                    borderRadius: 4,
                    mb: 8,
                }}
            >
                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: '2.5rem', md: '4rem' },
                        fontWeight: 700,
                        mb: 3,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Aura
                </Typography>

                <Typography
                    variant="h4"
                    sx={{
                        mb: 4,
                        color: 'text.secondary',
                        maxWidth: 800,
                        mx: 'auto',
                        px: 2,
                    }}
                >
                    AI-Powered Energy Optimization Platform for NS Power
                </Typography>

                <Typography
                    variant="h6"
                    sx={{
                        mb: 6,
                        color: 'text.secondary',
                        maxWidth: 600,
                        mx: 'auto',
                        px: 2,
                        lineHeight: 1.6,
                    }}
                >
                    Transform your grid operations with intelligent energy optimization.
                    Help customers reduce emissions while maintaining grid stability and reducing costs.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: '1.1rem',
                            borderRadius: 3,
                        }}
                    >
                        View Dashboard
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        sx={{
                            px: 4,
                            py: 1.5,
                            fontSize: '1.1rem',
                            borderRadius: 3,
                        }}
                    >
                        Learn More
                    </Button>
                </Box>
            </Box>

            {/* Stats Section */}
            <Box sx={{ mb: 8 }}>
                <Typography variant="h3" sx={{ textAlign: 'center', mb: 6, fontWeight: 600 }}>
                    Impact at a Glance
                </Typography>

                <Grid container spacing={3}>
                    {stats.map((stat, index) => (
                        <Grid item xs={6} md={3} key={index}>
                            <Card
                                sx={{
                                    textAlign: 'center',
                                    py: 3,
                                    height: '100%',
                                    borderRadius: 3,
                                    transition: 'transform 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                    },
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            fontWeight: 700,
                                            color: theme.palette.primary.main,
                                            mb: 1,
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                                        {stat.label}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: stat.trend.includes('+') ? 'success.main' : 'text.secondary',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {stat.trend}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Benefits Section */}
            <Box sx={{ mb: 8 }}>
                <Typography variant="h3" sx={{ textAlign: 'center', mb: 6, fontWeight: 600 }}>
                    Key Benefits for NS Power
                </Typography>

                <Grid container spacing={4}>
                    {benefits.map((benefit, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    textAlign: 'center',
                                    p: 3,
                                    borderRadius: 3,
                                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: theme.shadows[8],
                                    },
                                }}
                            >
                                <CardContent>
                                    <Box sx={{ mb: 3 }}>
                                        {benefit.icon}
                                    </Box>
                                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                                        {benefit.title}
                                    </Typography>
                                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.6 }}>
                                        {benefit.description}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: theme.palette.primary.main,
                                            fontWeight: 600,
                                            bgcolor: theme.palette.primary.main + '10',
                                            py: 1,
                                            px: 2,
                                            borderRadius: 2,
                                            display: 'inline-block',
                                        }}
                                    >
                                        {benefit.stats}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/* Call to Action */}
            <Box
                sx={{
                    textAlign: 'center',
                    py: 8,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}05, ${theme.palette.secondary.main}05)`,
                    borderRadius: 4,
                    border: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
                    Ready to Transform Your Grid Operations?
                </Typography>
                <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
                    Join the clean energy revolution with Aura&apos;s AI-powered optimization platform.
                    Reduce emissions, optimize costs, and engage customers like never before.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        px: 6,
                        py: 2,
                        fontSize: '1.2rem',
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }}
                >
                    Get Started Today
                </Button>
            </Box>
        </Container>
    );
};

export default HomePage;
