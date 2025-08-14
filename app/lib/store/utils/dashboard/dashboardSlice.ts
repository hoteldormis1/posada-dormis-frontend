// src/lib/store/features/dashboards/dashboardsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "@/lib/store/axiosConfig";
import { extractErrorMessage } from "@/lib/store/utils/extractErrorMessage";
import { StateStatus } from "@/models/types";
import { RootState } from "../../store";

export interface dashboardsSummary {
  [key: string]: any;
}

// Granularidades válidas
export type agruparPor = "day" | "week" | "month" | "year";

export interface dashboardsState {
  datos: dashboardsSummary | null;
  status: StateStatus;
  error: string | null;
  from: string | null;
  to: string | null;
  agruparPor: agruparPor | null;
}

const initialState: dashboardsState = {
  datos: null,
  status: StateStatus.idle,
  error: null,
  from: null,
  to: null,
  agruparPor: null,
};

// Params aceptados por el thunk
type FetchParams =
  | {
      from?: string;
      to?: string;
      agruparPor?: agruparPor;
      bucketDays?: number;
      ventaBy?: "pagado" | "estado";
    }
  | void;

export const fetchDashboardSummary = createAsyncThunk<
  dashboardsSummary,
  FetchParams,
  { rejectValue: string }
>("dashboards/fetchSummary", async (params, { rejectWithValue }) => {
  try {
    const qs = new URLSearchParams();
    if (params && params.from) qs.set("from", params.from);
    if (params && params.to) qs.set("to", params.to);
    if (params && params.agruparPor) qs.set("agruparPor", params.agruparPor);
    if (params && typeof params.bucketDays === "number")
      qs.set("bucketDays", String(params.bucketDays));
    if (params && params.ventaBy) qs.set("ventaBy", params.ventaBy);

    // ✅ usar el endpoint singular que expone tu backend
    const url = qs.toString()
      ? `/dashboards/summary?${qs.toString()}`
      : `/dashboards/summary`;

    const { data } = await api.get(url);
    return data as dashboardsSummary;
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudo obtener el resumen del dashboard")
    );
  }
});

const dashboardsSlice = createSlice({
  name: "dashboards",
  initialState,
  reducers: {
    setRange: (
      state,
      action: PayloadAction<{ from: string | null; to: string | null }>
    ) => {
      state.from = action.payload.from;
      state.to = action.payload.to;
    },
    setGranularity: (state, action: PayloadAction<agruparPor | null>) => {
      state.agruparPor = action.payload;
    },
    resetdashboards: (state) => {
      state.datos = null;
      state.status = StateStatus.idle;
      state.error = null;
      state.from = null;
      state.to = null;
      state.agruparPor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state, action) => {
        state.status = StateStatus.loading;
        state.error = null;

        const args = action.meta.arg as FetchParams;
        if (args && typeof args === "object") {
          state.from = args.from ?? state.from;
          state.to = args.to ?? state.to;
          if (args.agruparPor) state.agruparPor = args.agruparPor;
        }
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.status = StateStatus.succeeded;
        state.datos = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.status = StateStatus.failed;
        state.error =
          action.payload ?? "Error al obtener el resumen del dashboard";
      });
  },
});

export const { setRange, setGranularity , resetdashboards } = dashboardsSlice.actions;
export default dashboardsSlice.reducer;

// Selectores
export const selectDashboardState = (state: RootState) =>
  state.dashboards ?? initialState;

export const selectDashboardSummary = (state: RootState) =>
  state.dashboards?.datos ?? null;

export const selectDashboardStatus = (state: RootState) =>
  state.dashboards?.status ?? StateStatus.idle;

export const selectDashboardError = (state: RootState) =>
  state.dashboards?.error ?? null;

export const selectDashboardRange = (state: RootState) =>
  ({
    from: state.dashboards?.from ?? null,
    to: state.dashboards?.to ?? null,
  } as const);

// 👇 NUEVOS selectores
export const selectDashboardGranularity = (state: RootState) =>
  state.dashboards?.agruparPor ?? null;
