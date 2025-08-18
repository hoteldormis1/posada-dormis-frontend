// src/lib/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import reservasReducer from "./utils/reservas/reservasSlice";
import calendarioReducer from "./utils/calendario/calendarioSlice";
import huespedesReducer from "./utils/huespedes/huespedesSlice";
import disponibilidadReducer from "./utils/disponibilidad/disponibilidadSlice";
import userSlice from "./utils/user/userSlice";
import habitacionesSlice from "./utils/habitaciones/habitacionesSlice";
import auditoriasSlice from "./utils/auditorias/auditoriasSlice";
import dashboardSlice from "./utils/dashboard/dashboardSlice";
import { apiSlice } from "./api/apiSlice";

export const store = configureStore({
  reducer: {
    reservas: reservasReducer,
    calendario: calendarioReducer,
    huespedes: huespedesReducer,
    disponibilidad: disponibilidadReducer,
    user: userSlice,
    habitaciones: habitacionesSlice,
    auditorias: auditoriasSlice,
    dashboards: dashboardSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ✅ Tipos globales correctos
export type AppStore = typeof store;

// 🏭 Para quienes necesiten crear otro store (ej. tests)
export const makeStore = () => store;
