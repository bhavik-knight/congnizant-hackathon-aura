import { useState, useCallback, useEffect } from 'react';
import nlpService from './nlpService';

const CHAT_HISTORY_KEY = 'aura_chat_history';

export const useChatbot = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: "👋 Hi! I'm Aura's AI assistant. I can help you schedule your appliances during optimal green energy windows to reduce your carbon footprint. What would you like to schedule today?",
            timestamp: new Date(),
            quickReplies: ['Schedule laundry', 'Cook dinner', 'Charge EV', 'Help']
        }
    ]);

    const [isTyping, setIsTyping] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Load chat history from localStorage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
        if (savedHistory) {
            try {
                const parsedHistory = JSON.parse(savedHistory);
                // Convert timestamp strings back to Date objects
                const historyWithDates = parsedHistory.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                setMessages(historyWithDates);
            } catch (error) {
                console.error('Error loading chat history:', error);
                // If there's an error, keep the default welcome message
            }
        }
    }, []);

    // Save chat history to localStorage whenever messages change
    useEffect(() => {
        if (messages.length > 1) { // Don't save just the welcome message
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
        }
    }, [messages]);

    // Get task-specific details
    const getTaskDetails = useCallback((task) => {
        const details = {
            washer: 'Washer: 45 min cycle',
            dryer: 'Dryer: 60 min cycle',
            oven: 'Oven: Pre-heat + cooking time',
            dishwasher: 'Dishwasher: 90 min cycle',
            ev: 'EV Charging: Level 2 charging',
            cooking: 'Oven + prep time',
            laundry: 'Washer + Dryer cycle'
        };

        return details[task.toLowerCase()] || '';
    }, []);

    // Generate mock schedule for demo with green/dirty window logic
    const generateMockSchedule = useCallback((tasks) => {
        const schedule = [];
        const greenWindowStart = 2; // 2 AM
        const greenWindowEnd = 6; // 6 AM (4-hour green window)
        const dirtyWindowStart = 14; // 2 PM
        const dirtyWindowEnd = 18; // 6 PM (4-hour dirty window)

        let currentTime = new Date();
        currentTime.setHours(greenWindowStart, 0, 0, 0); // Start at green window

        // First, schedule tasks in green window (optimal time)
        const greenTasks = [];
        const dirtyTasks = [];

        // Sort tasks by priority (HIGH priority first)
        const sortedTasks = [...tasks].sort((a, b) => {
            // Simple priority logic - you could enhance this
            const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            return (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
        });

        // Distribute tasks between green and dirty windows
        sortedTasks.forEach((task, index) => {
            if (index < 3) { // First 3 tasks go to green window
                greenTasks.push(task);
            } else {
                dirtyTasks.push(task);
            }
        });

        // Schedule green window tasks
        greenTasks.forEach((task) => {
            const startTime = new Date(currentTime);
            const endTime = new Date(currentTime);
            endTime.setHours(endTime.getHours() + 1 + Math.floor(Math.random() * 2)); // 1-3 hours

            // Ensure we don't exceed green window
            if (endTime.getHours() > greenWindowEnd) {
                endTime.setHours(greenWindowEnd, 0, 0, 0);
            }

            schedule.push({
                task: task.charAt(0).toUpperCase() + task.slice(1),
                start_time: startTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }),
                end_time: endTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }),
                details: getTaskDetails(task),
                window: 'green',
                carbon_intensity: 'Low'
            });

            currentTime = new Date(endTime);
            currentTime.setMinutes(currentTime.getMinutes() + 30); // 30 min break
        });

        // Schedule dirty window tasks (if any)
        if (dirtyTasks.length > 0) {
            currentTime = new Date();
            currentTime.setHours(dirtyWindowStart, 0, 0, 0); // Start dirty window

            dirtyTasks.forEach((task) => {
                const startTime = new Date(currentTime);
                const endTime = new Date(currentTime);
                endTime.setHours(endTime.getHours() + 1 + Math.floor(Math.random() * 2)); // 1-3 hours

                // Ensure we don't exceed dirty window
                if (endTime.getHours() > dirtyWindowEnd) {
                    endTime.setHours(dirtyWindowEnd, 0, 0, 0);
                }

                schedule.push({
                    task: task.charAt(0).toUpperCase() + task.slice(1),
                    start_time: startTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    end_time: endTime.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }),
                    details: getTaskDetails(task),
                    window: 'dirty',
                    carbon_intensity: 'Medium'
                });

                currentTime = new Date(endTime);
                currentTime.setMinutes(currentTime.getMinutes() + 30); // 30 min break
            });
        }

        return schedule;
    }, [getTaskDetails]);

    // Call optimization API
    const callOptimizationAPI = useCallback(async (entities) => {
        try {
            // Ensure we have at least 1 task and valid number_of_windows
            const numTasks = Math.max(1, entities.tasks.length);
            const numWindows = Math.min(10, Math.max(1, numTasks)); // Ensure between 1-10

            // Prepare API payload matching backend OptimizeRequest model
            const payload = {
                start_time: '00:00', // Start from beginning of day
                end_time: entities.deadline === 'TOMORROW' ? '06:00' : '23:59',
                number_of_windows: numWindows,
                appliances: entities.tasks.length > 0 ? entities.tasks : ['washer'] // Default to washer if no tasks
            };

            // Call the optimization endpoint
            const response = await fetch('/api/optimize-windows', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            // const data = await response.json();

            return {
                success: true,
                data: {
                    schedule: generateMockSchedule(entities.tasks),
                    impact: {
                        carbon_reduction: (entities.tasks.length * 0.8).toFixed(1),
                        cost_savings: (entities.tasks.length * 5),
                        rating: Math.min(entities.tasks.length, 5)
                    }
                }
            };

        } catch (error) {
            console.error('Optimization API error:', error);
            // Return mock data for demo purposes
            const mockSchedule = generateMockSchedule(entities.tasks);
            return {
                success: true,
                data: {
                    schedule: mockSchedule,
                    impact: {
                        carbon_reduction: (entities.tasks.length * 0.8).toFixed(1),
                        cost_savings: (entities.tasks.length * 5),
                        rating: Math.min(entities.tasks.length, 5)
                    }
                }
            };
        }
    }, [generateMockSchedule]);



    // Send message to chatbot
    const sendMessage = useCallback(async (content) => {
        if (!content.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: content.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        try {
            // Process message with NLP
            const processedData = await nlpService.processMessage(content);

            let apiResult = null;

            // If it's a scheduling request, call the optimization API
            if (processedData.intent === 'SCHEDULE_TASK' && processedData.entities.tasks.length > 0) {
                try {
                    apiResult = await callOptimizationAPI(processedData.entities);
                } catch (apiError) {
                    console.error('API call failed:', apiError);
                }
            }

            // Generate response
            const responseData = await nlpService.generateResponse(processedData, apiResult);

            // Add bot response
            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: responseData.content,
                timestamp: new Date(),
                quickReplies: responseData.quickReplies
            };

            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error('Chatbot error:', error);

            // Add error message
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: "I'm sorry, I encountered an error. Please try again or rephrase your request.",
                timestamp: new Date(),
                quickReplies: ['Try again', 'Help']
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    }, [callOptimizationAPI]);

    // Handle quick reply clicks
    const handleQuickReply = useCallback((reply) => {
        let message = '';

        switch (reply) {
            case 'Schedule laundry':
                message = 'I need to do laundry';
                break;
            case 'Cook dinner':
                message = 'I want to cook dinner tonight';
                break;
            case 'Charge EV':
                message = 'Charge my electric vehicle';
                break;
            case 'Confirm':
                message = 'Yes, please confirm this schedule';
                break;
            case 'Modify':
                message = 'I need to modify this schedule';
                break;
            case 'See Alternatives':
                message = 'Show me alternative schedules';
                break;
            case 'Help':
                message = 'What can you help me with?';
                break;
            case 'Try again':
                message = 'Let me try asking differently';
                break;
            default:
                message = reply;
        }

        sendMessage(message);
    }, [sendMessage]);

    // Clear chat history
    const clearChat = useCallback(() => {
        setMessages([
            {
                id: Date.now(),
                type: 'bot',
                content: "👋 Hi! I'm Aura's AI assistant. I can help you schedule your appliances during optimal green energy windows to reduce your carbon footprint. What would you like to schedule today?",
                timestamp: new Date(),
                quickReplies: ['Schedule laundry', 'Cook dinner', 'Charge EV', 'Help']
            }
        ]);
        nlpService.clearHistory();
        localStorage.removeItem(CHAT_HISTORY_KEY);
    }, []);

    // Toggle chatbot visibility
    const toggleChatbot = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    return {
        messages,
        isTyping,
        isOpen,
        sendMessage,
        handleQuickReply,
        clearChat,
        toggleChatbot,
        setIsOpen
    };
};
