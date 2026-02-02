import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "../../axiosConfig";
import { AxiosError } from "axios";
import { extractErrorMessage } from "../extractErrorMessage";
import {
  LoginCredentials,
  SortOrder,
  TipoUsuario,
  UserState,
  Usuario,
  UserPerfil,
} from "@/models/types";
import { setAuthToken } from "../../useAuthToken";

const initialState: UserState = {
  loading: false,
  accessToken: null,
  error: null,
  datos: [],
  currentUser: { email: "", idTipoUsuario: 0, idUsuario: 0, nombre: "" },
  page: 1,
  pageSize: 10,
  total: 0,
  sortField: "idUsuario",
  sortOrder: SortOrder.desc,
  tiposUsuarios: [],
};

// 🔐 LOGIN (cookie httpOnly en backend)
export const loginUser = createAsyncThunk<void, LoginCredentials, { rejectValue: string }>(
  "user/login",
  async ({ email, clave }, { rejectWithValue }) => {
    try {
      await api.post("/auth/login", { email, clave }, { withCredentials: true });
    } catch (err) {
      const axiosError = err as AxiosError;
      if (axiosError.response?.status === 401) {
        return rejectWithValue("Acceso denegado: usuario o clave incorrectas.");
      }
      return rejectWithValue(extractErrorMessage(axiosError, "Error al iniciar sesión"));
    }
  }
);

// 🔁 REFRESH
export const refreshSession = createAsyncThunk<
  { accessToken: string; currentUser?: UserPerfil }, // ✅ incluye currentUser en el tipo
  void,
  { rejectValue: string }
>("user/refreshSession", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/refresh", {}, { withCredentials: true });
    const token: string | undefined = data?.accessToken;

    if (!token) {
      return rejectWithValue("No se recibió token del servidor");
    }

    // Setear el token INMEDIATAMENTE para que esté disponible en los interceptores
    setAuthToken(token);

    let currentUser: UserPerfil | undefined;
    try {
      const { data: me } = await api.get<UserPerfil>("/usuarios/me", { withCredentials: true });
      currentUser = me;
    } catch (meError) {
      console.warn("Error al obtener perfil de usuario:", meError);
      // No rechazar aquí, el token es válido aunque falle el /me
    }

    return { accessToken: token, currentUser };
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(extractErrorMessage(axiosError, "No se pudo refrescar la sesión"));
  }
});

// 🔓 LOGOUT
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      setAuthToken(null); // ✅ limpia el header Authorization del cliente
    } catch (err) {
      const axiosError = err as AxiosError;
      return rejectWithValue(extractErrorMessage(axiosError, "No se pudo cerrar sesión"));
    }
  }
);

// 🔍 FETCH USUARIOS + TIPOS
export const fetchUsuarios = createAsyncThunk<
  {
    data: Usuario[];
    page: number;
    pageSize: number;
    total: number;
    tiposUsuarios: TipoUsuario[];
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
    params = { page: 1, size: 10, search: "", sortField: "idUsuario", sortOrder: SortOrder.asc },
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

      const { data: usuariosRes } = await api.get(
        `/usuarios?page=${page}&size=${size}&search=${encodeURIComponent(
          search
        )}&sortField=${sortField}&sortOrder=${sortOrder}`
      );

      const { data: tiposRes } = await api.get(`/tipoUsuarios`);

      function getTruePermisos(permisos: Record<string, Record<string, boolean>>) {
        return Object.entries(permisos)
          .map(([modulo, actions]) => {
            const activos = Object.entries(actions)
              .filter(([_, value]) => value)
              .map(([accion]) => accion);
            return { modulo, acciones: activos };
          })
          .filter((m) => m.acciones.length > 0); // ✅ quedate solo con módulos con acciones
      }

      const tiposUsuarios: TipoUsuario[] = (Array.isArray(tiposRes) ? tiposRes : tiposRes?.data).map(
        (t: any) => ({
          activo: t.activo,
          nombre: t.nombre,
          idTipoUsuario: t.idTipoUsuario,
          permisos: getTruePermisos(t.permisos),
        })
      );

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

export const fetchTiposUsuarios = createAsyncThunk<
  { tiposUsuarios: TipoUsuario[] },
  void,
  { rejectValue: string }
>("user/fetchTiposUsuarios", async (_, { rejectWithValue }) => {
  try {
    const { data: tiposRes } = await api.get(`/tipoUsuarios`);
    const lista = Array.isArray(tiposRes) ? tiposRes : tiposRes?.data;

    function getTruePermisos(permisos: Record<string, Record<string, boolean>>) {
      return Object.entries(permisos)
        .map(([modulo, actions]) => {
          const activos = Object.entries(actions)
            .filter(([_, value]) => value)
            .map(([accion]) => accion);
          return { modulo, acciones: activos };
        })
        .filter((m) => m.acciones.length > 0); // ✅ quedate solo con módulos con acciones
    }

    const tiposUsuarios: TipoUsuario[] = lista.map((t: any) => ({
      activo: t.activo,
      nombre: t.nombre,
      idTipoUsuario: t.idTipoUsuario,
      permisos: getTruePermisos(t.permisos),
    }));

    return { tiposUsuarios };
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(extractErrorMessage(axiosError, "No se pudieron obtener los tipos"));
  }
});

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
    // ---- login ----
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false; // el token se setea luego con refreshSession
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Error al iniciar sesión";
      });

    // ---- refresh ----
    builder
      .addCase(refreshSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        if (action.payload.currentUser) {
          state.currentUser = action.payload.currentUser; // ✅ ahora sí viene en el payload
        }
      })
      .addCase(refreshSession.rejected, (state, action) => {
        state.loading = false;
        state.accessToken = null;
        state.currentUser = initialState.currentUser;
        state.error = action.payload ?? "No se pudo refrescar la sesión";
      });

    // ---- logout ----
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.accessToken = null;
        state.currentUser = initialState.currentUser;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "No se pudo cerrar sesión";
      });

    // ---- fetchUsuarios ----
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
        // ❌ no toques currentUser acá (este thunk no lo trae)
      })
      .addCase(fetchUsuarios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Error al obtener los usuarios";
      });

    // ---- fetchUsuarios ----
    builder
      .addCase(fetchTiposUsuarios.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchTiposUsuarios.fulfilled, (state, action) => {
        state.tiposUsuarios = action.payload.tiposUsuarios;
      })
      .addCase(fetchTiposUsuarios.rejected, (state, action) => {
        state.error = action.payload ?? "Error al obtener los tipos de usuario";
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
