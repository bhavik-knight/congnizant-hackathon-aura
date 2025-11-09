import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Box,
    useTheme,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

const CarbonTimeline = ({ data, title = "24-Hour Carbon Intensity Forecast" }) => {
    const theme = useTheme();

    // Mock data if none provided
    const mockData = [
        { hour: '00:00', carbonIntensity: 450, windowType: 'dirty' },
        { hour: '01:00', carbonIntensity: 420, windowType: 'dirty' },
        { hour: '02:00', carbonIntensity: 380, windowType: 'dirty' },
        { hour: '03:00', carbonIntensity: 350, windowType: 'green' },
        { hour: '04:00', carbonIntensity: 320, windowType: 'green' },
        { hour: '05:00', carbonIntensity: 290, windowType: 'green' },
        { hour: '06:00', carbonIntensity: 280, windowType: 'green' },
        { hour: '07:00', carbonIntensity: 320, windowType: 'green' },
        { hour: '08:00', carbonIntensity: 380, windowType: 'dirty' },
        { hour: '09:00', carbonIntensity: 420, windowType: 'dirty' },
        { hour: '10:00', carbonIntensity: 450, windowType: 'dirty' },
        { hour: '11:00', carbonIntensity: 480, windowType: 'dirty' },
        { hour: '12:00', carbonIntensity: 520, windowType: 'dirty' },
        { hour: '13:00', carbonIntensity: 500, windowType: 'dirty' },
        { hour: '14:00', carbonIntensity: 480, windowType: 'dirty' },
        { hour: '15:00', carbonIntensity: 450, windowType: 'dirty' },
        { hour: '16:00', carbonIntensity: 420, windowType: 'dirty' },
        { hour: '17:00', carbonIntensity: 380, windowType: 'dirty' },
        { hour: '18:00', carbonIntensity: 350, windowType: 'green' },
        { hour: '19:00', carbonIntensity: 320, windowType: 'green' },
        { hour: '20:00', carbonIntensity: 290, windowType: 'green' },
        { hour: '21:00', carbonIntensity: 280, windowType: 'green' },
        { hour: '22:00', carbonIntensity: 320, windowType: 'green' },
        { hour: '23:00', carbonIntensity: 380, windowType: 'dirty' },
    ];

    const chartData = data || mockData;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Box
                    sx={{
                        bgcolor: 'white',
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        boxShadow: 2,
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Carbon Intensity: {payload[0].value} gCO₂/kWh
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: data.windowType === 'green' ? 'success.main' : 'error.main',
                            fontWeight: 600,
                        }}
                    >
                        {data.windowType === 'green' ? 'Green Window' : 'Dirty Window'}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardHeader
                title={title}
                subheader="Real-time carbon intensity with green window identification"
            />
            <CardContent>
                <Box sx={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis
                                dataKey="hour"
                                stroke={theme.palette.text.secondary}
                                fontSize={12}
                            />
                            <YAxis
                                stroke={theme.palette.text.secondary}
                                fontSize={12}
                                label={{
                                    value: 'gCO₂/kWh',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { textAnchor: 'middle' }
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine
                                y={350}
                                stroke={theme.palette.warning.main}
                                strokeDasharray="5 5"
                                label={{
                                    value: "Baseline Threshold",
                                    position: "topRight",
                                    style: { fontSize: '12px', fill: theme.palette.warning.main }
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="carbonIntensity"
                                stroke={theme.palette.primary.main}
                                strokeWidth={3}
                                dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: theme.palette.success.main,
                                mr: 1,
                            }}
                        />
                        <Typography variant="body2">Green Window (&lt; 350 gCO₂/kWh)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: theme.palette.error.main,
                                mr: 1,
                            }}
                        />
                        <Typography variant="body2">Dirty Window (&gt; 350 gCO₂/kWh)</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CarbonTimeline;
