// src/lib/store/utils/reservas/reservasSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "../../axiosConfig";
import { extractErrorMessage } from "../extractErrorMessage";

export enum TipoReserva {
  CheckIn = "check-in",
  CheckOut = "check-out",
  Reservado = "reservado",
  Cancelado = "cancelado",
}

export type Reserva = {
  id: string;
  numeroHab: number;
  ingreso: string;
  egreso: string;
  huespedNombre: string;
  estadoDeReserva: TipoReserva;
  telefonoHuesped?: string;
  total?: number;
};

type Status = "idle" | "loading" | "succeeded" | "failed";

interface ReservasState {
  reservas: Reserva[];
  status: Status;
  error: string | null;
}

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

    // Transformar reservas (fecha formateada + datos planos)
    const reservasFormateadas = data.map((r) => ({
      id: r.idReserva,
      numeroHab: r.Habitacion?.numero ?? "-",
      ingreso: new Date(r.fechaDesde).toLocaleDateString(),
      egreso: new Date(r.fechaHasta).toLocaleDateString(),
      huespedNombre: `${r.Huesped?.nombre} ${r.Huesped?.apellido}`,
      telefonoHuesped: r.Huesped?.telefono ?? "-",
      montoPagado: r.montoPagado,
      total: r.montoTotal,
      estadoDeReserva: r.idEstadoReserva,
    }));

    return reservasFormateadas;
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
