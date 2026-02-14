// lib/store/utils/contable/contableSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "@/lib/store/axiosConfig";
import { extractErrorMessage } from "@/lib/store/utils/extractErrorMessage";
import { StateStatus } from "@/models/types";
import { RootState } from "../../store";

// ─────────────────────────── Tipos ───────────────────────────

export interface EstadoContable {
  idEstadoReserva: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
}

export interface TotalGeneral {
  cantidad: number;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
}

export interface ContableResumen {
  range: { from: string; to: string };
  estados: EstadoContable[];
  totalGeneral: TotalGeneral;
  lastUpdated: string;
}

export interface ReservaExportable {
  idReserva: number;
  huesped: string;
  dni: string;
  telefono: string;
  email: string;
  origen: string;
  habitacion: string;
  tipoHabitacion: string;
  precioNoche: number;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
}

export interface ExportarResponse {
  range: { from: string; to: string };
  total: number;
  reservas: ReservaExportable[];
}

export interface ContableState {
  resumen: ContableResumen | null;
  exportData: ExportarResponse | null;
  statusResumen: StateStatus;
  statusExport: StateStatus;
  errorResumen: string | null;
  errorExport: string | null;
}

const initialState: ContableState = {
  resumen: null,
  exportData: null,
  statusResumen: StateStatus.idle,
  statusExport: StateStatus.idle,
  errorResumen: null,
  errorExport: null,
};

// ─────────────────────────── Thunks ───────────────────────────

type ResumenParams = { from?: string; to?: string } | void;

export const fetchContableResumen = createAsyncThunk<
  ContableResumen,
  ResumenParams,
  { rejectValue: string }
>("contable/fetchResumen", async (params, { rejectWithValue }) => {
  try {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);

    const url = qs.toString()
      ? `/contable/resumen?${qs.toString()}`
      : `/contable/resumen`;

    const { data } = await api.get(url);
    return data as ContableResumen;
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err as AxiosError, "No se pudo obtener el resumen contable")
    );
  }
});

type ExportarParams = { from?: string; to?: string; estado?: string } | void;

export const fetchContableExportar = createAsyncThunk<
  ExportarResponse,
  ExportarParams,
  { rejectValue: string }
>("contable/fetchExportar", async (params, { rejectWithValue }) => {
  try {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    if (params?.estado) qs.set("estado", params.estado);

    const url = qs.toString()
      ? `/contable/exportar?${qs.toString()}`
      : `/contable/exportar`;

    const { data } = await api.get(url);
    return data as ExportarResponse;
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err as AxiosError, "No se pudo obtener los datos para exportar")
    );
  }
});

// ─────────────────────────── Slice ───────────────────────────

const contableSlice = createSlice({
  name: "contable",
  initialState,
  reducers: {
    resetContable: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Resumen
      .addCase(fetchContableResumen.pending, (state) => {
        state.statusResumen = StateStatus.loading;
        state.errorResumen = null;
      })
      .addCase(fetchContableResumen.fulfilled, (state, action) => {
        state.statusResumen = StateStatus.succeeded;
        state.resumen = action.payload;
      })
      .addCase(fetchContableResumen.rejected, (state, action) => {
        state.statusResumen = StateStatus.failed;
        state.errorResumen = action.payload ?? "Error al obtener resumen contable";
      })
      // Exportar
      .addCase(fetchContableExportar.pending, (state) => {
        state.statusExport = StateStatus.loading;
        state.errorExport = null;
      })
      .addCase(fetchContableExportar.fulfilled, (state, action) => {
        state.statusExport = StateStatus.succeeded;
        state.exportData = action.payload;
      })
      .addCase(fetchContableExportar.rejected, (state, action) => {
        state.statusExport = StateStatus.failed;
        state.errorExport = action.payload ?? "Error al obtener datos para exportar";
      });
  },
});

export const { resetContable } = contableSlice.actions;
export default contableSlice.reducer;

// ─────────────────────────── Selectores ───────────────────────────

export const selectContableResumen = (state: RootState) =>
  state.contable?.resumen ?? null;

export const selectContableExportData = (state: RootState) =>
  state.contable?.exportData ?? null;

export const selectContableStatusResumen = (state: RootState) =>
  state.contable?.statusResumen ?? StateStatus.idle;

export const selectContableStatusExport = (state: RootState) =>
  state.contable?.statusExport ?? StateStatus.idle;
