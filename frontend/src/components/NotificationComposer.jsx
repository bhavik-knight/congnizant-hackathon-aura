import { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    Typography,
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Switch,
    FormControlLabel,
    Alert,
    Divider,
} from '@mui/material';
import {
    Send as SendIcon,
    Schedule as ScheduleIcon,
    Preview as PreviewIcon,
} from '@mui/icons-material';

const NotificationComposer = () => {
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        targetAudience: 'all',
        priority: 'normal',
        scheduled: false,
        scheduleTime: '',
        includePersonalization: true,
    });

    const [preview, setPreview] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSend = () => {
        // Mock send functionality
        console.log('Sending notification:', formData);
        // Here you would call the API
    };

    const audienceOptions = [
        { value: 'all', label: 'All Customers', count: '2,847' },
        { value: 'high_usage', label: 'High Usage (>500 kWh/month)', count: '456' },
        { value: 'low_participation', label: 'Low Participation (<20%)', count: '234' },
        { value: 'green_window_eligible', label: 'Green Window Eligible', count: '1,892' },
        { value: 'pilot_program', label: 'Pilot Program Participants', count: '150' },
    ];

    const priorityOptions = [
        { value: 'low', label: 'Low', color: 'default' },
        { value: 'normal', label: 'Normal', color: 'primary' },
        { value: 'high', label: 'High', color: 'warning' },
        { value: 'urgent', label: 'Urgent', color: 'error' },
    ];

    const templateVariables = [
        '{{customer_name}}',
        '{{green_window_start}}',
        '{{green_window_end}}',
        '{{potential_savings}}',
        '{{current_intensity}}',
    ];

    return (
        <Card>
            <CardHeader
                title="Compose Notification"
                subheader="Send Green Window alerts and energy optimization tips to customers"
                action={
                    <Button
                        variant="outlined"
                        startIcon={<PreviewIcon />}
                        onClick={() => setPreview(!preview)}
                    >
                        {preview ? 'Edit' : 'Preview'}
                    </Button>
                }
            />
            <CardContent>
                {!preview ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Subject Line"
                            value={formData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            placeholder="Green Window Alert: Save energy now!"
                            helperText="Keep it concise and actionable"
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={6}
                            label="Message Content"
                            value={formData.message}
                            onChange={(e) => handleInputChange('message', e.target.value)}
                            placeholder={`Hi {{customer_name}},

A Green Window is now available from {{green_window_start}} to {{green_window_end}}!

Running your appliances during this time could save you {{potential_savings}} kg of CO₂ emissions.

Current grid carbon intensity: {{current_intensity}} gCO₂/kWh

Schedule your laundry, dishwasher, or EV charging now to contribute to Nova Scotia's clean energy future!

Best regards,
NS Power Aura Team`}
                            helperText="Use template variables for personalization"
                        />

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                Template Variables:
                            </Typography>
                            {templateVariables.map((variable) => (
                                <Chip
                                    key={variable}
                                    label={variable}
                                    size="small"
                                    variant="outlined"
                                    onClick={() => {
                                        const newMessage = formData.message + ' ' + variable;
                                        handleInputChange('message', newMessage);
                                    }}
                                    sx={{ cursor: 'pointer' }}
                                />
                            ))}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Target Audience</InputLabel>
                                <Select
                                    value={formData.targetAudience}
                                    label="Target Audience"
                                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                                >
                                    {audienceOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            <Box>
                                                <Typography variant="body2">{option.label}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {option.count} customers
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl sx={{ minWidth: 150 }}>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={formData.priority}
                                    label="Priority"
                                    onChange={(e) => handleInputChange('priority', e.target.value)}
                                >
                                    {priorityOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            <Chip
                                                label={option.label}
                                                size="small"
                                                color={option.color}
                                                variant="outlined"
                                            />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.scheduled}
                                        onChange={(e) => handleInputChange('scheduled', e.target.checked)}
                                    />
                                }
                                label="Schedule for later"
                            />

                            {formData.scheduled && (
                                <TextField
                                    type="datetime-local"
                                    label="Schedule Time"
                                    value={formData.scheduleTime}
                                    onChange={(e) => handleInputChange('scheduleTime', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ minWidth: 200 }}
                                />
                            )}
                        </Box>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.includePersonalization}
                                    onChange={(e) => handleInputChange('includePersonalization', e.target.checked)}
                                />
                            }
                            label="Include personalization (customer name, specific savings)"
                        />

                        <Divider />

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button variant="outlined">
                                Save as Draft
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={formData.scheduled ? <ScheduleIcon /> : <SendIcon />}
                                onClick={handleSend}
                                disabled={!formData.subject || !formData.message}
                            >
                                {formData.scheduled ? 'Schedule Send' : 'Send Now'}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Box>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            This is how your notification will appear to customers. Template variables will be replaced with actual values.
                        </Alert>

                        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Subject: {formData.subject || '[Subject Line]'}
                            </Typography>

                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                                {formData.message || '[Message Content]'}
                            </Typography>
                        </Box>

                        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                Delivery Details:
                            </Typography>
                            <Typography variant="caption" display="block">
                                • Recipients: {audienceOptions.find(a => a.value === formData.targetAudience)?.label} ({audienceOptions.find(a => a.value === formData.targetAudience)?.count} customers)
                            </Typography>
                            <Typography variant="caption" display="block">
                                • Priority: {priorityOptions.find(p => p.value === formData.priority)?.label}
                            </Typography>
                            <Typography variant="caption" display="block">
                                • Scheduled: {formData.scheduled ? `Yes, ${formData.scheduleTime || 'Not set'}` : 'No (send immediately)'}
                            </Typography>
                            <Typography variant="caption" display="block">
                                • Personalization: {formData.includePersonalization ? 'Enabled' : 'Disabled'}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default NotificationComposer;
