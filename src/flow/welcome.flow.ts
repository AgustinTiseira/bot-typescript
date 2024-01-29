import BotWhatsapp from '@bot-whatsapp/bot';
import { ChatCompletionMessageParam } from 'openai/resources';
import { run, runDetermine, runGetInfo } from 'src/services/openai';
import { reservarFlow } from './reservar.flow';


export default BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.WELCOME)
    .addAction(async (ctx, { state, gotoFlow }) => {
        try {
            const history = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
            const ai = await runDetermine(history, ctx.body)

            history.push({
                role: 'user',
                content: ctx.body
            })

            await state.update({ history: history })

            console.log(`[INTENCION]:`, ai.toLowerCase())
            if (ai.toLowerCase() === "reservar") {
                return gotoFlow(reservarFlow)
            }

        } catch (err) {
            console.log(`[ERROR]:`, err)
            return
        }
    })
    .addAction(async (ctx, { flowDynamic, state }) => {
        try {
            const newHistory = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
            const name = ctx?.pushName ?? ''

            console.log(`[HISTORY]:`, newHistory)

            const largeResponse = await run(name, newHistory)

            const chunks = largeResponse.split(/(?<!\d)\.\s+/g);
            for (const chunk of chunks) {
                await flowDynamic(chunk)
            }

            newHistory.push({
                role: 'assistant',
                content: largeResponse
            })

            await state.update({ history: newHistory })

        } catch (err) {
            console.log(`[ERROR]:`, err)
        }
    })


