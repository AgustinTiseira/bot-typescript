/* import BotWhatsapp from '@bot-whatsapp/bot';
import { ChatCompletionMessageParam } from 'openai/resources';
import { runGetInfo, runHacerPreguntas } from 'src/services/openai';

export const reservarFlow = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION).addAction(async (ctx, { flowDynamic, state }) => {
    try {
        const history = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
        const getInfo = await runGetInfo(history)
        console.log("INFO", getInfo)
        const { hora, duracion, deporte, dia } = JSON.parse(getInfo)
        await state.update({ getInfo: getInfo })
        if (hora === "unknown" || duracion === "unknown" || deporte === "unknown" || dia === "unknown") {
            console.log("entro")
            return await flowDynamic([{ body: await runHacerPreguntas(history, getInfo) }])
        } else {
            console.log("INFO COMPLETA", getInfo)
        }
    } catch (err) {
        console.log(`[ERROR]:`, err)
    }
}).addAnswer('...', { capture: true },
    async (ctx, { state, gotoFlow, }) => {
        console.log("BODY", ctx.body)
        const newHistory = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
        newHistory.push({
            role: 'user',
            content: ctx.body
        })
        await state.update({ history: newHistory })
        const getInfo = await runGetInfo(newHistory)
        const { hora, duracion, deporte, dia } = JSON.parse(getInfo)
        if (hora === "unknown" || duracion === "unknown" || deporte === "unknown" || dia === "unknown") {
            console.log("vuelve a preguntar")
            return gotoFlow(reservarFlow)
        }
        else {
            console.log("INFO COMPLETA", getInfo)
        }
    })




/* 
    .addAnswer('¿Como es tu email? lo necesito para generar link de', { capture: true },
        async (ctx, { state, fallBack }) => {

            if (!ctx.body.includes('@')) {
                return fallBack('Eyy!bro esto no es un email valido! ponte serio')
            }
            await state.update({ email: ctx.body.toLowerCase() })
        })
    .addAnswer('...generando link de pago de curso de node')
 */ 