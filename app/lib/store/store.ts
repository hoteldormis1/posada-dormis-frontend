import { configureStore } from '@reduxjs/toolkit';
import userSlice from './utils/user/userSlice';
import habitacionesSlice from './utils/habitaciones/habitacionesSlice';
import reservasSlice from './utils/reservas/reservasSlice';
import auditoriasSlice from './utils/auditorias/auditoriasSlice';

// ✅ Creamos una instancia real del store
export const store = configureStore({
  reducer: {
    user: userSlice,
    habitaciones: habitacionesSlice,
    reservas: reservasSlice,
    auditorias: auditoriasSlice
  },
});

// 🏭 Para quienes necesiten crear otro store (ej. tests)
export const makeStore = () => store;

// ✅ Tipos globales correctos
export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];
export type RootState = ReturnType<AppStore['getState']>;
