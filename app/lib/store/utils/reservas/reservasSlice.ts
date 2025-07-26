// src/lib/store/utils/reservas/reservasSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../../axiosConfig";
import { extractErrorMessage } from "../extractErrorMessage";
import { Reserva, ReservasState } from "@/models/types";

const initialState: ReservasState = {
  reservas: [],
  status: "idle",
  error: null,
};

export const fetchReservas = createAsyncThunk<
  Reserva[],
  void,
  { rejectValue: string }
>("reservas/fetchReservas", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/reservas");

    return data;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudieron obtener las reservas")
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
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchReservas.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.reservas = action.payload;
      })
      .addCase(fetchReservas.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Error al obtener reservas";
      });
  },
});

export default reservasSlice.reducer;
