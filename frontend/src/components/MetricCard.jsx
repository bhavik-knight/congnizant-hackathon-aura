import { motion } from 'framer-motion';
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
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
        >
            <Card 
                className="metric-card" 
                sx={{
                    background: (theme) => theme.palette.gradients[color],
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                        zIndex: 1,
                    }
                }}
            >
                <CardContent sx={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {IconComponent && (
                            <Box
                                sx={{
                                    mr: 1,
                                    p: 1,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backdropFilter: 'blur(8px)',
                                }}
                            >
                                <IconComponent sx={{ fontSize: 24 }} />
                            </Box>
                        )}
                        <Typography variant="body2" sx={{ flexGrow: 1, color: 'rgba(255,255,255,0.9)' }}>
                            {title}
                        </Typography>
                    </Box>

                    <Typography variant="h3" sx={{ mb: 1, fontWeight: 700 }}>
                        {value}
                    </Typography>

                    {subtitle && (
                        <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255,255,255,0.8)' }}>
                            {subtitle}
                        </Typography>
                    )}

                    {trend && trendValue && (
                        <Box 
                            sx={{ 
                                display: 'inline-flex', 
                                alignItems: 'center',
                                bgcolor: 'rgba(255,255,255,0.2)',
                                borderRadius: 2,
                                px: 1,
                                py: 0.5,
                                backdropFilter: 'blur(8px)',
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 600,
                                    mr: 0.5,
                                    color: 'white',
                                }}
                            >
                                {getTrendIcon(trend)} {trendValue}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                vs last month
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default MetricCard;
