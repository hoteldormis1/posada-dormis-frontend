import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { extractErrorMessage } from "../extractErrorMessage";
import api from "../../axiosConfig";
import {
  AuditoriasState,
  FetchAuditoriasResponse,
  FetchParams,
  SortOrder,
} from "@/models/types";

const initialState: AuditoriasState = {
  datos: [],
  loading: false,
  error: null,
  page: 1,
  pageSize: 10,
  total: 0,
  sortField: "fecha",   
  sortOrder: SortOrder.desc,   
};

export const fetchAuditorias = createAsyncThunk<
  FetchAuditoriasResponse,
  FetchParams | undefined,
  { rejectValue: string }
>(
  "Auditoria/fetchAuditorias",
  async (
    params = {
      page: 1,
      size: 10,
      search: "",
      sortField: "fecha",
      sortOrder: SortOrder.desc,
    },
    { rejectWithValue }
  ) => {
    try {
      const {
        page = 1,
        size = 10,
        search = "",
        sortField = "fecha",
        sortOrder = SortOrder.desc,
      } = params;

      const { data } = await api.get(
        `/auditorias?page=${page}&size=${size}&search=${search}&sortField=${sortField}&sortOrder=${sortOrder}`
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
  name: "Auditoria",
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
    setSortField: (state, action: PayloadAction<string>) => {
      state.sortField = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<SortOrder>) => {
      state.sortOrder = action.payload;
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
          state.datos = action.payload.data;
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

export const {
  resetAuditoriaError,
  setAuditoriaPage,
  setAuditoriaPageSize,
  setSortField,
  setSortOrder,
} = auditoriaSlice.actions;

export default auditoriaSlice.reducer;
