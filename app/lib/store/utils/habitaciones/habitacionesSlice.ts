// src/lib/store/utils/habitaciones/habitacionesSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../../axiosConfig";
import { extractErrorMessage } from "../extractErrorMessage";
import {
	FetchHabitacionesResponse,
	FetchParams,
	HabitacionesState,
} from "@/models/types";

const initialState: HabitacionesState = {
	datos: [],
	loading: false,
	status: "idle",
	error: null,
	page: 1,
	pageSize: 10,
	total: 0,
	sortField: "numero",
	sortOrder: "ASC",
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
			sortOrder: "DESC",
		},
		{ rejectWithValue }
	) => {
		try {
			const {
				page = 1,
				size = 10,
				search = "",
				sortField = "numero",
				sortOrder = "DESC",
			} = params;

			const { data } = await api.get(
				`/habitaciones?page=${page}&size=${size}&search=${search}&sortField=${sortField}&sortOrder=${sortOrder}`
			);

			return {
				data: data.data,
				page: data.page,
				pageSize: data.pageSize,
				total: data.total,
			};
		} catch (err) {
			const axiosError = err as AxiosError;
			return rejectWithValue(
				extractErrorMessage(axiosError, "No se pudieron obtener las habitaciones")
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
			action: PayloadAction<{ field: string; order: "ASC" | "DESC" }>
		) {
			state.sortField = action.payload.field;
			state.sortOrder = action.payload.order;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchHabitaciones.pending, (state) => {
				state.status = "loading";
				state.error = null;
				state.loading = true;
			})
			.addCase(
				fetchHabitaciones.fulfilled,
				(state, action: PayloadAction<FetchHabitacionesResponse>) => {
					state.status = "succeeded";
					state.datos = action.payload.data;
					state.page = action.payload.page;
					state.pageSize = action.payload.pageSize;
					state.total = action.payload.total;
					state.loading = false;
				}
			)
			.addCase(fetchHabitaciones.rejected, (state, action) => {
				state.loading = false;
				state.status = "failed";
				state.error = action.payload ?? "Error al obtener habitaciones";
			});
	},
});

export const {
	setHabitacionesPage,
	setHabitacionesPageSize,
	setHabitacionesSort,
} = habitacionesSlice.actions;

export default habitacionesSlice.reducer;
