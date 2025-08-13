// src/lib/store/features/disponibilidad/disponibilidadSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "@/lib/store/axiosConfig";
import { extractErrorMessage } from "@/lib/store/utils/extractErrorMessage";
import { Habitacion, StateStatus } from "@/models/types";
import { RootState } from "@/lib/store/store";

export interface DisponibilidadState {
  availableByDate: Record<string, Habitacion[]>;
  availabilityStatusByDate: Record<string, StateStatus>;
  availabilityErrorByDate: Record<string, string | null>;
}

const initialState: DisponibilidadState = {
  availableByDate: {},
  availabilityStatusByDate: {},
  availabilityErrorByDate: {},
};

export const fetchHabitacionesDisponiblesPorDia = createAsyncThunk<
  { date: string; rooms: Habitacion[] },
  string,
  { rejectValue: string; state: RootState }
>("disponibilidad/fetchPorDia", async (date, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/habitaciones/disponibles", { params: { date } });
    return data as { date: string; rooms: Habitacion[] };
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudieron obtener habitaciones disponibles")
    );
  }
});

const disponibilidadSlice = createSlice({
  name: "disponibilidad",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHabitacionesDisponiblesPorDia.pending, (state, action) => {
        const date = action.meta.arg;
        state.availabilityStatusByDate[date] = StateStatus.loading;
        state.availabilityErrorByDate[date] = null;
      })
      .addCase(fetchHabitacionesDisponiblesPorDia.fulfilled, (state, action) => {
        const { date, rooms } = action.payload;
        state.availableByDate[date] = rooms;
        state.availabilityStatusByDate[date] = StateStatus.succeeded;
        state.availabilityErrorByDate[date] = null;
      })
      .addCase(fetchHabitacionesDisponiblesPorDia.rejected, (state, action) => {
        const date = action.meta.arg;
        state.availabilityStatusByDate[date] = StateStatus.failed;
        state.availabilityErrorByDate[date] =
          action.payload ?? "No se pudieron obtener habitaciones disponibles";
      });
  },
});

export default disponibilidadSlice.reducer;

// Selectores de ayuda
export const selectAvailableForDate = (state: RootState, date: string) =>
  state.disponibilidad.availableByDate[date] ?? [];

export const selectAvailabilityStatusForDate = (state: RootState, date: string) =>
  state.disponibilidad.availabilityStatusByDate[date] ?? StateStatus.idle;

export const selectAvailabilityErrorForDate = (state: RootState, date: string) =>
  state.disponibilidad.availabilityErrorByDate[date] ?? null;
