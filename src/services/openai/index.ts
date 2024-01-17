import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { generatePrompt, generatePromptDetermine, generatePromptGetInfo } from "./prompt";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai2 = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY2,
});

const openai3 = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY3,
});

/**
 * 
 * @param name 
 * @param history 
 */
const run = async (name: string, history: ChatCompletionMessageParam[]): Promise<string> => {

    const promtp = generatePrompt(name)
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "system",
                "content": promtp
            },
            ...history
        ],
        temperature: 1,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content
}

const runDetermine = async (history: ChatCompletionMessageParam[]): Promise<string> => {

    const promtp = generatePromptDetermine()
    const response = await openai2.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "system",
                "content": promtp
            },
            ...history
        ],
        temperature: 1,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content
}

const test = async (history: ChatCompletionMessageParam[]): Promise<string> => {

    const promtp = generatePromptGetInfo()
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "system",
                "content": promtp
            },
            ...history
        ],
        temperature: 1,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content
}

const runGetInfo = async (history: ChatCompletionMessageParam[]): Promise<string> => {

    const promtp = generatePromptGetInfo()
    const response = await openai3.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "system",
                "content": promtp
            },
            ...history
        ],
        temperature: 1,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content
}

export { run, runDetermine, runGetInfo, test }


