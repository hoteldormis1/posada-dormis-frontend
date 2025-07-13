"use client";

import { useLayoutEffect, useState } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { refreshSession } from "@/lib/store/utils/user/userSlice";
import { useRouter } from "next/navigation";
import api from "@/lib/store/axiosConfig";
import { AppDispatch } from "@/lib/store/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const dispatch: AppDispatch = useAppDispatch();
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [token, setToken] = useState<string | null>(null);

	// 🔐 Intentar obtener accessToken desde el refresh token
	useLayoutEffect(() => {
		const verifyAuth = async () => {
			try {
				const result = await dispatch(refreshSession()).unwrap();
				setToken(result.accessToken); // ✅ guarda access token en memoria
			} catch (error) {
				console.warn("No se pudo refrescar sesión automáticamente.", error);

				// Si es un error de tipo Axios, mostrará el mensaje del servidor si existe
				if (error instanceof Error) {
					console.error("Mensaje del error:", error.message);
				}

				router.push("/login");
			} finally {
				setLoading(false);
			}
		};

		verifyAuth();
	}, [dispatch, router]);

	// 🛡️ Agrega el interceptor de autorización
	useLayoutEffect(() => {
		if (!token) return;

		const authInterceptor = api.interceptors.request.use((config) => {
			if (token) {
				if (config.headers) {
					config.headers['Authorization'] = `Bearer ${token}`;
				}
			}

			return config;
		});

		// Limpieza del interceptor cuando cambia el token o se desmonta el componente
		return () => {
			api.interceptors.request.eject(authInterceptor);
		};
	}, [token]);

	if (loading) {
		return <div className="text-white p-8">Verificando sesión...</div>;
	}

	return <>{children}</>;
}
