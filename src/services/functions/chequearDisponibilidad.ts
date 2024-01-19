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
    const horaCierre = DateTime.fromObject({ hour: 0, minute: 0 }, { zone: zonaHorariaBuenosAires }).plus({ days: 1 });
    return momento >= horaApertura && momento <= horaCierre;
}

export const hacerReserva = (inicio: DateTime, duracion: number, reservas: Reserva[]): void => {
    const finReserva: DateTime = inicio.plus({ minutes: duracion });

    if (estaAbierto(inicio) && estaAbierto(finReserva) && !haySuperposicion(inicio, finReserva, reservas)) {
        reservas.push({ inicio, fin: finReserva });
        console.log(`Reserva realizada desde ${inicio.toLocaleString()} hasta ${finReserva.toLocaleString()}`);
    } else {
        console.log('El comercio está cerrado en este momento o el horario solicitado está ocupado.');
    }
}

export const haySuperposicion = (inicioNuevaReserva: DateTime, finNuevaReserva: DateTime, reservas: Reserva[]): boolean => {
    for (const reserva of reservas) {
        if (
            (inicioNuevaReserva >= reserva.inicio && inicioNuevaReserva < reserva.fin) ||
            (finNuevaReserva > reserva.inicio && finNuevaReserva <= reserva.fin) ||
            (inicioNuevaReserva <= reserva.inicio && finNuevaReserva >= reserva.fin)
        ) {
            return true; // Hay superposición
        }
    }
    return false; // No hay superposición
}

export const buscarHorariosDisponibles = (inicioSolicitado: DateTime, duracion: number, reservasActuales: ReservaFormatoSalida[]): string[] => {
    const zonaHorariaBuenosAires: string = "America/Argentina/Buenos_Aires";
    const horaCierre = DateTime.fromObject({ year: inicioSolicitado.year, month: inicioSolicitado.month, day: inicioSolicitado.day, hour: 0, minute: 0 }, { zone: zonaHorariaBuenosAires }).plus({ days: 1 });
    const horariosDisponibles: string[] = [];
    const intervaloBusqueda = 60; // Intervalo de búsqueda en minutos
    let inicioAlternativo = inicioSolicitado.set({ hour: inicioSolicitado.hour - 2 });



    while (true) {
        const finAlternativo = inicioAlternativo.plus({ minutes: duracion });
        if (!haySuperposicion(inicioAlternativo, finAlternativo, reservasActuales)) {
            horariosDisponibles.push(`${inicioAlternativo.toISOTime().split(":")[0]}:${inicioAlternativo.toISOTime().split(":")[1]}`);
        }

        inicioAlternativo = inicioAlternativo.plus({ minutes: intervaloBusqueda });
        if (inicioAlternativo > horaCierre) {
            break;
        }
    }

    return horariosDisponibles;
}