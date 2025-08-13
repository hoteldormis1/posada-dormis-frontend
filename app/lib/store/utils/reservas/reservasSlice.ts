// src/lib/store/utils/reservas/reservasSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../../axiosConfig";
import { extractErrorMessage } from "../extractErrorMessage";
import { AddReservaPayload, Habitacion, Reserva, ReservasState, StateStatus } from "@/models/types";
import { Huesped } from "@/models/types/huesped";

const initialState: ReservasState = {
	reservas: [],
	status: StateStatus.idle,
	error: null,

	calendarFullyBooked: [],
	calendarStatus: StateStatus.idle,
	calendarError: null,

	huespedes: [],
	huespedesStatus: StateStatus.idle,
	huespedesError: null,

	availableByDate: {},
	availabilityStatusByDate: {},
	availabilityErrorByDate: {},
};

export const addReserva = createAsyncThunk<
	Reserva,
	AddReservaPayload,
	{ rejectValue: string }
>("reservas/addReserva", async (payload, { rejectWithValue }) => {
	try {
		const { data } = await api.post("/reservas", payload);
		return data as Reserva;
	} catch (err) {
		const axiosError = err as AxiosError;
		return rejectWithValue(
			extractErrorMessage(axiosError, "No se pudo crear la reserva")
		);
	}
});

export const fetchReservas = createAsyncThunk<
	Reserva[],
	void,
	{ rejectValue: string }
>("reservas/fetchReservas", async (_, { rejectWithValue }) => {
	try {
		const { data } = await api.get("/reservas");

		return data;
	} catch (err) {
		const axiosError = err as AxiosError;
		return rejectWithValue(
			extractErrorMessage(axiosError, "No se pudieron obtener las reservas")
		);
	}
});

export const deleteReserva = createAsyncThunk<
	string, // retornamos el `id` de la reserva eliminada
	string, // `id`
	{ rejectValue: string }
>("reservas/deleteReserva", async (id, { rejectWithValue }) => {
	try {
		await api.delete(`/reservas/${id}`);
		return id;
	} catch (err) {
		const axiosError = err as AxiosError;
		return rejectWithValue(
			extractErrorMessage(axiosError, "No se pudo eliminar la reserva")
		);
	}
});

export const editReserva = createAsyncThunk<
	Reserva,
	{
		id: string;
		idEstadoReserva?: number;
		fechaDesde?: string;
		fechaHasta?: string;
		montoPagado?: number;
	},
	{ rejectValue: string }
>("reservas/editReserva", async (payload, { rejectWithValue }) => {
	try {
		const { id, ...updateData } = payload;
		const { data } = await api.put(`/reservas/${id}`, updateData);
		return data as Reserva;
	} catch (err) {
		const axiosError = err as AxiosError;
		return rejectWithValue(
			extractErrorMessage(axiosError, "No se pudo editar la reserva")
		);
	}
});

export const fetchReservasCalendar = createAsyncThunk<
	string[],               // devolvemos directamente el array de fechas
	void,                   // sin payload
	{ rejectValue: string } // manejo de errores
>("reservas/fetchReservasCalendar", async (_, { rejectWithValue }) => {
	try {
		const { data } = await api.get("/reservas/calendar");
		// El backend retorna { fullyBookedDates: string[] }
		return (data?.fullyBookedDates ?? []) as string[];
	} catch (err) {
		const axiosError = err as AxiosError;
		return rejectWithValue(
			extractErrorMessage(axiosError, "No se pudo obtener el calendario")
		);
	}
});

export const fetchHuespedes = createAsyncThunk<
	Huesped[], // lo que devuelve el backend
	void,
	{ rejectValue: string }
>("huespedes/fetchHuespedes", async (_, { rejectWithValue }) => {
	try {
		const { data } = await api.get("/huespedes");
		return data as Huesped[];
	} catch (err) {
		const axiosError = err as AxiosError;
		return rejectWithValue(
			extractErrorMessage(axiosError, "No se pudieron obtener los huéspedes")
		);
	}
});

export const fetchHabitacionesDisponiblesPorDia = createAsyncThunk<
	{ date: string; rooms: Habitacion[] },
	string, // date: YYYY-MM-DD
	{ rejectValue: string }
>("habitaciones/fetchDisponiblesPorDia", async (date, { rejectWithValue }) => {
	try {
		const { data } = await api.get("/habitaciones/disponibles", { params: { date } });
		return data as { date: string; rooms: Habitacion[] };
	} catch (err) {
		const axiosError = err as AxiosError;
		return rejectWithValue(
			extractErrorMessage(axiosError, "No se pudieron obtener habitaciones disponibles")
		);
	}
});

const reservasSlice = createSlice({
	name: "reservas",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchReservas.pending, (state) => {
				state.status = StateStatus.loading;
				state.error = null;
			})
			.addCase(fetchReservas.fulfilled, (state, action) => {
				state.status = StateStatus.succeeded;
				state.reservas = action.payload;
			})
			.addCase(fetchReservas.rejected, (state, action) => {
				state.status = StateStatus.failed;
				state.error = action.payload ?? "Error al obtener reservas";
			})
			.addCase(deleteReserva.fulfilled, (state, action) => {
				state.reservas = state.reservas.filter(
					(reserva) => reserva.id !== action.payload
				);
			})

			// ===== CALENDARIO =====
			.addCase(fetchReservasCalendar.pending, (state) => {
				state.calendarStatus = StateStatus.loading;
				state.calendarError = null;
			})
			.addCase(fetchReservasCalendar.fulfilled, (state, action) => {
				state.calendarStatus = StateStatus.succeeded;
				state.calendarFullyBooked = action.payload;
			})
			.addCase(fetchReservasCalendar.rejected, (state, action) => {
				state.calendarStatus = StateStatus.failed;
				state.calendarError =
					action.payload ?? "Error al obtener el calendario";
			})

			// ===== HUESPEDES =====
			.addCase(fetchHuespedes.pending, (state) => {
				state.huespedesStatus = StateStatus.loading;
				state.huespedesError = null;
			})
			.addCase(fetchHuespedes.fulfilled, (state, action) => {
				state.huespedesStatus = StateStatus.succeeded;
				state.huespedes = action.payload; // Huesped[]
			})
			.addCase(fetchHuespedes.rejected, (state, action) => {
				state.huespedesStatus = StateStatus.failed;
				state.huespedesError =
					action.payload ?? "Error al obtener los huéspedes";
			})

			// ===== DISPONIBLES POR DÍA =====
			.addCase(fetchHabitacionesDisponiblesPorDia.pending, (state, action) => {
				const date = action.meta.arg; // YYYY-MM-DD
				state.availabilityStatusByDate[date] = StateStatus.loading;
				state.availabilityErrorByDate[date] = null;
			})
			.addCase(fetchHabitacionesDisponiblesPorDia.fulfilled, (state, action) => {
				const { date, rooms } = action.payload;
				state.availableByDate[date] = rooms;
				state.availabilityStatusByDate[date] = StateStatus.succeeded;
				state.availabilityErrorByDate[date] = null;
			})
			.addCase(fetchHabitacionesDisponiblesPorDia.rejected, (state, action) => {
				// la fecha viene del arg del thunk
				const date = action.meta.arg;
				state.availabilityStatusByDate[date] = StateStatus.failed;
				state.availabilityErrorByDate[date] =
					action.payload ?? "No se pudieron obtener habitaciones disponibles";
			});
	},
});

export default reservasSlice.reducer;
