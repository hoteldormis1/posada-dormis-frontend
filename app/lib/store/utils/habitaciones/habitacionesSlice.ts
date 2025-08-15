// src/lib/store/utils/habitaciones/habitacionesSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../../axiosConfig";
import { extractErrorMessage } from "../extractErrorMessage";
import {
	FetchHabitacionesResponse,
	FetchParams,
	HabitacionesState,
	SortOrder,
	StateStatus,
} from "@/models/types";

const initialState: HabitacionesState = {
	datos: [],
	loading: false,
	status: StateStatus.idle,
	error: null,
	page: 1,
	pageSize: 10,
	total: 0,
	sortField: "numero",
	sortOrder: SortOrder.asc,
	tipoHabitaciones: [],
	estadoHabitaciones: [],
};

export const fetchHabitaciones = createAsyncThunk<
	FetchHabitacionesResponse,
	FetchParams,
	{ rejectValue: string }
>(
	"habitaciones/fetchHabitaciones",
	async (
		params = {
			page: 1,
			size: 10,
			search: "",
			sortField: "numero",
			sortOrder: SortOrder.desc,
		},
		{ rejectWithValue }
	) => {
		try {
			const {
				page = 1,
				size = 10,
				search = "",
				sortField = "numero",
				sortOrder = SortOrder.desc,
			} = params;

			const { data } = await api.get(
				`/habitaciones?page=${page}&size=${size}&search=${search}&sortField=${sortField}&sortOrder=${sortOrder}`
			);

			const { data: tipos } = await api.get("/tipoHabitacion");
			const { data: estados } = await api.get("/estadoHabitacion");

			return {
				data: data.data,
				page: data.page,
				pageSize: data.pageSize,
				total: data.total,
				tipoHabitaciones: tipos,
				estadoHabitaciones: estados,
			};
		} catch (err) {
			const axiosError = err as AxiosError;
			return rejectWithValue(
				extractErrorMessage(axiosError, "No se pudieron obtener las habitaciones")
			);
		}
	}
);

export const editHabitacion = createAsyncThunk<
	void,
	{
		idHabitacion: number;
		idTipoHabitacion: number;
		idEstadoHabitacion: number;
		// numero: number;
	},
	{ rejectValue: string }
>(
	"habitaciones/editHabitacion",
	async (
		{ idHabitacion, idTipoHabitacion, idEstadoHabitacion },
		{ rejectWithValue }
	) => {
		try {
			await api.put(`/habitaciones/${idHabitacion}`, {
				idTipoHabitacion,
				idEstadoHabitacion,
			});
		} catch (err) {
			const axiosError = err as AxiosError;
			return rejectWithValue(
				extractErrorMessage(axiosError, "No se pudo editar la habitación")
			);
		}
	}
);

export const addHabitacion = createAsyncThunk<
	void,
	{
		idTipoHabitacion: number;
		idEstadoHabitacion: number;
		numero: number;
	},
	{ rejectValue: string }
>(
	"habitaciones/addHabitacion",
	async ({ idTipoHabitacion, idEstadoHabitacion, numero }, { rejectWithValue }) => {
		try {
			await api.post("/habitaciones", {
				idTipoHabitacion,
				idEstadoHabitacion,
				numero,
			});
		} catch (err) {
			const axiosError = err as AxiosError;

			if (axiosError.response?.status === 409) {
				return rejectWithValue("Ya existe una habitación con ese número.");
			}

			return rejectWithValue(
				extractErrorMessage(axiosError, "No se pudo agregar la habitación")
			);
		}
	}
);

export const deleteHabitacion = createAsyncThunk<
	void,
	number,
	{ rejectValue: string }
>(
	"habitaciones/deleteHabitacion",
	async (idHabitacion, { rejectWithValue }) => {
		try {
			await api.delete(`/habitaciones/${idHabitacion}`);
		} catch (err) {
			const axiosError = err as AxiosError;
			return rejectWithValue(
				extractErrorMessage(axiosError, "No se pudo eliminar la habitación")
			);
		}
	}
);

const habitacionesSlice = createSlice({
	name: "habitaciones",
	initialState,
	reducers: {
		setHabitacionesPage(state, action: PayloadAction<number>) {
			state.page = action.payload;
		},
		setHabitacionesPageSize(state, action: PayloadAction<number>) {
			state.pageSize = action.payload;
		},
		setHabitacionesSort(
			state,
			action: PayloadAction<{
				field: string;
				order: SortOrder.asc | SortOrder.desc;
			}>
		) {
			state.sortField = action.payload.field;
			state.sortOrder = SortOrder[action.payload.order];
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchHabitaciones.pending, (state) => {
				state.status = StateStatus.loading;
				state.error = null;
				state.loading = true;
			})
			.addCase(
				fetchHabitaciones.fulfilled,
				(state, action: PayloadAction<FetchHabitacionesResponse>) => {
					state.status = StateStatus.succeeded;
					state.loading = false;
					state.datos = action.payload.data;
					state.page = action.payload.page;
					state.pageSize = action.payload.pageSize;
					state.total = action.payload.total;
					state.tipoHabitaciones = action.payload.tipoHabitaciones;
					state.estadoHabitaciones = action.payload.estadoHabitaciones;
				}
			)
			.addCase(fetchHabitaciones.rejected, (state, action) => {
				state.status = StateStatus.failed;
				state.loading = false;
				state.error = action.payload ?? "Error al obtener habitaciones";
			})
	},
});

export const {
	setHabitacionesPage,
	setHabitacionesPageSize,
	setHabitacionesSort,
} = habitacionesSlice.actions;

export default habitacionesSlice.reducer;
