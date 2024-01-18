import BotWhatsapp from '@bot-whatsapp/bot';
import { getEvents } from 'src/services/functions/make';

export const chequearDisponibilidad = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow }) => {
        try {
            const day = state.getMyState()?.getInfo?.dia
            const events = await getEvents(day)
            console.log("EVENTS", events)
        } catch (err) {
            console.log(`[ERROR]:`, err)
        }
    })
