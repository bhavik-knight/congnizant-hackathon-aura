import { useState, useRef, useEffect } from 'react';
import {
    Box,
    TextField,
    IconButton,
    InputAdornment,
    useTheme,
    Tooltip,
} from '@mui/material';
import { Send as SendIcon, Mic as MicIcon, MicOff as MicOffIcon } from '@mui/icons-material';

const ChatInput = ({ onSendMessage, disabled = false }) => {
    const [message, setMessage] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const theme = useTheme();
    const recognitionRef = useRef(null);

    // Check if speech recognition is supported
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setMessage(prev => prev + (prev ? ' ' : '') + transcript);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleVoiceInput = () => {
        if (!isSupported) {
            alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                setIsListening(false);
            }
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper,
            }}
        >
            <TextField
                fullWidth
                multiline
                maxRows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening... Speak now" : "Type your message... (Press Enter to send, Shift+Enter for new line)"}
                disabled={disabled}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: theme.palette.background.default,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                        },
                        ...(isListening && {
                            borderColor: theme.palette.secondary.main,
                            boxShadow: `0 0 0 2px ${theme.palette.secondary.main}20`,
                        }),
                    },
                }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {isSupported && (
                                <Tooltip title={isListening ? "Stop listening" : "Voice input"}>
                                    <IconButton
                                        onClick={handleVoiceInput}
                                        disabled={disabled}
                                        sx={{
                                            color: isListening
                                                ? theme.palette.secondary.main
                                                : theme.palette.text.secondary,
                                            mr: 1,
                                            '&:hover': {
                                                backgroundColor: isListening
                                                    ? theme.palette.secondary.main + '20'
                                                    : theme.palette.action.hover,
                                            },
                                        }}
                                    >
                                        {isListening ? <MicOffIcon /> : <MicIcon />}
                                    </IconButton>
                                </Tooltip>
                            )}
                            <IconButton
                                type="submit"
                                disabled={!message.trim() || disabled}
                                sx={{
                                    color: message.trim() && !disabled
                                        ? theme.palette.primary.main
                                        : theme.palette.text.disabled,
                                    '&:hover': {
                                        backgroundColor: message.trim() && !disabled
                                            ? theme.palette.primary.main + '10'
                                            : 'transparent',
                                    },
                                }}
                            >
                                <SendIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        </Box>
    );
};

export default ChatInput;
