import BotWhatsapp from '@bot-whatsapp/bot';
import welcomeFlow from './welcome.flow';
import { preguntarDiaFlow, preguntarDeporteFlow, reservarFlow, preguntarHoraFlow } from './reservar.flow';
import { chequearDisponibilidad } from './disponibilidad/disponibilidad.flow';

/**
 * Debes de implementasr todos los flujos
 */
export default BotWhatsapp.createFlow(
    [
        welcomeFlow,
        preguntarDiaFlow,
        preguntarDeporteFlow,
        reservarFlow,
        preguntarHoraFlow,
        chequearDisponibilidad
    ]
)