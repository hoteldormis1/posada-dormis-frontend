import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { extractErrorMessage } from "../extractErrorMessage";
import api from "../../axiosConfig";

// ---------------------------------------------
// Tipos
// ---------------------------------------------
export interface Auditoria {
	id: number;
	usuarioId: number | null;
	status: number | null;
	ruta: string;
	metodo: string;
	accion: string;
	fecha: string; // ISO string
	datos: any;
}

export interface AuditoriasState {
	lista: Auditoria[];
	loading: boolean;
	error: string | null;
}

const initialState: AuditoriasState = {
	lista: [],
	loading: false,
	error: null,
};

export const fetchAuditorias = createAsyncThunk<
	Auditoria[], // tipo del resultado si sale bien
	void,        // no recibe argumento
	{ rejectValue: string } // tipo de error personalizado
>("auditoria/fetchAuditorias", async (_, { rejectWithValue }) => {
	try {
		const response = await api.get(`/auditorias`);
        console.log(response);
        
		return response.data;
	} catch (err) {
		const axiosError = err as AxiosError;
		return rejectWithValue(extractErrorMessage(axiosError, "No se pudieron obtener las auditorías"));
	}
});

const auditoriaSlice = createSlice({
	name: "auditoria",
	initialState,
	reducers: {
		resetAuditoriaError: (state) => {
			state.error = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchAuditorias.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchAuditorias.fulfilled, (state, action: PayloadAction<Auditoria[]>) => {
				state.loading = false;
				state.lista = action.payload;
			})
			.addCase(fetchAuditorias.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload || "Error desconocido";
			});
	},
});

// ---------------------------------------------
export const { resetAuditoriaError } = auditoriaSlice.actions;
export default auditoriaSlice.reducer;
