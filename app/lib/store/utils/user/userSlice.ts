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
import { setAuthToken, TOKEN_KEY } from "../../useAuthToken";

function getInitialAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) setAuthToken(token);
  return token;
}

const initialState: UserState = {
  loading: false,
  accessToken: getInitialAccessToken(),
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

export const refreshSession = createAsyncThunk<
  { accessToken: string; currentUser?: UserPerfil },
  void,
  { rejectValue: string }
>("user/refreshSession", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/refresh", {}, { withCredentials: true });
    const token: string | undefined = data?.accessToken;

    if (!token) {
      return rejectWithValue("No se recibió token del servidor");
    }

    setAuthToken(token);

    let currentUser: UserPerfil | undefined;
    try {
      const { data: me } = await api.get<UserPerfil>("/usuarios/me", { withCredentials: true });
      currentUser = me;
    } catch (meError) {
      console.warn("Error al obtener perfil de usuario:", meError);
    }

    return { accessToken: token, currentUser };
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(extractErrorMessage(axiosError, "No se pudo refrescar la sesión"));
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      setAuthToken(null);
    } catch (err) {
      const axiosError = err as AxiosError;
      return rejectWithValue(extractErrorMessage(axiosError, "No se pudo cerrar sesión"));
    }
  }
);

export const fetchCurrentUser = createAsyncThunk<
  UserPerfil,
  void,
  { rejectValue: string }
>("user/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<UserPerfil>("/usuarios/me", { withCredentials: true });
    if (!data) {
      return rejectWithValue("No user profile received");
    }
    return data;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "Failed to fetch user profile")
    );
  }
});

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
          .filter((m) => m.acciones.length > 0);
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
        .filter((m) => m.acciones.length > 0);
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
    setAccessTokenInStore: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    setCurrentUser: (state, action: PayloadAction<UserPerfil>) => {
      state.currentUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Error al iniciar sesión";
      });

    builder
      .addCase(refreshSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        if (action.payload.currentUser) {
          state.currentUser = action.payload.currentUser;
        }
      })
      .addCase(refreshSession.rejected, (state, action) => {
        state.loading = false;
        state.accessToken = null;
        state.currentUser = initialState.currentUser;
        state.error = action.payload ?? "No se pudo refrescar la sesión";
      });

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

    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        console.log("[userSlice] currentUser set:", action.payload);
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.currentUser = initialState.currentUser;
        console.warn("[userSlice] fetchCurrentUser rejected:", action.payload);
      });

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
  setAccessTokenInStore,
  setCurrentUser,
} = userSlice.actions;

export default userSlice.reducer;
