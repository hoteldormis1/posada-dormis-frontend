import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "../../axiosConfig";
import { AxiosError } from "axios";
import { extractErrorMessage } from "../extractErrorMessage";
import { LoginCredentials, SortOrder, TipoUsuario, UserState, Usuario } from "@/models/types";
import { setAuthToken } from "../../useAuthToken";

const initialState: UserState = {
	loading: false,
	accessToken: null,
	error: null,
	datos: [],
	page: 1,
	pageSize: 10,
	total: 0,
	sortField: "idUsuario", // Campo por defecto
	sortOrder: SortOrder.desc, // Orden por defecto
	tiposUsuarios: []
};
// 🔐 LOGIN
export const loginUser = createAsyncThunk<
	void,
	LoginCredentials,
	{ rejectValue: string }
>("user/login", async ({ email, clave }, { rejectWithValue }) => {
	try {
		await api.post("/auth/login", { email, clave }, { withCredentials: true });
	} catch (err) {
		const axiosError = err as AxiosError;
		
		if (axiosError.response?.status === 401) {
			return rejectWithValue("Acceso denegado: usuario o clave incorrectas.");
		}
		return rejectWithValue(
			extractErrorMessage(axiosError, "Error al iniciar sesión")
		);
	}
});

// 🔁 REFRESH
export const refreshSession = createAsyncThunk<
	{ accessToken: string },
	void,
	{ rejectValue: string }
>("user/refreshSession", async (_, { rejectWithValue }) => {
	try {
		const { data } = await api.post(
			"/auth/refresh",
			{},
			{ withCredentials: true }
		);
		setAuthToken(data.accessToken);
		
		return { accessToken: data.accessToken };
	} catch (err) {
		const axiosError = err as AxiosError;
		return rejectWithValue(
			extractErrorMessage(axiosError, "No se pudo refrescar la sesión")
		);
	}
});

// 🔓 LOGOUT
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
	"user/logout",
	async (_, { rejectWithValue }) => {
		try {
			await api.post("/auth/logout", {}, { withCredentials: true });
		} catch (err) {
			const axiosError = err as AxiosError;
			return rejectWithValue(
				extractErrorMessage(axiosError, "No se pudo cerrar sesión")
			);
		}
	}
);

// 🔍 FETCH USUARIOS CON PAGINACIÓN Y SORT
// 🔍 FETCH USUARIOS + TIPOS
export const fetchUsuarios = createAsyncThunk<
  {
    data: Usuario[];
    page: number;
    pageSize: number;
    total: number;
    tiposUsuarios: TipoUsuario[];  // ✅ incluimos tipos en el payload
  },
  | {
      page?: number;
      size?: number;
      search?: string;
      sortField?: string;
      sortOrder?: string;
    }
  | undefined,
  { rejectValue: string }
>(
  "user/fetchUsuarios",
  async (
    params = {
      page: 1,
      size: 10,
      search: "",
      sortField: "idUsuario",
      sortOrder: SortOrder.asc,
    },
    { rejectWithValue }
  ) => {
    try {
      const {
        page = 1,
        size = 10,
        search = "",
        sortField = "idUsuario",
        sortOrder = SortOrder.asc,
      } = params;

      // ✅ Usuarios (estructura: { total, page, pageSize, data })
      const { data: usuariosRes } = await api.get(
        `/usuarios?page=${page}&size=${size}&search=${encodeURIComponent(
          search
        )}&sortField=${sortField}&sortOrder=${sortOrder}`
      );

      // ✅ Tipos de usuario (estructura: { data: TipoUsuario[] } o directamente array)
      const { data: tiposRes } = await api.get(`/tipoUsuarios`);

      const tiposUsuarios: TipoUsuario[] = tiposRes.map((t: any) => ({
		activo: t.activo,
		nombre: t.nombre,
		idTipoUsuario: t.idTipoUsuario,
	  }))

      return {
        data: usuariosRes.data,
        page: usuariosRes.page,
        pageSize: usuariosRes.pageSize,
        total: usuariosRes.total,
        tiposUsuarios,                 
      };
    } catch (err) {
      const axiosError = err as AxiosError;
      return rejectWithValue(
        extractErrorMessage(axiosError, "No se pudieron obtener los usuarios")
      );
    }
  }
);

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUsuarioPage: (state, action: PayloadAction<number>) => {
			state.page = action.payload;
		},
		setUsuarioPageSize: (state, action: PayloadAction<number>) => {
			state.pageSize = action.payload;
		},
		setUsuarioSortField: (state, action: PayloadAction<string>) => {
			state.sortField = action.payload;
		},
		setUsuarioSortOrder: (state, action: PayloadAction<SortOrder.asc | SortOrder.desc>) => {
			state.sortOrder = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUsuarios.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchUsuarios.fulfilled, (state, action) => {
				state.loading = false;
				state.datos = action.payload.data;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.total = action.payload.total;
				state.tiposUsuarios = action.payload.tiposUsuarios;
			})
			.addCase(fetchUsuarios.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload ?? "Error al obtener los usuarios";
			});
	},
});

export const {
	setUsuarioPage,
	setUsuarioPageSize,
	setUsuarioSortField,
	setUsuarioSortOrder,
} = userSlice.actions;

export default userSlice.reducer;
