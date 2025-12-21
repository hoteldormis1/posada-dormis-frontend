// src/lib/store/features/calendario/calendarioSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "@/lib/store/axiosConfig";
import { extractErrorMessage } from "@/lib/store/utils/extractErrorMessage";
import { StateStatus } from "@/models/types";

export type CalendarioBooking = {
  id: string | number;
  // si usás "roomNumber" en el backend, lo guardamos igual y el UI mapea a lo que necesite
  roomId?: number | string | null;
  roomNumber?: number | null;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD (tratar como end-exclusive en el front)
  guest?: string | null;
  price?: number | null;
  status?: string | null;
};

export type CalendarioByDate = {
  date: string;          // YYYY-MM-DD
  roomsReserved: number; // cantidad de habitaciones reservadas ese día
  // puede venir como roomIds o roomNumbers según el handler
  roomIds?: Array<number | string>;
  roomNumbers?: number[];
};

export interface CalendarioState {
  calendarFullyBooked: string[];     // YYYY-MM-DD
  bookings: CalendarioBooking[];     // reservas solapadas con el rango
  byDate: CalendarioByDate[];        // ocupación por día
  calendarStatus: StateStatus;
  calendarError: string | null;
}

const initialState: CalendarioState = {
  calendarFullyBooked: [],
  bookings: [],
  byDate: [],
  calendarStatus: StateStatus.idle,
  calendarError: null,
};

// La respuesta puede ser el formato "simple" (sólo fullyBookedDates)
// o el formato "extendido" (rooms, bookings, byDate, fullyBookedDates, range, etc.)
type CalendarApiResponse =
  | { fullyBookedDates?: string[] } & Partial<{
      rooms: Array<{ id: number | string; numero?: number; name?: string }>;
      bookings: CalendarioBooking[];
      byDate: CalendarioByDate[];
      range: { startDate: string; endDate: string; endExclusive?: boolean };
      roomCount: number;
    }>;

export const fetchReservasCalendar = createAsyncThunk<
  // Payload que guardará el reducer
  { fullyBookedDates: string[]; bookings: CalendarioBooking[]; byDate: CalendarioByDate[] },
  // Params opcionales para pasar rango y filtro por número de habitación
  { startDate?: string; endDate?: string; habitacionesNumeros?: number[] } | void,
  { rejectValue: string }
>("calendario/fetchCalendar", async (params, { rejectWithValue }) => {
  try {
    // Soportamos ambas rutas:
    // - /reservas/calendar           (la simple)
    // - /api/calendario?startDate=...&endDate=...&habitacionesNumeros=...  (la extendida)
    // Si te queda sólo una, dejá la que uses.
    let url: string;

    // Si recibimos parámetros, asumimos el endpoint extendido
    if (params && (params.startDate || params.endDate || params.habitacionesNumeros?.length)) {
      const qs = new URLSearchParams();
      if (params.startDate) qs.set("startDate", params.startDate);
      if (params.endDate) qs.set("endDate", params.endDate);
      if (params.habitacionesNumeros && params.habitacionesNumeros.length) {
        qs.set("habitacionesNumeros", params.habitacionesNumeros.join(","));
      }
      url = `/reservas/calendar?${qs.toString()}`;
    } else {
      // compat con tu handler simple original
      url = `/reservas/calendar`;
    }

    const { data } = await api.get<CalendarApiResponse>(url);

    const fullyBookedDates = Array.isArray(data?.fullyBookedDates) ? data!.fullyBookedDates! : [];
    const bookings = Array.isArray(data?.bookings) ? (data!.bookings as CalendarioBooking[]) : [];
    const byDate = Array.isArray(data?.byDate) ? (data!.byDate as CalendarioByDate[]) : [];

    return { fullyBookedDates, bookings, byDate };
  } catch (err) {
    const axiosError = err as AxiosError;
    return rejectWithValue(
      extractErrorMessage(axiosError, "No se pudo obtener el calendario")
    );
  }
});

const calendarioSlice = createSlice({
  name: "calendario",
  initialState,
  reducers: {
    resetCalendario(state) {
      state.calendarFullyBooked = [];
      state.bookings = [];
      state.byDate = [];
      state.calendarStatus = StateStatus.idle;
      state.calendarError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReservasCalendar.pending, (state) => {
        state.calendarStatus = StateStatus.loading;
        state.calendarError = null;
      })
      .addCase(fetchReservasCalendar.fulfilled, (state, action) => {
        state.calendarStatus = StateStatus.succeeded;
        state.calendarFullyBooked = action.payload.fullyBookedDates ?? [];
        state.bookings = action.payload.bookings ?? [];
        state.byDate = action.payload.byDate ?? [];
      })
      .addCase(fetchReservasCalendar.rejected, (state, action) => {
        state.calendarStatus = StateStatus.failed;
        state.calendarError =
          action.payload ?? "Error al obtener el calendario";
      });
  },
});

export const { resetCalendario } = calendarioSlice.actions;
export default calendarioSlice.reducer;
