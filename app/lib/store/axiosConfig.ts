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

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const accessToken = getAuthToken();

    if (
      error?.response?.status === 401 &&
      accessToken &&
      window.location.pathname !== "/login" &&
      !isRedirecting
    ) {
      originalRequest._retry = true;
      isRedirecting = true;

      try {
        await plainAxios.post("/auth/logout");
      } catch (e) {
        console.error("Logout error", e);
      }

      setAuthToken("");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (error?.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await plainAxios.post("/auth/refresh");
        setAuthToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        console.error("Token refresh failed", refreshErr);
        if (!isRedirecting) {
          isRedirecting = true;
          setAuthToken("");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
