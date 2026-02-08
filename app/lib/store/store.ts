// src/lib/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import reservasReducer from "./utils/reservas/reservasSlice";
import calendarioReducer from "./utils/calendario/calendarioSlice";
import huespedesReducer from "./utils/huespedes/huespedesSlice";
import disponibilidadReducer from "./utils/disponibilidad/disponibilidadSlice";
import userSlice from "./utils/user/userSlice";
import habitacionesSlice from "./utils/habitaciones/habitacionesSlice";
import tipoHabitacionesSlice from "./utils/tipoHabitaciones/tipoHabitacionesSlice";
import auditoriasSlice from "./utils/auditorias/auditoriasSlice";
import dashboardSlice from "./utils/dashboard/dashboardSlice";
import huespedNoDeseadoSlice from "./utils/huespedNoDeseado/huespedNoDeseadoSlice";

export const store = configureStore({
  reducer: {
    reservas: reservasReducer,
    calendario: calendarioReducer,
    huespedes: huespedesReducer,
    disponibilidad: disponibilidadReducer,
    user: userSlice,
    habitaciones: habitacionesSlice,
    tipoHabitaciones: tipoHabitacionesSlice,
    auditorias: auditoriasSlice,
    dashboards: dashboardSlice,
    huespedNoDeseado: huespedNoDeseadoSlice,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppStore = typeof store;

export const makeStore = () => store;
