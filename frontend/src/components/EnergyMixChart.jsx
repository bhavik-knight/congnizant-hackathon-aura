import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Box,
    useTheme,
} from '@mui/material';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

const EnergyMixChart = ({
    data,
    title = "Current Energy Mix",
    subtitle = "Renewable vs Fossil Fuel Generation"
}) => {
    const theme = useTheme();

    // Mock data if none provided
    const mockData = [
        { name: 'Renewable', value: 65, color: theme.palette.success.main },
        { name: 'Fossil Fuel', value: 35, color: theme.palette.error.main },
    ];

    const chartData = data || mockData;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
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
                        {data.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {data.value}% of total generation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {data.value * 10} MW current output
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={14}
                fontWeight={600}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <Card>
            <CardHeader
                title={title}
                subheader={subtitle}
            />
            <CardContent>
                <Box sx={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomizedLabel}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 3 }}>
                    {chartData.map((item, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                                sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: '50%',
                                    bgcolor: item.color,
                                    mr: 1,
                                }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.name}: {item.value}%
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                        Key Insights:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            • {chartData[0]?.name} generation: {chartData[0]?.value}% ({chartData[0]?.value * 10} MW)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            • {chartData[1]?.name} generation: {chartData[1]?.value}% ({chartData[1]?.value * 10} MW)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            • Carbon intensity: {chartData[1]?.value * 7} gCO₂/kWh average
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default EnergyMixChart;
