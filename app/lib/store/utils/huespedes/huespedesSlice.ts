// src/lib/store/features/huespedes/huespedesSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "@/lib/store/axiosConfig";
import { extractErrorMessage } from "@/lib/store/utils/extractErrorMessage";
import { Huesped } from "@/models/types/huesped";
import { StateStatus } from "@/models/types";

export interface HuespedesState {
  datos: Huesped[];
  status: StateStatus;
  error: string | null;
}

const initialState: HuespedesState = {
  datos: [],
  status: StateStatus.idle,
  error: null,
};

export const fetchHuespedes = createAsyncThunk<
  Huesped[],
  void,
  { rejectValue: string }
>("huespedes/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/huespedes");
    return data as Huesped[];
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudieron obtener los huéspedes")
    );
  }
});

export const addHuesped = createAsyncThunk<
  Huesped,
  Partial<Huesped>,
  { rejectValue: string }
>("huespedes/add", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/huespedes", payload);
    return data as Huesped;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudo crear el huésped")
    );
  }
});

export const editHuesped = createAsyncThunk<
  Huesped,
  { idHuesped: number } & Partial<Huesped>,
  { rejectValue: string }
>("huespedes/edit", async (payload, { rejectWithValue }) => {
  try {
    const { idHuesped, ...data } = payload;
    const response = await api.put(`/huespedes/${idHuesped}`, data);
    return response.data as Huesped;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudo actualizar el huésped")
    );
  }
});

export const deleteHuesped = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("huespedes/delete", async (idHuesped, { rejectWithValue }) => {
  try {
    await api.delete(`/huespedes/${idHuesped}`);
    return idHuesped;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudo eliminar el huésped")
    );
  }
});

const huespedesSlice = createSlice({
  name: "huespedes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchHuespedes.pending, (state) => {
        state.status = StateStatus.loading;
        state.error = null;
      })
      .addCase(fetchHuespedes.fulfilled, (state, action) => {
        state.status = StateStatus.succeeded;
        state.datos = action.payload;
      })
      .addCase(fetchHuespedes.rejected, (state, action) => {
        state.status = StateStatus.failed;
        state.error = action.payload ?? "Error al obtener los huéspedes";
      })
      // Add
      .addCase(addHuesped.fulfilled, (state, action) => {
        state.datos.push(action.payload);
      })
      // Edit
      .addCase(editHuesped.fulfilled, (state, action) => {
        const index = state.datos.findIndex(
          (h) => h.idHuesped === action.payload.idHuesped
        );
        if (index !== -1) {
          state.datos[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteHuesped.fulfilled, (state, action) => {
        state.datos = state.datos.filter(
          (h) => h.idHuesped !== action.payload
        );
      });
  },
});

export default huespedesSlice.reducer;
