import BotWhatsapp from '@bot-whatsapp/bot';
import welcomeFlow from './welcome.flow';
/**
 * Debes de implementasr todos los flujos
 */
export default BotWhatsapp.createFlow(
    [
        welcomeFlow
    ]
)