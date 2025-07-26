import { StateStatus } from ".";


// 🛏️ Interfaz
export interface Habitacion {
	idHabitacion: number;
	numero: number;
	precio: number;
	tipo: string;
	habilitada: string;
}

export interface HabitacionesState {
	habitaciones: Habitacion[];
	status: StateStatus;
	error: string | null;
}