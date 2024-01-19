import BotWhatsapp from '@bot-whatsapp/bot';
import { DateTime } from 'luxon';
import { ChatCompletionMessageParam } from 'openai/resources';
import { buscarHorariosDisponibles, haySuperposicion } from 'src/services/functions/chequearDisponibilidad';
import { createEvent, getEvents } from 'src/services/functions/make';
import { runDeterminarDesicion } from 'src/services/openai';


const convertirTiempoAMinutos = (tiempoString: string): number => {
    // Expresión regular mejorada para extraer horas y minutos
    const regex = /^(\d+)\s*(?:hora|hs|hour|hours?)?(?::(\d+))?\s*$/;

    // Obtener las coincidencias de la expresión regular
    const match = (tiempoString === "unknown" ? "1 hora" : tiempoString).match(regex);

    if (!match) {
        throw new Error('Formato de tiempo no válido');
    }

    // Extraer horas y minutos de las coincidencias
    const horas = parseInt(match[1], 10) || 0;
    const minutos = parseInt(match[2], 10) || 0;

    // Calcular el total de minutos
    const totalMinutos = horas * 60 + minutos;

    return totalMinutos;
};

type ReservaFormatoEntrada = {
    start: string;
    end: string;
    summary: string;
};

export type ReservaFormatoSalida = {
    inicio: DateTime;
    fin: DateTime;
    descripcion: string;
};

function convertirFormatoReservas(reservasEntrada: ReservaFormatoEntrada[]): ReservaFormatoSalida[] {
    return reservasEntrada.map((reserva) => ({
        inicio: DateTime.fromFormat(reserva.start, "yyyy-MM-dd hh:mm a", { zone: "America/Argentina/Buenos_Aires" }),
        fin: DateTime.fromFormat(reserva.end, "yyyy-MM-dd hh:mm a", { zone: "America/Argentina/Buenos_Aires" }),
        descripcion: reserva.summary
    }));
}


//FLOWWWWW


export const chequearDisponibilidad = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION)
    .addAction(async (ctx, { flowDynamic, state, gotoFlow, endFlow }) => {
        try {
            const newHistory = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
            const { dia, duracion, hora, deporte } = state.getMyState()?.getInfo
            const events = await getEvents(dia)
            const horaDeComienzo = DateTime.fromFormat(`${dia} ${hora}`, "dd-MM-yyyy h:mm a", { zone: "America/Argentina/Buenos_Aires" })
            const noEstaDisponible = haySuperposicion(horaDeComienzo, horaDeComienzo.plus({ minutes: convertirTiempoAMinutos(duracion) }), convertirFormatoReservas(events))
            if (noEstaDisponible) {
                const msjs = buscarHorariosDisponibles(horaDeComienzo, convertirTiempoAMinutos(duracion), convertirFormatoReservas(events)).map((horario, index) => {
                    return { body: `*${index + 1}*. ${horario}` }
                })
                if (msjs.length === 0) {
                    newHistory.push({
                        role: 'assistant',
                        content: `no hay horarios disponibles para el dia que me pediste ${(dia)}`
                    })

                    await state.update({ history: newHistory })
                    return endFlow(`no hay horarios disponibles para el dia que me pediste ${(dia)}`)
                }
                await flowDynamic([{ body: "El horario que me pediste no esta disponible, te puedo ofrecer otro turno?" }, ...msjs.slice(0, 8)])

                newHistory.push({
                    role: 'assistant',
                    content: "El horario que me pediste no esta disponible, te puedo ofrecer otro turno?"
                })

                await state.update({ history: newHistory, horariosDisponibles: msjs })
                return gotoFlow(ofrecerOtroHorario)
            } else {
                await flowDynamic([{ body: "El horario que me pediste esta disponible" }, { body: `*DIA*: ${dia} \n*HORA*: ${hora} \n*DEPORTE*: ${deporte} \n*DURACION*: ${duracion}` }])

                newHistory.push({
                    role: 'assistant',
                    content: `El horario que me pediste esta disponible *DIA*: ${dia} \n*HORA*: ${hora} \n*DEPORTE*: ${deporte} \n*DURACION*: ${duracion}`
                })

                await state.update({ history: newHistory, getInfo: { ...state.getMyState()?.getInfo, dia: horaDeComienzo } })
                return gotoFlow(confirmarReserva)
            }
        } catch (err) {
            console.log(`[ERROR]:`, err)
        }
    })

export const ofrecerOtroHorario = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION).addAnswer(["Te interesa algun horario? indicame el numero de la opcion que te interesa"],
    { capture: true }, async (ctx, { state, gotoFlow, flowDynamic }) => {
        // tomar la opcion que eligio el usuario
        const selectedOption = state.getMyState().horariosDisponibles[+ctx.body - 1];
        console.log(selectedOption)
        // formatearlo a formato 12 horas
        const selectedTime = DateTime.fromFormat(selectedOption.body.split(" ")[1], "H:mm", { zone: "America/Argentina/Buenos_Aires" });
        const formattedTime = selectedTime.toFormat("h:mm a");

        // asignarlo a getInfo.hora
        await state.update({ getInfo: { ...state.getMyState()?.getInfo, hora: formattedTime } })

        // redirigir a chequearDisponibilidad
        return gotoFlow(chequearDisponibilidad);
    })

export const confirmarReserva = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION).addAnswer(["Te lo reservo? \n*SI* - *NO*"], { capture: true }, async (ctx, { state, gotoFlow, flowDynamic }) => {
    const newHistory = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]

    newHistory.push({
        role: 'assistant',
        content: "Te lo reservo? \n*SI* - *NO*"
    })

    newHistory.push({
        role: 'user',
        content: ctx.body
    })

    const ai = await runDeterminarDesicion(newHistory, ctx.body)
    if (ai.toLowerCase() === "reservar") {
        console.log("RESERVA")
        await createEvent({ ...state.getMyState()?.getInfo, telefono: ctx.from, nombre: ctx.pushName })
    }
    if (ai.toLowerCase() === "cancelar") {
        console.log("CANCELAR")
    }
    if (ai.toLowerCase() === "espera") {
        console.log("ESPERA")
    }
    await state.update({ history: newHistory })
})