import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import api from "@/lib/store/axiosConfig";
import { extractErrorMessage } from "@/lib/store/utils/extractErrorMessage";
import { StateStatus } from "@/models/types";

export interface HuespedNoDeseado {
  idHuespedNoDeseado: number;
  dni: string;
  motivo: string | null;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HuespedNoDeseadoState {
  datos: HuespedNoDeseado[];
  status: StateStatus;
  error: string | null;
}

const initialState: HuespedNoDeseadoState = {
  datos: [],
  status: StateStatus.idle,
  error: null,
};

export const fetchHuespedNoDeseado = createAsyncThunk<
  HuespedNoDeseado[],
  void,
  { rejectValue: string }
>("huespedNoDeseado/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/huespedes-no-deseados");
    return data as HuespedNoDeseado[];
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err as AxiosError, "No se pudo obtener la lista negra")
    );
  }
});

export const addHuespedNoDeseado = createAsyncThunk<
  HuespedNoDeseado,
  Partial<HuespedNoDeseado>,
  { rejectValue: string }
>("huespedNoDeseado/add", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/huespedes-no-deseados", payload);
    return data as HuespedNoDeseado;
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err as AxiosError, "No se pudo agregar a la lista negra")
    );
  }
});

export const editHuespedNoDeseado = createAsyncThunk<
  HuespedNoDeseado,
  Partial<HuespedNoDeseado> & { idHuespedNoDeseado: number },
  { rejectValue: string }
>("huespedNoDeseado/edit", async ({ idHuespedNoDeseado, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/huespedes-no-deseados/${idHuespedNoDeseado}`, payload);
    return data as HuespedNoDeseado;
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err as AxiosError, "No se pudo actualizar")
    );
  }
});

export const deleteHuespedNoDeseado = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("huespedNoDeseado/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/huespedes-no-deseados/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(
      extractErrorMessage(err as AxiosError, "No se pudo eliminar de la lista negra")
    );
  }
});

const huespedNoDeseadoSlice = createSlice({
  name: "huespedNoDeseado",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHuespedNoDeseado.pending, (state) => {
        state.status = StateStatus.loading;
        state.error = null;
      })
      .addCase(fetchHuespedNoDeseado.fulfilled, (state, action) => {
        state.status = StateStatus.succeeded;
        state.datos = action.payload;
      })
      .addCase(fetchHuespedNoDeseado.rejected, (state, action) => {
        state.status = StateStatus.failed;
        state.error = action.payload ?? "Error desconocido";
      })
      .addCase(addHuespedNoDeseado.fulfilled, (state, action) => {
        state.datos.unshift(action.payload);
      })
      .addCase(editHuespedNoDeseado.fulfilled, (state, action) => {
        const idx = state.datos.findIndex(
          (h) => h.idHuespedNoDeseado === action.payload.idHuespedNoDeseado
        );
        if (idx !== -1) state.datos[idx] = action.payload;
      })
      .addCase(deleteHuespedNoDeseado.fulfilled, (state, action) => {
        state.datos = state.datos.filter(
          (h) => h.idHuespedNoDeseado !== action.payload
        );
      });
  },
});

export default huespedNoDeseadoSlice.reducer;
