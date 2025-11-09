import {
    Box,
    Typography,
    Paper,
    Chip,
    useTheme,
} from '@mui/material';
import { format } from 'date-fns';

const MessageBubble = ({ message, onQuickReply }) => {
    const theme = useTheme();

    const formatTime = (timestamp) => {
        return format(new Date(timestamp), 'HH:mm');
    };

    const renderContent = (content) => {
        // Split content by newlines and render with proper formatting
        return content.split('\n').map((line, index) => {
            // Check if line contains special formatting
            if (line.includes('✅ **Optimized Schedule Found:**')) {
                return (
                    <Typography key={index} variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                        ✅ Optimized Schedule Found:
                    </Typography>
                );
            }

            if (line.includes('📊 **Impact:**')) {
                return (
                    <Typography key={index} variant="h6" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
                        📊 Impact:
                    </Typography>
                );
            }

            if (line.includes('• Carbon Reduction:')) {
                return (
                    <Typography key={index} variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        {line}
                    </Typography>
                );
            }

            if (line.includes('• Estimated Savings:')) {
                return (
                    <Typography key={index} variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        {line}
                    </Typography>
                );
            }

            if (line.includes('• Green Window Utilized:')) {
                return (
                    <Typography key={index} variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        {line}
                    </Typography>
                );
            }

            if (line.includes('Would you like to confirm')) {
                return (
                    <Typography key={index} variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                        {line}
                    </Typography>
                );
            }

            // Check for task lines (with emojis)
            if (line.match(/^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}]/u)) {
                return (
                    <Typography key={index} variant="body1" sx={{ mb: 0.5, fontWeight: 500 }}>
                        {line}
                    </Typography>
                );
            }

            // Check for indented details
            if (line.startsWith('  - ')) {
                return (
                    <Typography key={index} variant="body2" sx={{ ml: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                        {line.substring(4)}
                    </Typography>
                );
            }

            // Regular text
            return (
                <Typography key={index} variant="body1" sx={{ mb: index === content.split('\n').length - 1 ? 0 : 1 }}>
                    {line}
                </Typography>
            );
        });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
            }}
        >
            <Box sx={{ maxWidth: '80%', minWidth: '200px' }}>
                {/* Message Bubble */}
                <Paper
                    elevation={1}
                    sx={{
                        p: 2,
                        borderRadius: message.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        backgroundColor: message.type === 'user'
                            ? theme.palette.primary.main
                            : theme.palette.background.paper,
                        color: message.type === 'user'
                            ? 'white'
                            : 'text.primary',
                        position: 'relative',
                    }}
                >
                    {renderContent(message.content)}

                    {/* Timestamp */}
                    <Typography
                        variant="caption"
                        sx={{
                            display: 'block',
                            mt: 1,
                            color: message.type === 'user'
                                ? 'rgba(255, 255, 255, 0.7)'
                                : 'text.secondary',
                            fontSize: '0.7rem',
                        }}
                    >
                        {formatTime(message.timestamp)}
                    </Typography>
                </Paper>

                {/* Quick Reply Buttons */}
                {message.quickReplies && message.quickReplies.length > 0 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {message.quickReplies.map((reply, index) => (
                            <Chip
                                key={index}
                                label={reply}
                                onClick={() => onQuickReply(reply)}
                                size="small"
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    color: message.type === 'user' ? 'white' : 'primary.main',
                                    border: `1px solid ${message.type === 'user' ? 'rgba(255, 255, 255, 0.3)' : theme.palette.primary.main}`,
                                    '&:hover': {
                                        backgroundColor: message.type === 'user'
                                            ? 'rgba(255, 255, 255, 0.2)'
                                            : theme.palette.primary.main,
                                        color: message.type === 'user' ? 'white' : 'white',
                                    },
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                }}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default MessageBubble;
