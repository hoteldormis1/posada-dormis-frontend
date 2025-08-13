// src/lib/store/features/calendario/calendarioSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "@/lib/store/axiosConfig";
import { extractErrorMessage } from "@/lib/store/utils/extractErrorMessage";
import { StateStatus } from "@/models/types";

export interface CalendarioState {
  calendarFullyBooked: string[]; // YYYY-MM-DD
  calendarStatus: StateStatus;
  calendarError: string | null;
}

const initialState: CalendarioState = {
  calendarFullyBooked: [],
  calendarStatus: StateStatus.idle,
  calendarError: null,
};

export const fetchReservasCalendar = createAsyncThunk<
  string[],
  void,
  { rejectValue: string }
>("calendario/fetchFullyBooked", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/reservas/calendar");
    return (data?.fullyBookedDates ?? []) as string[];
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReservasCalendar.pending, (state) => {
        state.calendarStatus = StateStatus.loading;
        state.calendarError = null;
      })
      .addCase(fetchReservasCalendar.fulfilled, (state, action) => {
        state.calendarStatus = StateStatus.succeeded;
        state.calendarFullyBooked = action.payload;
      })
      .addCase(fetchReservasCalendar.rejected, (state, action) => {
        state.calendarStatus = StateStatus.failed;
        state.calendarError =
          action.payload ?? "Error al obtener el calendario";
      });
  },
});

export default calendarioSlice.reducer;
