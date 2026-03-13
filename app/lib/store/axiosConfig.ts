import { getAuthToken, setAuthToken } from "@/lib/store/useAuthToken";
import axios from "axios";

let isRedirecting = false;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

const plainAxios = axios.create({
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

// Redirige a login sin mostrar ningún error ni popup
const redirectToLogin = async (doLogout = false) => {
  if (isRedirecting) return;
  isRedirecting = true;
  if (doLogout) {
    try { await plainAxios.post("/auth/logout"); } catch { /* silencioso */ }
  }
  setAuthToken(null);
  window.location.href = "/login";
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const accessToken = getAuthToken();

    // Ya estamos yendo a login o ya se inició el redirect: no hacer nada
    if (isRedirecting || (typeof window !== "undefined" && window.location.pathname === "/login")) {
      return Promise.reject(error);
    }

    // 401: el servidor no recibió token (o lo rechazó explícitamente)
    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (accessToken) {
        // Había token en memoria pero el servidor lo rechazó → sesión inválida
        await redirectToLogin(true);
        return Promise.reject(error);
      }

      // Sin token en memoria/sessionStorage (caso mobile: tab suspendido por iOS Safari)
      // Intentar un refresh silencioso usando la cookie httpOnly antes de rendirse
      try {
        const { data } = await plainAxios.post("/auth/refresh");
        setAuthToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        // Cookie de refresh expirada o inválida → redirigir a login sin ningún error
        await redirectToLogin(false);
        return Promise.reject(error);
      }
    }

    // 403: token presente pero expirado → intentar refresh
    if (error?.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await plainAxios.post("/auth/refresh");
        setAuthToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        await redirectToLogin(false);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
