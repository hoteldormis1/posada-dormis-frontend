

// 🛏️ Interfaz
export interface Habitacion {
	idHabitacion: number;
	numero: number;
	precio: number;
	tipo: string;
	habilitada: string;
}

// Estado inicial
export interface HabitacionesState {
	loading: boolean;
	error: string | null;
	habitaciones: Habitacion[];
}