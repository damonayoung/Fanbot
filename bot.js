const { ActivityHandler, MessageFactory } = require('botbuilder');
const OpenAI = require('@azure/openai');

class FanBot extends ActivityHandler {
    constructor() {
        super();

        // Initialize OpenAI client
        this.openAIClient = new OpenAI.OpenAIClient(
            process.env.AZURE_OPENAI_ENDPOINT,
            new OpenAI.AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
        );

        this.onMessage(async (context, next) => {
            const userMessage = context.activity.text;

            try {
                // Generate response using Azure OpenAI
                const response = await this.generateOpenAIResponse(userMessage);
                await context.sendActivity(MessageFactory.text(response, response));
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
                }
            }
            await next();
        });
    }

    async generateOpenAIResponse(userMessage) {
        const messages = [
            { role: "system", content: "You are a supportive and encouraging AI assistant named FanBot. Your purpose is to provide personalized motivation, advice, and emotional support to users." },
            { role: "user", content: userMessage }
        ];

        const result = await this.openAIClient.getChatCompletions(
            process.env.AZURE_OPENAI_DEPLOYMENT,
            messages,
            { maxTokens: 800 }
        );

        return result.choices[0].message.content;
    }
}

module.exports.FanBot = FanBot;