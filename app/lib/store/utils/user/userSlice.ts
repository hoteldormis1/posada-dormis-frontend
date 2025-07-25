import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../axiosConfig";
import { AxiosError } from "axios";
import { extractErrorMessage } from "../extractErrorMessage";
import { Usuario } from "@/models/types";

interface LoginCredentials {
	email: string;
	clave: string;
}

// interface LoginResponse {
// 	accessToken: string;
// }

interface UserState {
	loading: boolean;
	accessToken: string | null;
	error: string | null;
	usuarios: Usuario[]
}

const initialState: UserState = {
	loading: false,
	accessToken: null,
	error: null,
	usuarios: []
};

// 🔐 LOGIN: solo establece la cookie (refreshToken)
export const loginUser = createAsyncThunk<void, LoginCredentials, { rejectValue: string }>(
	"user/login",
	async ({ email, clave }, { rejectWithValue }) => {
		try {
			await api.post("/auth/login", { email, clave }, { withCredentials: true });
			// no devolvés accessToken aquí — se obtiene luego con /auth/refresh
		} catch (err) {
			const axiosError = err as AxiosError;
			if (axiosError.response?.status === 401) {
				return rejectWithValue("Acceso denegado: clave o clave inválidos");
			}
			return rejectWithValue(extractErrorMessage(axiosError, "Error al iniciar sesión"));
		}
	}
);

// 🔁 REFRESH: obtiene nuevo accessToken usando la cookie
export const refreshSession = createAsyncThunk<
	{ accessToken: string },
	void,
	{ rejectValue: string }
>("user/refreshSession", async (_, { rejectWithValue }) => {
	try {
		const { data } = await api.post("/auth/refresh", {}, { withCredentials: true });
		
		return { accessToken: data.accessToken };
	} catch (err) {
		const axiosError = err as AxiosError;
		return rejectWithValue(
			extractErrorMessage(axiosError, "No se pudo refrescar la sesión")
		);
	}
});

// 🔓 LOGOUT: limpia la cookie del refresh token en backend
export const logoutUser = createAsyncThunk<
	void, // No se espera ningún dato
	void,
	{ rejectValue: string }
>("user/logout", async (_, { rejectWithValue }) => {
	try {
		await api.post("/auth/logout", {}, { withCredentials: true });
	} catch (err) {
		const axiosError = err as AxiosError;
		return rejectWithValue(
			extractErrorMessage(axiosError, "No se pudo cerrar sesión")
		);
	}
});

export const fetchUsuarios = createAsyncThunk<
  Usuario[], 
  void,
  { rejectValue: string }
>("user/fetchUsuarios", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/usuarios");
	console.log(data);
	
    return data;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudieron obtener los usuarios")
    );
  }
});

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
	},
	extraReducers: (builder) => {
		builder
			.addCase(loginUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state) => {
				state.loading = false;
				state.error = null;
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload ?? "Error al iniciar sesión";
			})

			.addCase(refreshSession.pending, (state) => {
				state.loading = true;
			})
			.addCase(refreshSession.fulfilled, (state, action) => {
				state.loading = false;
				state.accessToken = action.payload.accessToken;
				state.error = null;
			})
			.addCase(refreshSession.rejected, (state, action) => {
				state.loading = false;
				state.accessToken = null;
				state.error = action.payload ?? "Error al refrescar sesión";
			})
			.addCase(fetchUsuarios.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchUsuarios.fulfilled, (state, action) => {
				state.loading = false;
				state.usuarios = action.payload;
				state.error = null;
			})
			.addCase(fetchUsuarios.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload ?? "Error al obtener los usuarios";
			})
	},
});

// export const { logout } = userSlice.actions;
export default userSlice.reducer;
