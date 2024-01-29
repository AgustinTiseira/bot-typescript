import BotWhatsapp from '@bot-whatsapp/bot';
import { ChatCompletionMessageParam } from 'openai/resources';
import { runChiste } from 'src/services/GPT';


export default BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.WELCOME)
    .addAction(async (ctx, { state, gotoFlow, flowDynamic }) => {
        console.log(ctx.body)
        const history = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
        history.push({
            role: 'user',
            content: ctx.body
        })
        const ai = await runChiste(history)
        history.push({
            role: 'system',
            content: ai
        })
        await state.update({ history: history })
        await flowDynamic(ai)
    })


