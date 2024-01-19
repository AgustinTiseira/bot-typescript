import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { generatePrompt, generatePromptDeterminarDecision, generatePromptDetermine, generatePromptGetInfo } from "./prompt";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



export const runGetInfo = async (history: ChatCompletionMessageParam[]): Promise<string> => {
    try {
        const promtp = generatePromptGetInfo()
        const response = await openai.chat.completions.create({
            messages: [
                {
                    "role": "system",
                    "content": promtp
                },
                ...history
            ],
            model: "gpt-3.5-turbo-1106",
            response_format: { type: "json_object" },
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


export const run = async (name: string, history: ChatCompletionMessageParam[]): Promise<string> => {
    try {
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
    } catch (err) {
        console.error("[ERROR]: ", err)
    }
}

export const runDetermine = async (history: ChatCompletionMessageParam[]): Promise<string> => {
    try {
        const promtp = generatePromptDetermine()
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
    } catch (err) {
        console.error("[ERROR]: ", err)
    }
}

export const runDeterminarDesicion = async (history: ChatCompletionMessageParam[], mensaje: string): Promise<string> => {
    try {
        const promtp = generatePromptDeterminarDecision(mensaje)
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
    } catch (err) {
        console.error("[ERROR]: ", err)
    }
}


