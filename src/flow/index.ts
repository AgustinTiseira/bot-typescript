import BotWhatsapp from '@bot-whatsapp/bot';
import welcomeFlow from './welcome.flow';
import { preguntarDiaFlow, preguntarDeporteFlow, reservarFlow, preguntarHoraFlow, preguntarDuracionFlow, preguntarNombreFlow } from './reservar.flow';
import { chequearDisponibilidad, confirmarReserva, ofrecerOtroHorario } from './disponibilidad/disponibilidad.flow';
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
        chequearDisponibilidad,
        ofrecerOtroHorario,
        confirmarReserva,
        preguntarDuracionFlow,
        preguntarNombreFlow
    ]
)