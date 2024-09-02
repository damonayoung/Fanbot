const { ActivityHandler, MessageFactory } = require('botbuilder');
const { AzureOpenAI } = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const apiVersion = "2024-05-01-preview";

// In-memory storage for conversation history
const conversationHistories = {};

// Preloaded questions
const preloadedQuestions = [
    "What are your goals for today?",
    "How can I assist you in achieving your goals?",
    "Is there anything specific you need help with?",
    "What’s something you’re working towards right now that’s really important to you?"
];

class FanBot extends ActivityHandler {
    constructor() {
        super();

        // Initialize OpenAI client
        this.openAIClient = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });

        this.onMessage(async (context, next) => {
            const userId = context.activity.from.id;
            const userMessage = context.activity.text;

            // Ensure conversation history exists for the user
            if (!conversationHistories[userId]) {
                conversationHistories[userId] = [
                    { role: "system", content: "You are a supportive and encouraging AI assistant named FanBot. Your purpose is to provide personalized motivation, advice, and emotional support to users." }
                ];
            }

            // Append user message to conversation history
            conversationHistories[userId].push({ role: "user", content: userMessage });

            try {
                // Generate response using Azure OpenAI
                const response = await this.generateOpenAIResponse(userId);
                const assistantMessage = response.choices[0].message.content;

                // Append assistant response to conversation history
                conversationHistories[userId].push({ role: "assistant", content: assistantMessage });

                await context.sendActivity(MessageFactory.text(assistantMessage, assistantMessage));
            } catch (error) {
                console.error('Error generating response:', error);
                await context.sendActivity("I apologize, I'm having trouble generating a response right now. Can you please try again?");
            }

            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Welcome to FanBot! I\'m here to provide personalized support and encouragement. How can I help you today?';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                    // Send preloaded questions to the user
                    for (const question of preloadedQuestions) {
                        await context.sendActivity(MessageFactory.text(question, question));
                    }
                }
            }
            await next();
        });
    }

    async generateOpenAIResponse(userId) {
        const messages = conversationHistories[userId];

        try {
            const result = await this.openAIClient.chat.completions.create({
                messages: messages,
                model: deployment,
            });
            return result;
        } catch (error) {
            console.error('Error calling OpenAI API:', error);
            throw error;
        }
    }
}

module.exports.FanBot = FanBot;