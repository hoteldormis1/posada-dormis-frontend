import { configureStore } from '@reduxjs/toolkit';
import userSlice from './utils/user/userSlice';

// ✅ Creamos una instancia real del store
export const store = configureStore({
  reducer: {
    user: userSlice,
  },
});

// 🏭 Para quienes necesiten crear otro store (ej. tests)
export const makeStore = () => store;

// ✅ Tipos globales correctos
export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];
export type RootState = ReturnType<AppStore['getState']>;
