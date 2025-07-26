import { getAuthToken } from "@/lib/store/useAuthToken";
import axios from "axios";
import { helperFetchNewAccessToken, helperPerformLogout } from "./helpers/authHelpers";

let isRedirecting = false;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const accessToken = getAuthToken();

    // Token inválido -> Logout
    if (
      error?.response?.status === 401 &&
      accessToken !== "" &&
      window.location.pathname !== "/login" &&
      !isRedirecting
    ) {
      originalRequest._retry = true;
      isRedirecting = true;
      await helperPerformLogout(true);
      return Promise.reject(error);
    }

    // Token expirado -> Refresh
    if (error?.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await helperFetchNewAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        console.error("Error al refrescar token automáticamente", refreshErr);
        if (!isRedirecting) {
          isRedirecting = true;
          await helperPerformLogout();
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
