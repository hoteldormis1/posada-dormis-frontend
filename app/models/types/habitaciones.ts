import { SortOrder, StateStatus } from ".";

// 🛏️ Interfaz
export interface Habitacion {
	id: string | number;
	idHabitacion: number;
	numero: number;
	precio: number;
	tipo: string;
	estado: string;
	fueraDeServicio?: boolean;
}

export interface TipoHabitacion {
	idTipoHabitacion: number;
	nombre: string;
	precio: number;
}

export interface EstadoReserva {
	idEstadoReserva: number;
	nombre: string;
}

export interface HabitacionesState {
	datos: Habitacion[];
	loading: boolean;
	status: StateStatus;
	error: string | null;
	page: number;
	pageSize: number;
	total: number;
	sortOrder: SortOrder;
	sortField: string;
	tipoHabitaciones: TipoHabitacion[];
	estadosDeReserva: EstadoReserva[];
}

export type FetchHabitacionesResponse = {
	data: Habitacion[];
	page: number;
	pageSize: number;
	total: number;
	tipoHabitaciones: TipoHabitacion[];
	estadosDeReserva: EstadoReserva[];
};