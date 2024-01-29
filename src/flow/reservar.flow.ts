import BotWhatsapp from '@bot-whatsapp/bot';
import { ChatCompletionMessageParam } from 'openai/resources';
import { runGetInfo } from 'src/services/openai';
import { chequearDisponibilidad } from './disponibilidad/disponibilidad.flow';
import { createUser, findUser } from 'src/services/functions/mongo';


export const reservarFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION).addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
    try {
        const history = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
        const getInfo = await runGetInfo(history)
        const { hora, duracion, deporte, dia } = JSON.parse(getInfo)
        const user = await findUser(ctx.from)
        await state.update({ getInfo: JSON.parse(getInfo) })
        if (dia === "unknown" || dia === "desconocido") {
            return gotoFlow(preguntarDiaFlow)

        } else if (hora === "unknown" || hora === "desconocido") {
            return gotoFlow(preguntarHoraFlow)

        } else if (deporte === "unknown" || deporte === "desconocido") {
            return gotoFlow(preguntarDeporteFlow)

        } else if (duracion === "unknown" || duracion === "desconocido") {
            return gotoFlow(preguntarDuracionFlow)
        } else if (!user) {
            return gotoFlow(preguntarNombreFlow)
        }
        else {
            return gotoFlow(chequearDisponibilidad)
        }
    } catch (err) {
        console.log(`[ERROR]:`, err)
    }
})

export const preguntarNombreFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION).addAnswer("Como es tu nombre? asi te agendo, ya te digo si esta disponible",
    { capture: true }, async (ctx, { state, gotoFlow }) => {

        const newHistory = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]

        newHistory.push({
            role: 'assistant',
            content: "Como es tu nombre? asi te agendo, ya te digo si esta disponible"
        })

        newHistory.push({
            role: 'user',
            content: ctx.body
        })

        await state.update({ name: ctx.body, history: newHistory })
        await createUser(ctx.from, ctx.body)
        return gotoFlow(reservarFlow)
    })

export const preguntarDiaFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION).addAnswer("para que dia seria la reserva?",
    { capture: true }, async (ctx, { state, gotoFlow }) => {
        const newHistory = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
        newHistory.push({
            role: 'assistant',
            content: "que dia y horario que te gustaria reservar?"
        })

        newHistory.push({
            role: 'user',
            content: ctx.body
        })


        const getInfo = await runGetInfo(newHistory)
        await state.update({ getInfo: JSON.parse(getInfo), history: newHistory })
        return gotoFlow(reservarFlow)

    })


export const preguntarHoraFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION).addAnswer("En que horario que te gustaria reservar?",
    { capture: true }, async (ctx, { state, gotoFlow }) => {

        const newHistory = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]

        newHistory.push({
            role: 'assistant',
            content: "en que horario que te gustaria reservar?"
        })

        newHistory.push({
            role: 'user',
            content: ctx.body
        })


        const getInfo = await runGetInfo(newHistory)
        await state.update({ getInfo: JSON.parse(getInfo), history: newHistory })
        return gotoFlow(reservarFlow)

    })


export const preguntarDeporteFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION).addAnswer("Juegan Futbol o Padel?",
    { capture: true }, async (ctx, { state, gotoFlow }) => {

        const newHistory = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]

        newHistory.push({
            role: 'assistant',
            content: "Juegan Futbol o Padel?"
        })

        newHistory.push({
            role: 'user',
            content: ctx.body
        })
        await state.update({ history: newHistory })

        const getInfo = await runGetInfo(newHistory)
        await state.update({ getInfo: JSON.parse(getInfo) })
        return gotoFlow(reservarFlow)

    })

export const preguntarDuracionFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION).addAnswer("cuantas horas queres jugar?",
    { capture: true }, async (ctx, { state, gotoFlow }) => {

        const newHistory = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]

        newHistory.push({
            role: 'assistant',
            content: "cuantas horas queres jugar?"
        })

        newHistory.push({
            role: 'user',
            content: ctx.body
        })
        await state.update({ history: newHistory })

        const getInfo = await runGetInfo(newHistory)
        await state.update({ getInfo: JSON.parse(getInfo) })
        return gotoFlow(reservarFlow)

    })
