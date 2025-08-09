// src/lib/store/utils/reservas/reservasSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../../axiosConfig";
import { extractErrorMessage } from "../extractErrorMessage";
import { Reserva, ReservasState, StateStatus } from "@/models/types";

const initialState: ReservasState = {
	reservas: [],
	status: StateStatus.idle,
	error: null,
};
type AddReservaPayload = {
	huesped: {
		nombre: string;
		apellido: string;
		dni: string;
		telefono: string;
		email: string;
		origen: string;
	};
	idHabitacion: number;
	idEstadoReserva: number;
	fechaDesde: string;
	fechaHasta: string;
	montoPagado: number;
};

export const addReserva = createAsyncThunk<
	Reserva, // ✅ Tipo que retorna el backend
	AddReservaPayload, // ✅ Tipo del payload que se envía
	{ rejectValue: string } // ✅ Manejo de errores
>("reservas/addReserva", async (payload, { rejectWithValue }) => {
	try {
		const { data } = await api.post("/reservas", payload);
		return data as Reserva; // ✅ asegurás que coincida con tu tipo
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
			});
	},
});

export default reservasSlice.reducer;
