// src/lib/store/features/reservas/reservasSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "@/lib/store/axiosConfig";
import { extractErrorMessage } from "@/lib/store/utils/extractErrorMessage";
import { AddReservaPayload, Reserva, StateStatus } from "@/models/types";

export interface ReservasState {
  reservas: Reserva[];
  status: StateStatus;
  error: string | null;
}

const initialState: ReservasState = {
  reservas: [],
  status: StateStatus.idle,
  error: null,
};

export const fetchReservas = createAsyncThunk<
  Reserva[],
  void,
  { rejectValue: string }
>("reservas/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/reservas");
    return data as Reserva[];
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudieron obtener las reservas")
    );
  }
});

export const addReserva = createAsyncThunk<
  Reserva,
  AddReservaPayload,
  { rejectValue: string }
>("reservas/add", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/reservas", payload);
    return data as Reserva;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudo crear la reserva")
    );
  }
});

export const editReserva = createAsyncThunk<
  Reserva,
  { id: string; idEstadoReserva?: number; fechaDesde?: string; fechaHasta?: string; montoPagado?: number; },
  { rejectValue: string }
>("reservas/edit", async ({ id, ...updateData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/reservas/${id}`, updateData);
    return data as Reserva;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudo editar la reserva")
    );
  }
});

export const deleteReserva = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("reservas/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/reservas/${id}`);
    return id;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudo eliminar la reserva")
    );
  }
});

export const checkinReserva = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>("reservas/checkin", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/reservas/${id}/checkin`);
    return data;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudo registrar el check-in")
    );
  }
});

export const checkoutReserva = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>("reservas/checkout", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/reservas/${id}/checkout`);
    return data;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudo registrar el check-out")
    );
  }
});

export const confirmarReserva = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>("reservas/confirmar", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/reservas/${id}/confirmar`);
    return data;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudo confirmar la reserva")
    );
  }
});

export const cancelarReserva = createAsyncThunk<
  any,
  string,
  { rejectValue: string }
>("reservas/cancelar", async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/reservas/${id}/cancelar`);
    return data;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudo cancelar la reserva")
    );
  }
});

const reservasSlice = createSlice({
  name: "reservas",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReservas.pending, (state) => {
        state.status = StateStatus.loading;
        state.error = null;
      })
      .addCase(fetchReservas.fulfilled, (state, action) => {
        state.status = StateStatus.succeeded;
        state.reservas = action.payload;
      })
      .addCase(fetchReservas.rejected, (state, action) => {
        state.status = StateStatus.failed;
        state.error = action.payload ?? "Error al obtener reservas";
      })
      .addCase(addReserva.fulfilled, (state, action) => {
        state.reservas.unshift(action.payload);
      })
      .addCase(editReserva.fulfilled, (state, action) => {
        const idx = state.reservas.findIndex(r => r.id === action.payload.id);
        if (idx >= 0) state.reservas[idx] = action.payload;
      })
      .addCase(deleteReserva.fulfilled, (state, action) => {
        state.reservas = state.reservas.filter(r => r.id !== action.payload);
      });
  },
});

export default reservasSlice.reducer;
