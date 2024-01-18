import BotWhatsapp from '@bot-whatsapp/bot';
import { ChatCompletionMessageParam } from 'openai/resources';
import { runGetInfo, test } from 'src/services/openai';
import { chequearDisponibilidad } from './disponibilidad/disponibilidad.flow';


export const reservarFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION).addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
    try {
        const history = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
        console.log(await test(history))
        console.log("HISTORY en reserva", history)
        const getInfo = await runGetInfo(history)
        console.log("INFO", getInfo)
        const { hora, duracion, deporte, dia } = JSON.parse(getInfo)
        await state.update({ getInfo: JSON.parse(getInfo) })
        if (dia === "unknown") {
            return gotoFlow(preguntarDiaFlow)

        } else if (hora === "unknown") {
            return gotoFlow(preguntarHoraFlow)

        } else if (deporte === "unknown") {
            return gotoFlow(preguntarDeporteFlow)

        }
        else {
            return gotoFlow(chequearDisponibilidad)
        }
    } catch (err) {
        console.log(`[ERROR]:`, err)
    }
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
        console.log("FLOW PREGUNTAR DIA", JSON.parse(getInfo))
        return gotoFlow(reservarFlow)

    })


export const preguntarHoraFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION).addAnswer("en que horario que te gustaria reservar?",
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
        console.log("FLOW PREGUNTAR HORA", JSON.parse(getInfo))
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
        console.log("FLOW PREGUNTAR HORA Y DIA", JSON.parse(getInfo))
        return gotoFlow(reservarFlow)

    })
