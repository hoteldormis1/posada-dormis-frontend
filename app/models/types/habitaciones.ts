import { SortOrder, StateStatus } from ".";

// 🛏️ Interfaz
export interface Habitacion {
	id: string | number;
	idHabitacion: number;
	numero: number;
	precio: number;
	tipo: string;
	estado: string;
}

export interface TipoHabitacion {
	idTipoHabitacion: number;
	tipo: string;
	precio: number;
}

export interface EstadoHabitacion {
	idEstadoHabitacion: number;
	estado: string;
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
	estadoHabitaciones: EstadoHabitacion[];
}

export type FetchHabitacionesResponse = {
	data: Habitacion[];
	page: number;
	pageSize: number;
	total: number;
	tipoHabitaciones: TipoHabitacion[];
	estadoHabitaciones: EstadoHabitacion[];
};