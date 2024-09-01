const { ActivityHandler, MessageFactory } = require('botbuilder');
const { OpenAIClient, AzureKeyCredential } = require('@azure/ai-openai');

console.log('OpenAI package exports:', { OpenAIClient, AzureKeyCredential });

class FanBot extends ActivityHandler {
    constructor() {
        super();

        // Initialize OpenAI client
        this.openAIClient = new OpenAIClient(
            process.env.AZURE_OPENAI_ENDPOINT,
            new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
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

        // ... rest of the constructor
    }

    async generateOpenAIResponse(userMessage) {
        const messages = [
            { role: "system", content: "You are a supportive and encouraging AI assistant named FanBot. Your purpose is to provide personalized motivation, advice, and emotional support to users." },
            { role: "user", content: userMessage }
        ];

        const response = await this.openAIClient.getChatCompletions(
            process.env.AZURE_OPENAI_DEPLOYMENT,
            messages,
            { maxTokens: 800 }
        );

        return response.choices[0].message.content;
    }
}

module.exports.FanBot = FanBot;