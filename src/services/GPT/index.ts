import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { generatePromptChiste } from "./prompt";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export const runChiste = async (history: ChatCompletionMessageParam[]): Promise<string> => {
    try {
        const promtp = generatePromptChiste()
        const response = await openai.chat.completions.create({
            messages: [
                {
                    "role": "system",
                    "content": promtp
                },
                ...history
            ],
            model: "gpt-3.5-turbo-1106",
            temperature: 1,
            max_tokens: 800,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,

        });
        return response.choices[0].message.content
    } catch (err) {
        console.error("[ERROR]: ", err)
    }
}