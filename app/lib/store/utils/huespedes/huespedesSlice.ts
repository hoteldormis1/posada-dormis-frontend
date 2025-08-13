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

const huespedesSlice = createSlice({
  name: "huespedes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
        state.error =
          action.payload ?? "Error al obtener los huéspedes";
      });
  },
});

export default huespedesSlice.reducer;
