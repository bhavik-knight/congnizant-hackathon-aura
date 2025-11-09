class NLPService {
    constructor() {
        this.conversationHistory = [];
    }

    // Process user message and return structured data
    async processMessage(message) {
        try {
            // Extract entities using local processing
            const entities = this.extractEntitiesLocally(message.toLowerCase());

            // Classify intent
            const intent = this.classifyIntentLocally(message.toLowerCase());

            // Add to conversation history
            this.conversationHistory.push({
                role: 'user',
                content: message,
                timestamp: new Date()
            });

            return {
                intent,
                entities,
                originalMessage: message
            };
        } catch (error) {
            console.error('NLP processing error:', error);
            return {
                intent: 'GENERAL_CHAT',
                entities: { tasks: [], deadline: 'FLEXIBLE', duration: 1, priority: 'MEDIUM', constraints: [] },
                originalMessage: message
            };
        }
    }

    // Local fallback for intent classification
    classifyIntentLocally(message) {
        if (message.includes('schedule') || message.includes('run') || message.includes('start') ||
            message.includes('cook') || message.includes('laundry') || message.includes('charge') ||
            message.includes('wash') || message.includes('dry') || message.includes('dish')) {
            return 'SCHEDULE_TASK';
        }

        if (message.includes('change') || message.includes('modify') || message.includes('update')) {
            return 'MODIFY_SCHEDULE';
        }

        if (message.includes('cancel') || message.includes('stop') || message.includes('remove')) {
            return 'CANCEL_TASK';
        }

        if (message.includes('status') || message.includes('when') || message.includes('scheduled')) {
            return 'GET_STATUS';
        }

        return 'GENERAL_CHAT';
    }

    // Local fallback for entity extraction
    extractEntitiesLocally(message) {
        const entities = {
            tasks: [],
            deadline: 'FLEXIBLE',
            duration: 2,
            priority: 'MEDIUM',
            constraints: []
        };

        // Extract appliances/tasks - improved to handle multiple tasks
        const applianceMap = {
            'washer': ['washer', 'washing machine', 'wash', 'laundry', 'do laundry'],
            'dryer': ['dryer', 'drying', 'dry', 'dry clothes'],
            'oven': ['oven', 'cook', 'cooking', 'bake', 'baking', 'cook dinner', 'bake something'],
            'dishwasher': ['dishwasher', 'dishes', 'dish washing', 'wash dishes'],
            'ev': ['ev', 'electric vehicle', 'car', 'vehicle', 'charging', 'charge ev', 'charge car'],
            'vacuum': ['vacuum', 'cleaning', 'clean', 'vacuuming']
        };

        // Check for each appliance type
        Object.entries(applianceMap).forEach(([appliance, keywords]) => {
            if (keywords.some(keyword => message.toLowerCase().includes(keyword))) {
                // Avoid duplicates
                if (!entities.tasks.includes(appliance)) {
                    entities.tasks.push(appliance);
                }
            }
        });

        // Extract time constraints
        if (message.includes('by') || message.includes('before')) {
            if (message.includes('morning') || message.includes('am')) {
                entities.deadline = 'MORNING';
            } else if (message.includes('evening') || message.includes('pm')) {
                entities.deadline = 'EVENING';
            } else if (message.includes('tomorrow')) {
                entities.deadline = 'TOMORROW';
            }
        }

        // Extract priority
        if (message.includes('urgent') || message.includes('asap') || message.includes('immediately')) {
            entities.priority = 'HIGH';
        }

        return entities;
    }

    // Generate chatbot response
    async generateResponse(processedData, apiResult = null) {
        const { intent, entities } = processedData;

        let response = '';
        let quickReplies = [];

        switch (intent) {
            case 'SCHEDULE_TASK':
                if (apiResult && apiResult.success) {
                    const scheduleResponse = this.formatScheduleResponse(apiResult.data);
                    response = scheduleResponse.content;
                    quickReplies = scheduleResponse.quickReplies;
                } else if (entities.tasks.length > 0) {
                    response = `I'd be happy to help you schedule your ${entities.tasks.join(' and ')} task(s). Let me find the optimal green energy window for you.`;
                    quickReplies = ['Add more tasks', 'Change time', 'Help'];
                } else {
                    response = "I'd be happy to help you schedule your tasks. What appliances do you need to run? (washer, dryer, oven, dishwasher, EV charger, etc.)";
                    quickReplies = ['Schedule laundry', 'Cook dinner', 'Charge EV', 'Help'];
                }
                break;

            case 'MODIFY_SCHEDULE':
                response = "I can help you modify your existing schedule. What changes would you like to make?";
                quickReplies = ['Change time', 'Cancel task', 'View schedule'];
                break;

            case 'CANCEL_TASK':
                response = "I'll help you cancel that scheduled task. Which one would you like to cancel?";
                quickReplies = ['Confirm cancel', 'Keep schedule', 'Help'];
                break;

            case 'GET_STATUS':
                response = "Let me check your current scheduled tasks and their status.";
                quickReplies = ['View all', 'Modify', 'Schedule new'];
                break;

            default:
                response = "I'm here to help you optimize your energy usage by scheduling tasks during green energy windows. What would you like to schedule?";
                quickReplies = ['Schedule laundry', 'Cook dinner', 'Charge EV', 'Help'];
        }

        // Add to conversation history
        this.conversationHistory.push({
            role: 'assistant',
            content: response,
            timestamp: new Date()
        });

        return { content: response, quickReplies };
    }

    // Format schedule response
    formatScheduleResponse(scheduleData) {
        if (!scheduleData || !scheduleData.schedule) {
            return {
                content: "I couldn't find an optimal schedule right now. Please try again later.",
                quickReplies: ['Try again', 'Help']
            };
        }

        const { schedule, impact } = scheduleData;
        let response = "✅ **Optimized Schedule Found:**\n\n";

        // Group tasks by window
        const greenTasks = schedule.filter(item => item.window === 'green');
        const dirtyTasks = schedule.filter(item => item.window === 'dirty');

        // Display green window tasks
        if (greenTasks.length > 0) {
            response += "🌱 **Green Window (Low Carbon):** 2:00 AM - 6:00 AM\n";
            greenTasks.forEach((item) => {
                const icon = this.getTaskIcon(item.task);
                response += `${icon} ${item.task}: ${item.start_time} - ${item.end_time}\n`;
                if (item.details) {
                    response += `  - ${item.details}\n`;
                }
            });
            response += "\n";
        }

        // Display dirty window tasks
        if (dirtyTasks.length > 0) {
            response += "⚡ **Dirty Window (Medium Carbon):** 2:00 PM - 6:00 PM\n";
            dirtyTasks.forEach((item) => {
                const icon = this.getTaskIcon(item.task);
                response += `${icon} ${item.task}: ${item.start_time} - ${item.end_time}\n`;
                if (item.details) {
                    response += `  - ${item.details}\n`;
                }
            });
            response += "\n";
        }

        if (impact) {
            response += `📊 **Impact:**\n`;
            response += `• Total Tasks Scheduled: ${schedule.length}\n`;
            response += `• Green Window Tasks: ${greenTasks.length}\n`;
            if (dirtyTasks.length > 0) {
                response += `• Dirty Window Tasks: ${dirtyTasks.length}\n`;
            }
            response += `• Carbon Reduction: ${impact.carbon_reduction || 'N/A'} kg CO₂\n`;
            response += `• Estimated Savings: $${impact.cost_savings || 'N/A'} this month\n`;
            response += `• Green Window Utilized: ${'★'.repeat(Math.min(greenTasks.length, 5))}\n\n`;
        }

        response += "Would you like to confirm this schedule?";

        return {
            content: response,
            quickReplies: ['Confirm', 'Modify', 'See Alternatives']
        };
    }

    // Get appropriate icon for task
    getTaskIcon(task) {
        const icons = {
            'cooking': '🍳',
            'laundry': '👕',
            'washer': '🧺',
            'dryer': '👕',
            'ev': '🚗',
            'dishwasher': '🍽️',
            'vacuum': '🧹'
        };

        return icons[task.toLowerCase()] || '⚡';
    }

    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
    }

    // Get conversation history
    getHistory() {
        return this.conversationHistory;
    }
}

// Export singleton instance
const nlpService = new NLPService();
export default nlpService;
