"use client";

import { store } from "../store";
import { setAuthToken } from "../useAuthToken";
import { logoutUser, refreshSession } from "../utils/user/userSlice";

export const helperFetchNewAccessToken = async (): Promise<string> => {
  try {
    // Usa Redux para refrescar sesión
    const result = await store.dispatch(refreshSession()).unwrap();
    setAuthToken(result.accessToken); 
    return result.accessToken;
  } catch (error) {
    console.error("Error al refrescar access token:", error);
    throw error; 
  }
};

export const helperPerformLogout = async (isExpired = false) => {
  try {
    await store.dispatch(logoutUser()).unwrap(); 
  } catch (error) {
    console.error("Error al cerrar sesión en backend:", error);
  } finally {
    setAuthToken("");

    // Redirigir al login, indicando si la sesión caducó
    if (window.location.pathname !== "/login") {
      const redirectUrl = isExpired ? "/login?expired=true" : "/login";
      window.location.href = redirectUrl;
    }
  }
};