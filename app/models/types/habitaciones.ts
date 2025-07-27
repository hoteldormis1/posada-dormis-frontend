import { SortOrder, StateStatus } from ".";

// 🛏️ Interfaz
export interface Habitacion {
	idHabitacion: number;
	numero: number;
	precio: number;
	tipo: string;
	habilitada: string;
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
}

export type FetchHabitacionesResponse = {
	data: Habitacion[];
	page: number;
	pageSize: number;
	total: number;
};