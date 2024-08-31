// bot.js
const { ActivityHandler, MessageFactory } = require('botbuilder');

class FanBot extends ActivityHandler {
    constructor() {
        super();
        this.onMessage(async (context, next) => {
            let responseText = "I'm here to support you. What would you like to talk about? Career, relationships, or motivation?";
            
            if (context.activity.text.toLowerCase().includes('career')) {
                responseText = "Career growth can be challenging but rewarding. What specific aspect of your career would you like to discuss?";
            } else if (context.activity.text.toLowerCase().includes('relationship')) {
                responseText = "Relationships play a crucial role in our lives. Are you facing any specific challenges in your relationships?";
            } else if (context.activity.text.toLowerCase().includes('motivation')) {
                responseText = "Staying motivated is key to achieving our goals. What area of your life do you need motivation in right now?";
            }

            await context.sendActivity(MessageFactory.text(responseText, responseText));
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Welcome to FanBot! I\'m here to provide support and encouragement. How can I help you today?';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            await next();
        });
    }
}

module.exports.FanBot = FanBot;