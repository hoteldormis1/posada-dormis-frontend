import { apiSlice } from "./apiSlice";

type TipoHabitacion = { idTipoHabitacion: number; nombre: string; precio: number };
type EstadoReserva = { idEstadoReserva: number; nombre: string; prioridad?: number };

export const catalogosApi = apiSlice.injectEndpoints({
	endpoints: (build) => ({
		getTiposHabitacion: build.query<TipoHabitacion[], void>({
			query: () => ({ url: "/tipoHabitacion" }),
			providesTags: ["TiposHabitacion"],
			keepUnusedDataFor: 3600,
		}),
		getEstadosReserva: build.query<EstadoReserva[], void>({
			query: () => ({ url: "/estadoReserva" }),
			providesTags: ["EstadosReserva"],
			keepUnusedDataFor: 3600,
		}),
	}),
});

export const { useGetTiposHabitacionQuery, useGetEstadosReservaQuery } = catalogosApi;


