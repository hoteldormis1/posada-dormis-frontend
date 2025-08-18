import { apiSlice } from "./apiSlice";
import type { AddReservaPayload, Reserva } from "@/models/types";

export const reservasApi = apiSlice.injectEndpoints({
	endpoints: (build) => ({
		getReservas: build.query<Reserva[], void>({
			query: () => ({ url: "/reservas" }),
			providesTags: ["Reservas"],
		}),
		addReserva: build.mutation<Reserva, AddReservaPayload>({
			query: (body) => ({ url: "/reservas", method: "POST", body }),
			invalidatesTags: ["Reservas"],
		}),
		editReserva: build.mutation<
			Reserva,
			{ id: string; idEstadoReserva?: number; fechaDesde?: string; fechaHasta?: string; montoPagado?: number }
		>({
			query: ({ id, ...body }) => ({ url: `/reservas/${id}`, method: "PUT", body }),
			invalidatesTags: ["Reservas"],
		}),
		deleteReserva: build.mutation<void, string>({
			query: (id) => ({ url: `/reservas/${id}`, method: "DELETE" }),
			invalidatesTags: ["Reservas"],
		}),
	}),
	overrides: {},
});

export const {
	useGetReservasQuery,
	useAddReservaMutation,
	useEditReservaMutation,
	useDeleteReservaMutation,
} = reservasApi;


