import {
    Card,
    CardContent,
    Typography,
    Box,
} from '@mui/material';

const MetricCard = ({
    title,
    value,
    subtitle,
    icon: IconComponent,
    trend,
    trendValue,
    color = 'primary',
}) => {
    const getTrendColor = (trend) => {
        switch (trend) {
            case 'up':
                return 'success.main';
            case 'down':
                return 'error.main';
            default:
                return 'text.secondary';
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return '↑';
            case 'down':
                return '↓';
            default:
                return '→';
        }
    };

    return (
        <Card className="metric-card">
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {IconComponent && (
                        <Box
                            sx={{
                                mr: 1,
                                p: 1,
                                borderRadius: 2,
                                bgcolor: `${color}.main`,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <IconComponent sx={{ fontSize: 20 }} />
                        </Box>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                        {title}
                    </Typography>
                </Box>

                <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
                    {value}
                </Typography>

                {subtitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {subtitle}
                    </Typography>
                )}

                {trend && trendValue && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: getTrendColor(trend),
                                fontWeight: 600,
                                mr: 0.5,
                            }}
                        >
                            {getTrendIcon(trend)} {trendValue}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            vs last month
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default MetricCard;
