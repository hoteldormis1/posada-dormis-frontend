// src/lib/store/utils/tipoHabitaciones/tipoHabitacionesSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../../axiosConfig";
import { extractErrorMessage } from "../extractErrorMessage";
import {
	FetchParams,
	SortOrder,
	StateStatus,
	TipoHabitacion,
} from "@/models/types";

export interface TipoHabitacionesState {
	datos: TipoHabitacion[];
	loading: boolean;
	status: StateStatus;
	error: string | null;
	page: number;
	pageSize: number;
	total: number;
	sortField: string;
	sortOrder: SortOrder;
}

const initialState: TipoHabitacionesState = {
	datos: [],
	loading: false,
	status: StateStatus.idle,
	error: null,
	page: 1,
	pageSize: 10,
	total: 0,
	sortField: "nombre",
	sortOrder: SortOrder.asc,
};

export const fetchTipoHabitaciones = createAsyncThunk<
	{ data: TipoHabitacion[]; page: number; pageSize: number; total: number },
	FetchParams,
	{ rejectValue: string }
>(
	"tipoHabitaciones/fetchTipoHabitaciones",
	async (
		params = {
			page: 1,
			size: 10,
			search: "",
			sortField: "nombre",
			sortOrder: SortOrder.asc,
		},
		{ rejectWithValue }
	) => {
		try {
			const {
				page = 1,
				size = 10,
				search = "",
				sortField = "nombre",
				sortOrder = SortOrder.asc,
			} = params;

			const { data } = await api.get("/tipoHabitacion");

			// Filtrar por búsqueda si existe
			let filteredData = data;
			if (search) {
				filteredData = data.filter((tipo: TipoHabitacion) =>
					tipo.nombre.toLowerCase().includes(search.toLowerCase())
				);
			}

			// Ordenar datos
			filteredData.sort((a: TipoHabitacion, b: TipoHabitacion) => {
				const aValue = a[sortField as keyof TipoHabitacion];
				const bValue = b[sortField as keyof TipoHabitacion];

				if (sortOrder === SortOrder.asc) {
					return aValue > bValue ? 1 : -1;
				} else {
					return aValue < bValue ? 1 : -1;
				}
			});

			// Paginar
			const start = (page - 1) * size;
			const end = start + size;
			const paginatedData = filteredData.slice(start, end);

			return {
				data: paginatedData,
				page,
				pageSize: size,
				total: filteredData.length,
			};
		} catch (err) {
			const axiosError = err as AxiosError;
			return rejectWithValue(
				extractErrorMessage(
					axiosError,
					"No se pudieron obtener los tipos de habitaciones"
				)
			);
		}
	}
);

export const addTipoHabitacion = createAsyncThunk<
	void,
	{
		nombre: string;
		precio: number;
	},
	{ rejectValue: string }
>(
	"tipoHabitaciones/addTipoHabitacion",
	async ({ nombre, precio }, { rejectWithValue }) => {
		try {
			await api.post("/tipoHabitacion", {
				nombre,
				precio,
			});
		} catch (err) {
			const axiosError = err as AxiosError;

			if (axiosError.response?.status === 409) {
				return rejectWithValue("Ya existe un tipo de habitación con ese nombre.");
			}

			return rejectWithValue(
				extractErrorMessage(
					axiosError,
					"No se pudo agregar el tipo de habitación"
				)
			);
		}
	}
);

export const editTipoHabitacion = createAsyncThunk<
	void,
	{
		idTipoHabitacion: number;
		nombre: string;
		precio: number;
	},
	{ rejectValue: string }
>(
	"tipoHabitaciones/editTipoHabitacion",
	async ({ idTipoHabitacion, nombre, precio }, { rejectWithValue }) => {
		try {
			await api.put(`/tipoHabitacion/${idTipoHabitacion}`, {
				nombre,
				precio,
			});
		} catch (err) {
			const axiosError = err as AxiosError;
			return rejectWithValue(
				extractErrorMessage(
					axiosError,
					"No se pudo editar el tipo de habitación"
				)
			);
		}
	}
);

export const deleteTipoHabitacion = createAsyncThunk<
	void,
	number,
	{ rejectValue: string }
>(
	"tipoHabitaciones/deleteTipoHabitacion",
	async (idTipoHabitacion, { rejectWithValue }) => {
		try {
			await api.delete(`/tipoHabitacion/${idTipoHabitacion}`);
		} catch (err) {
			const axiosError = err as AxiosError;
			return rejectWithValue(
				extractErrorMessage(
					axiosError,
					"No se pudo eliminar el tipo de habitación"
				)
			);
		}
	}
);

const tipoHabitacionesSlice = createSlice({
	name: "tipoHabitaciones",
	initialState,
	reducers: {
		setTipoHabitacionesPage(state, action: PayloadAction<number>) {
			state.page = action.payload;
		},
		setTipoHabitacionesPageSize(state, action: PayloadAction<number>) {
			state.pageSize = action.payload;
		},
		setTipoHabitacionesSort(
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
			.addCase(fetchTipoHabitaciones.pending, (state) => {
				state.status = StateStatus.loading;
				state.error = null;
				state.loading = true;
			})
			.addCase(
				fetchTipoHabitaciones.fulfilled,
				(
					state,
					action: PayloadAction<{
						data: TipoHabitacion[];
						page: number;
						pageSize: number;
						total: number;
					}>
				) => {
					state.status = StateStatus.succeeded;
					state.loading = false;
					state.datos = action.payload.data;
					state.page = action.payload.page;
					state.pageSize = action.payload.pageSize;
					state.total = action.payload.total;
				}
			)
			.addCase(fetchTipoHabitaciones.rejected, (state, action) => {
				state.status = StateStatus.failed;
				state.loading = false;
				state.error =
					action.payload ?? "Error al obtener tipos de habitaciones";
			});
	},
});

export const {
	setTipoHabitacionesPage,
	setTipoHabitacionesPageSize,
	setTipoHabitacionesSort,
} = tipoHabitacionesSlice.actions;

export default tipoHabitacionesSlice.reducer;


