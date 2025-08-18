import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthToken, setAuthToken } from "@/lib/store/useAuthToken";

const rawBaseQuery = fetchBaseQuery({
	baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
	credentials: "include",
	prepareHeaders: (headers) => {
		const token = getAuthToken();
		if (token) headers.set("authorization", `Bearer ${token}`);
		return headers;
	},
});

const baseQueryWithReauth: typeof rawBaseQuery = async (args, api, extraOptions) => {
	let result: any = await rawBaseQuery(args, api, extraOptions);

	if (result?.error?.status === 403) {
		const refresh = await rawBaseQuery({ url: "/auth/refresh", method: "POST" }, api, extraOptions);
		const newToken = (refresh as any)?.data?.accessToken as string | undefined;
		if (newToken) {
			setAuthToken(newToken);
			result = await rawBaseQuery(args, api, extraOptions);
		}
	}

	if (result?.error?.status === 401 && typeof window !== "undefined") {
		setAuthToken("");
		window.location.href = "/login";
	}

	return result;
};

export const apiSlice = createApi({
	reducerPath: "api",
	baseQuery: baseQueryWithReauth,
	tagTypes: [
		"Reservas",
		"Habitaciones",
		"TiposHabitacion",
		"EstadosReserva",
		"Usuarios",
		"TiposUsuarios",
	],
	endpoints: () => ({}),
});

export default apiSlice;


