import { DateTime } from "luxon";
import { ReservaFormatoSalida } from "src/flow/disponibilidad/disponibilidad.flow";

type Reserva = {
    inicio: DateTime;
    fin: DateTime;
    descripcion?: string;
};


const estaAbierto = (momento: DateTime): boolean => {
    const zonaHorariaBuenosAires: string = "America/Argentina/Buenos_Aires";
    const horaApertura = DateTime.fromObject({ hour: 10, minute: 0 }, { zone: zonaHorariaBuenosAires });
    const horaCierre = DateTime.fromObject({ hour: 23, minute: 0 }, { zone: zonaHorariaBuenosAires })
    return momento >= horaApertura && momento <= horaCierre;
}
const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const getSportOfEvent = (event: Reserva): string => {
    const descripcion = event.descripcion;
    const deporte = descripcion?.split("-")[0]
    return removeAccents(deporte)
}

export const haySuperposicion = (inicioNuevaReserva: DateTime, finNuevaReserva: DateTime, deporte: string, reservas: Reserva[]): boolean => {
    const arr = []
    reservas.forEach((reserva) => {
        console.log(getSportOfEvent(reserva).toLowerCase(), removeAccents(deporte).toLowerCase())
        if (getSportOfEvent(reserva).toLowerCase() === removeAccents(deporte).toLowerCase() && ((inicioNuevaReserva >= reserva.inicio && inicioNuevaReserva < reserva.fin) ||
            (finNuevaReserva > reserva.inicio && finNuevaReserva <= reserva.fin) ||
            (inicioNuevaReserva <= reserva.inicio && finNuevaReserva >= reserva.fin))) {
            arr.push(reserva)
        }
    })
    console.log(deporte, arr.length, arr)
    if (arr.length > 1) {
        return true; // Hay superposición
    } else {
        return false; // No hay superposición
    }
}

export const buscarHorariosDisponibles = (inicioSolicitado: DateTime, duracion: number, deporte: string, reservasActuales: ReservaFormatoSalida[]): string[] => {
    const zonaHorariaBuenosAires: string = "America/Argentina/Buenos_Aires";
    const horaCierre = DateTime.fromObject({ year: inicioSolicitado.year, month: inicioSolicitado.month, day: inicioSolicitado.day, hour: 0, minute: 0 }, { zone: zonaHorariaBuenosAires }).plus({ days: 1 });
    const horariosDisponibles: string[] = [];
    const intervaloBusqueda = 60; // Intervalo de búsqueda en minutos
    let inicioAlternativo = inicioSolicitado.set({ hour: inicioSolicitado.hour - 2 });



    while (true) {
        const finAlternativo = inicioAlternativo.plus({ minutes: duracion });
        if (!haySuperposicion(inicioAlternativo, finAlternativo, removeAccents(deporte).toLowerCase(), reservasActuales)) {
            horariosDisponibles.push(`${inicioAlternativo.toISOTime().split(":")[0]}:${inicioAlternativo.toISOTime().split(":")[1]}`);
        }

        inicioAlternativo = inicioAlternativo.plus({ minutes: intervaloBusqueda });
        if (inicioAlternativo > horaCierre) {
            break;
        }
    }

    return horariosDisponibles;
}