import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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
    
    // baseline threshold will be fetched from backend seasonal_baseline.json if not provided in data
    const [baselineThreshold, setBaselineThreshold] = useState(
        // prefer baseline included on data points, else undefined
        data?.[0]?.baselineThreshold ?? null
    );

    useEffect(() => {
        // If data includes a baselineThreshold use it
        if (data && data.length && (data[0].baselineThreshold || data[0].baselineThreshold === 0)) {
            setBaselineThreshold(data[0].baselineThreshold);
            return;
        }

        // Otherwise fetch seasonal baseline from backend and pick current month's value
        const fetchBaseline = async () => {
            try {
                const resp = await fetch('/api/seasonal-baseline');
                const json = await resp.json();
                const seasonal = json?.data || {};
                const month = new Date().getMonth() + 1; // 1-12
                const val = parseFloat(seasonal[String(month)] ?? seasonal[month] ?? 350);
                setBaselineThreshold(val);
            } catch (e) {
                // fallback
                setBaselineThreshold(350);
            }
        };

        fetchBaseline();
    }, [data]);

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
                    {(() => {
                        const wt = data.windowType ?? data.window_type ?? '';
                        const isGreen = String(wt).toLowerCase().includes('green');
                        return (
                            <Typography
                                variant="caption"
                                sx={{
                                    color: isGreen ? 'success.main' : 'error.main',
                                    fontWeight: 600,
                                }}
                            >
                                {isGreen ? 'Green Window' : 'Dirty Window'}
                            </Typography>
                        );
                    })()}
                </Box>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
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
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={50}
                                    tickMargin={15}
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
                                    y={baselineThreshold}
                                    stroke={theme.palette.warning.main}
                                    strokeDasharray="5 5"
                                    label={{
                                        value: `Baseline Threshold (${baselineThreshold} gCO₂/kWh)`,
                                        position: "topRight",
                                        style: { fontSize: '12px', fill: theme.palette.warning.main }
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="carbonIntensity"
                                    strokeWidth={2}
                                    dot={(props) => {
                                        const payloadItem = props?.payload || {};
                                        const wt = payloadItem.windowType ?? payloadItem.window_type ?? '';
                                        const isGreen = String(wt).toLowerCase().includes('green');
                                        return (
                                            <circle
                                                cx={props.cx}
                                                cy={props.cy}
                                                r={4}
                                                fill={isGreen ? theme.palette.success.main : theme.palette.error.main}
                                                stroke={isGreen ? theme.palette.success.main : theme.palette.error.main}
                                                strokeWidth={2}
                                            />
                                        );
                                    }}
                                    activeDot={(props) => {
                                        const payloadItem = props?.payload || {};
                                        const wt = payloadItem.windowType ?? payloadItem.window_type ?? '';
                                        const isGreen = String(wt).toLowerCase().includes('green');
                                        return (
                                            <circle
                                                cx={props.cx}
                                                cy={props.cy}
                                                r={6}
                                                fill={isGreen ? theme.palette.success.main : theme.palette.error.main}
                                                stroke={isGreen ? theme.palette.success.main : theme.palette.error.main}
                                                strokeWidth={2}
                                            />
                                        );
                                    }}
                                    stroke={theme.palette.primary.main}
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
                            <Typography variant="body2">Green Window (&lt; {baselineThreshold} gCO₂/kWh)</Typography>
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
                            <Typography variant="body2">Dirty Window (&gt; {baselineThreshold} gCO₂/kWh)</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default CarbonTimeline;
