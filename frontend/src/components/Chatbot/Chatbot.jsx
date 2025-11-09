import { useNavigate } from 'react-router-dom';
import {
    Fab,
    useTheme,
} from '@mui/material';
import {
    Chat as ChatIcon,
} from '@mui/icons-material';

const Chatbot = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const toggleChatbot = () => {
        navigate('/chat-bot');
    };

    return (
        <>
            {/* Floating Chat Button */}
            <Fab
                color="primary"
                onClick={toggleChatbot}
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1000,
                    boxShadow: theme.shadows[8],
                }}
            >
                <ChatIcon />
            </Fab>
        </>
    );
};

export default Chatbot;
