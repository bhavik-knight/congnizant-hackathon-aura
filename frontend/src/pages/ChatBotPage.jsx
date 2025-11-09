import {
    Container,
    Typography,
    Box,
    Paper,
    IconButton,
    useTheme,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { useChatbot } from '../components/Chatbot/useChatbot';
import MessageBubble from '../components/Chatbot/MessageBubble';
import ChatInput from '../components/Chatbot/ChatInput';

const ChatBotPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const {
        messages,
        isTyping,
        sendMessage,
        handleQuickReply,
        clearChat
    } = useChatbot();

    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    return (
        <Container maxWidth={false} sx={{ width: '70%', minHeight: '100vh', py: 2, maxWidth: '1200px' }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        onClick={handleBack}
                        sx={{ mr: 2 }}
                        size="large"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Aura Assistant
                    </Typography>
                </Box>

                <IconButton
                    onClick={clearChat}
                    sx={{ color: theme.palette.text.secondary }}
                    size="large"
                >
                    <DeleteIcon />
                </IconButton>
            </Box>

            {/* Chat Container */}
            <Paper
                sx={{
                    height: '80vh',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: theme.shadows[4],
                }}
            >
                {/* Messages Container */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        p: 3,
                        backgroundColor: theme.palette.background.default,
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: theme.palette.background.paper,
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: theme.palette.divider,
                            borderRadius: '3px',
                        },
                    }}
                >
                    {messages.map((message) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            onQuickReply={handleQuickReply}
                        />
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                mb: 2,
                            }}
                        >
                            <Box sx={{ maxWidth: '80%', minWidth: '200px' }}>
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 2,
                                        borderRadius: '18px 18px 18px 4px',
                                        backgroundColor: theme.palette.background.paper,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <CircularProgress size={16} sx={{ mr: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            Aura is thinking...
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    )}
                </Box>

                {/* Input Area */}
                <ChatInput
                    onSendMessage={sendMessage}
                    disabled={isTyping}
                />
            </Paper>
        </Container>
    );
};

export default ChatBotPage;
