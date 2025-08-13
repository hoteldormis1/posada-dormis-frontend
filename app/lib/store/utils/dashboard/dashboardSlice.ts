// src/lib/store/features/dashboards/dashboardsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "@/lib/store/axiosConfig";
import { extractErrorMessage } from "@/lib/store/utils/extractErrorMessage";
import { StateStatus } from "@/models/types";
import { RootState } from "../../store";

/**
 * Ajustá esta interfaz a lo que devuelva tu backend.
 * La dejo flexible para no bloquear el tipado hasta que cierres el contrato.
 */
export interface dashboardsSummary {
  [key: string]: any;
}

export interface dashboardsState {
  datos: dashboardsSummary | null;
  status: StateStatus;
  error: string | null;
  from: string | null;
  to: string | null;
}

const initialState: dashboardsState = {
  datos: null,
  status: StateStatus.idle,
  error: null,
  from: null,
  to: null,
};

type FetchParams = { from?: string; to?: string } | void;

export const fetchDashboardSummary = createAsyncThunk<
  dashboardsSummary,
  FetchParams,
  { rejectValue: string }
>("dashboards/fetchSummary", async (params, { rejectWithValue }) => {
  try {
    const qs = new URLSearchParams();
    if (params && params.from) qs.set("from", params.from);
    if (params && params.to) qs.set("to", params.to);

    const url = qs.toString()
      ? `/dashboards/summary?${qs.toString()}`
      : `/dashboards/summary`;

    const { data } = await api.get(url);
    return data as dashboardsSummary;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudo obtener el resumen del dashboards")
    );
  }
});

const dashboardsSlice = createSlice({
  name: "dashboards",
  initialState,
  reducers: {
    // Guardar rango seleccionado en el estado (opcional)
    setRange: (
      state,
      action: PayloadAction<{ from: string | null; to: string | null }>
    ) => {
      state.from = action.payload.from;
      state.to = action.payload.to;
    },
    resetdashboards: (state) => {
      state.datos = null;
      state.status = StateStatus.idle;
      state.error = null;
      state.from = null;
      state.to = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state, action) => {
        state.status = StateStatus.loading;
        state.error = null;

        // Si querés, guardamos el rango usado en la llamada
        const args = action.meta.arg as FetchParams;
        if (args && typeof args === "object") {
          state.from = args.from ?? state.from;
          state.to = args.to ?? state.to;
        }
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.status = StateStatus.succeeded;
        state.datos = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.status = StateStatus.failed;
        state.error =
          action.payload ?? "Error al obtener el resumen del dashboards";
      });
  },
});

export const { setRange, resetdashboards } = dashboardsSlice.actions;
export default dashboardsSlice.reducer;

// Selectores opcionales
// ...resto del slice
export const selectDashboardState = (state: RootState) => state.dashboards ?? initialState;

export const selectDashboardSummary = (state: RootState) =>
  (state.dashboards?.datos ?? null);

export const selectDashboardStatus = (state: RootState) =>
  (state.dashboards?.status ?? StateStatus.idle);

export const selectDashboardError = (state: RootState) =>
  (state.dashboards?.error ?? null);

export const selectDashboardRange = (state: RootState) =>
  ({
    from: state.dashboards?.from ?? null,
    to: state.dashboards?.to ?? null,
  } as const);