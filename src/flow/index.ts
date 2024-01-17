import BotWhatsapp from '@bot-whatsapp/bot';
import welcomeFlow from './welcome.flow';
import { preguntaDiaYHoraFlow, preguntarDeporteFlow, reservarFlow } from './reservar.flow';

/**
 * Debes de implementasr todos los flujos
 */
export default BotWhatsapp.createFlow(
    [
        welcomeFlow,
        preguntaDiaYHoraFlow,
        preguntarDeporteFlow,
        reservarFlow
    ]
)