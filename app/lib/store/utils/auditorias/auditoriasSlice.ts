import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { extractErrorMessage } from "../extractErrorMessage";
import api from "../../axiosConfig";
import {
	AuditoriasState,
	FetchAuditoriasParams,
	FetchAuditoriasResponse,
} from "@/models/types";

const initialState: AuditoriasState = {
	lista: [],
	loading: false,
	error: null,
	page: 1,
	pageSize: 10,
	total: 0,
};

export const fetchAuditorias = createAsyncThunk<
	FetchAuditoriasResponse,
	FetchAuditoriasParams | undefined,
	{ rejectValue: string }
>(
	"auditoria/fetchAuditorias",
	async (params = { page: 1, size: 10, search: "" }, { rejectWithValue }) => {
		try {
			const { page = 1, size = 10, search = "" } = params;
			const { data } = await api.get(
				`/auditorias?page=${page}&size=${size}&search=${search}`
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
			extractErrorMessage(axiosError, "No se pudieron obtener las auditorías")
		);
		}
	}
);

const auditoriaSlice = createSlice({
	name: "auditoria",
	initialState,
	reducers: {
		resetAuditoriaError: (state) => {
			state.error = null;
		},
		setAuditoriaPage: (state, action: PayloadAction<number>) => {
			state.page = action.payload;
		},
		setAuditoriaPageSize: (state, action: PayloadAction<number>) => {
			state.pageSize = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAuditorias.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(
				fetchAuditorias.fulfilled,
				(state, action: PayloadAction<FetchAuditoriasResponse>) => {
					state.loading = false;
					state.lista = action.payload.data;
					state.page = action.payload.page;
					state.pageSize = action.payload.pageSize;
					state.total = action.payload.total;
				}
			)
			.addCase(fetchAuditorias.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || "Error desconocido";
			});
	},
});

export const { resetAuditoriaError, setAuditoriaPage, setAuditoriaPageSize } =
	auditoriaSlice.actions;

export default auditoriaSlice.reducer;
