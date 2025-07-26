import { getAuthToken } from "@/lib/store/useAuthToken";
import axios from "axios";

const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
	withCredentials: true,
});

api.interceptors.request.use((config) => {
	const token = getAuthToken(); // Token guardado en memoria
	if (token && config.headers) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default api;
