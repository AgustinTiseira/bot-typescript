import BotWhatsapp from '@bot-whatsapp/bot';
import { DateTime } from 'luxon';
import { ChatCompletionMessageParam } from 'openai/resources';
import { buscarHorariosDisponibles, haySuperposicion } from 'src/services/functions/chequearDisponibilidad';
import { createEvent, getEvents } from 'src/services/functions/make';
import { createUser, findUser, updateEvents } from 'src/services/functions/mongo';
import { runDeterminarDesicion, runDeterminarHorario } from 'src/services/openai';


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
            console.log(dia, duracion, hora, deporte)
            const events = await getEvents(dia)
            console.log(events)
            const horaDeComienzo = DateTime.fromFormat(`${dia} ${hora}`, "dd-MM-yyyy h:mm a", { zone: "America/Argentina/Buenos_Aires" })
            const noEstaDisponible = haySuperposicion(horaDeComienzo, horaDeComienzo.plus({ minutes: convertirTiempoAMinutos(duracion) }), deporte, convertirFormatoReservas(events))
            if (noEstaDisponible) {
                const msjs = buscarHorariosDisponibles(horaDeComienzo, convertirTiempoAMinutos(duracion), deporte, convertirFormatoReservas(events)).map((horario, index) => {
                    return { body: horario }
                })
                if (msjs.length === 0) {
                    newHistory.push({
                        role: 'assistant',
                        content: `no hay horarios disponibles para el dia que me pediste ${(dia)}`
                    })

                    await state.update({ history: newHistory })
                    state.update({ history: [] })
                    return endFlow(`no hay horarios disponibles para el dia que me pediste ${(dia)}`)
                }
                await flowDynamic([{ body: "El horario que me pediste no esta disponible, te puedo ofrecer otro turno?" }, ...msjs.slice(0, 8)])

                newHistory.push({
                    role: 'assistant',
                    content: "El horario que me pediste no esta disponible, te puedo ofrecer otro turno?"
                })
                const horariosDisponibles = msjs.map(msj => msj.body)
                await state.update({ history: newHistory, horariosDisponibles: horariosDisponibles })
                return gotoFlow(ofrecerOtroHorario)
            } else {
                await flowDynamic([{ body: "El horario que me pediste esta disponible" }, { body: `*DIA*: ${dia} \n*HORA*: ${hora} \n*DEPORTE*: ${deporte} \n*DURACION*: ${duracion}` }])

                newHistory.push({
                    role: 'assistant',
                    content: `El horario que me pediste esta disponible *DIA*: ${dia} \n*HORA*: ${hora} \n*DEPORTE*: ${deporte} \n*DURACION*: ${duracion}`
                })

                await state.update({ history: newHistory })
                return gotoFlow(confirmarReserva)
            }
        } catch (err) {
            console.log(`[ERROR]:`, err)
        }
    })

export const ofrecerOtroHorario = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION).addAnswer(["Te sirve alguno? indicame el horario"],
    { capture: true }, async (ctx, { state, gotoFlow }) => {
        // tomar la opcion que eligio el usuario
        const history = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
        const selectedOption = await runDeterminarHorario(history, ctx.body, state.getMyState().horariosDisponibles)
        // asignarlo a getInfo.hora
        await state.update({ getInfo: { ...state.getMyState()?.getInfo, hora: JSON.parse(selectedOption).horario } })

        // redirigir a chequearDisponibilidad
        return gotoFlow(chequearDisponibilidad);
    })

const convertirStringAJSON = (str: string) => {
    const partes = str.split('\n');
    const json = {
        reservada: partes[0],
        ID: partes[1],
        summary: partes[2].split(':')[1].trim(),
        start: DateTime.fromISO(partes[3].split(':')[1].trim()).minus({ hour: 3 }).setZone("America/Argentina/Buenos_Aires"),
        end: DateTime.fromISO(partes[4].split(':')[1].trim()).minus({ hour: 3 }).setZone("America/Argentina/Buenos_Aires")
    };

    return json;
}

export const confirmarReserva = BotWhatsapp.addKeyword(BotWhatsapp.EVENTS.ACTION).addAnswer(["Te lo reservo?"], { capture: true }, async (ctx, { state, gotoFlow, provider, endFlow }) => {
    const newHistory = (state.getMyState()?.history ?? []) as ChatCompletionMessageParam[]
    newHistory.push({
        role: 'assistant',
        content: "Te lo reservo?"
    })

    newHistory.push({
        role: 'user',
        content: ctx.body
    })

    const ai = await runDeterminarDesicion(newHistory, ctx.body)
    if (ai.toLowerCase() === "reservar") {
        const { dia, hora } = state.getMyState()?.getInfo
        const horaDeComienzo = DateTime.fromFormat(`${dia} ${hora}`, "dd-MM-yyyy h:mm a", { zone: "America/Argentina/Buenos_Aires" })
        const res = await createEvent({ ...state.getMyState()?.getInfo, dia: horaDeComienzo, telefono: ctx.from, nombre: ctx.pushName })
        const json = convertirStringAJSON(res)
        const user = await findUser(ctx.from)
        if (user) {
            await updateEvents(ctx.from, { ...state.getMyState()?.getInfo, ID: json.ID })
        }
        provider.sendText(
            `${5491130207789}@c.us`, `NUEVA RESERVA
            Dia pedido: ${state.getMyState()?.getInfo.dia}
            Dia reservado: ${json.start.toFormat("dd-MM-yyyy")}
            Hora pedida: ${state.getMyState()?.getInfo.hora}
            Hora reservada: ${json.start.toFormat("h:mm a")}
            Deporte: ${state.getMyState()?.getInfo.deporte}
            Duración: ${state.getMyState()?.getInfo.duracion}
            Nombre: ${ctx.pushName}
            Tel: ${ctx.from}
            Mira la reserva en el calendario https://calendar.google.com/`
        )
        state.update({ history: [] })

        return endFlow(`Reserva realizada con exito 
        Dia pedido: ${state.getMyState()?.getInfo.dia}
        Dia reservado: ${json.start.toFormat("dd-MM-yyyy")}
        Hora pedida: ${state.getMyState()?.getInfo.hora}
        Hora reservada: ${json.start.toFormat("h:mm a")}
        Deporte: ${state.getMyState()?.getInfo.deporte}
        Duración: ${state.getMyState()?.getInfo.duracion}
        Nombre: ${ctx.pushName}
        Tel: ${ctx.from}`
        )
    }
    await state.update({ history: newHistory })
    if (ai.toLowerCase() === "cancelar") {
        state.update({ history: [] })
        return endFlow(`Entiendo, cancelamos la reserva`)

    }
    if (ai.toLowerCase() === "espera") {
        state.update({ history: [] })
        return endFlow(`No hay problema cuando sepas avisame`)
    } else {
        return gotoFlow(chequearDisponibilidad)
    }
})