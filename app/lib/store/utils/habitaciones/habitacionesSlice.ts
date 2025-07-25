// src/lib/store/utils/habitaciones/habitacionesSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../../axiosConfig";
import { extractErrorMessage } from "../extractErrorMessage";

export interface Habitacion {
	idHabitacion: number;
	numero: number;
	tipo: string;
	precio: number;
	habilitada: boolean;
}

type Status = "idle" | "loading" | "succeeded" | "failed";

interface HabitacionesState {
	habitaciones: Habitacion[];
	status: Status;
	error: string | null;
}

const initialState: HabitacionesState = {
	habitaciones: [],
	status: "idle",
	error: null,
};

export const fetchHabitaciones = createAsyncThunk<
	Habitacion[],
	void,
	{ rejectValue: string }
>("habitaciones/fetchHabitaciones", async (_, { rejectWithValue }) => {
	try {
		const { data } = await api.get("/habitaciones");

		return data;
	} catch (err) {
		const axiosError = err as AxiosError;
		return rejectWithValue(
			extractErrorMessage(axiosError, "No se pudieron obtener las habitaciones")
		);
	}
});
const habitacionesSlice = createSlice({
	name: "habitaciones",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchHabitaciones.pending, (state) => {
				state.status = "loading";
				state.error = null;
			})
			.addCase(fetchHabitaciones.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.habitaciones = action.payload;
			})
			.addCase(fetchHabitaciones.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.payload ?? "Error al obtener habitaciones";
			});
	},
});

export default habitacionesSlice.reducer;
