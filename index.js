import { create } from 'venom-bot'
import * as dotenv from 'dotenv'
import { Configuration, OpenAIApi } from "openai"

dotenv.config()

create({
    session: 'Chat-GPT',
    multidevice: true
})
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

const configuration = new Configuration({
    organization: process.env.ORGANIZATION_ID,
    apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

const getDavinciResponse = async (clientText) => {
    const options = {
        model: "text-davinci-003",
        prompt: clientText,
        temperature: 1,
        max_tokens: 4000
    }
    try {
        const response = await openai.createCompletion(options)
        let botResponse = ""
        response.data.choices.forEach(({ text }) => {
            botResponse += text
        })
        return `Chat GPT 🤖\n\n ${botResponse.trim()}`
    } catch (e) {
        return `❌ OpenAI Response Error: ${e.response.data.error.message}`
    }
}

const commands = (client, message) => {
    const iaCommands = {
        davinci3: "/bot",
    }
    let firstWord = message.text.substring(0, message.text.indexOf(" "));
    switch (firstWord) {
        case iaCommands.davinci3:
            try {
                const question = message.text.substring(message.text.indexOf(" "));
                getDavinciResponse(question).then((response) => {
                    client.sendText(message.from === process.env.BOT_NUMBER ? message.to : message.from, response)
                })
            } catch (e){
                return `❌ OpenAI Response Error: ${e.response.data.error.message}`
            }
            break;
    }
}

async function start(client) {
    client.onAnyMessage((message) => commands(client, message));
}