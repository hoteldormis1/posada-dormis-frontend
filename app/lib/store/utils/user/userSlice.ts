import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "../../axiosConfig"; // Solo para peticiones de usuarios
import axios, { AxiosError } from "axios";
import { extractErrorMessage } from "../extractErrorMessage";
import { LoginCredentials, UserState, Usuario } from "@/models/types";
import { setAuthToken } from "../../useAuthToken";

const initialState: UserState = {
  loading: false,
  accessToken: null,
  error: null,
  datos: [],
  page: 1,
  pageSize: 10,
  total: 0,
  sortField: "idUsuario",
  sortOrder: "ASC",
};

// 🔐 LOGIN
export const loginUser = createAsyncThunk<
  void,
  LoginCredentials,
  { rejectValue: string }
>("user/login", async ({ email, clave }, { rejectWithValue }) => {
  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
      { email, clave },
      { withCredentials: true }
    );
  } catch (err) {
    const axiosError = err as AxiosError;
    if (axiosError.response?.status === 401) {
      return rejectWithValue(
        "Credenciales inválidas. Por favor verifica tu correo y contraseña."
      );
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
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
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
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      const axiosError = err as AxiosError;
      return rejectWithValue(
        extractErrorMessage(axiosError, "No se pudo cerrar sesión")
      );
    }
  }
);

// 🔍 FETCH USUARIOS CON PAGINACIÓN Y SORT
export const fetchUsuarios = createAsyncThunk<
  { data: Usuario[]; page: number; pageSize: number; total: number },
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
      sortOrder: "ASC",
    },
    { rejectWithValue }
  ) => {
    try {
      const {
        page = 1,
        size = 10,
        search = "",
        sortField = "idUsuario",
        sortOrder = "ASC",
      } = params;

      const { data } = await api.get(
        `/usuarios?page=${page}&size=${size}&search=${search}&sortField=${sortField}&sortOrder=${sortOrder}`
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
    setUsuarioSortOrder: (state, action: PayloadAction<"ASC" | "DESC">) => {
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
