const { ActivityHandler, MessageFactory } = require('botbuilder');
const openai = require('@azure/openai');

class FanBot extends ActivityHandler {
    constructor() {
        super();

        // Initialize Azure OpenAI client
        this.openAIClient = new openai.OpenAIClient(
            process.env.AZURE_OPENAI_ENDPOINT,
            new openai.AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
        );

        // ... rest of your constructor
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