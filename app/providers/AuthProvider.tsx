"use client";

import { useLayoutEffect, useState } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { refreshSession } from "@/lib/store/utils/user/userSlice";
import { useRouter } from "next/navigation";
import { AppDispatch } from "@/lib/store/store";
import { setAuthToken } from "@/lib/store/useAuthToken";
import { LoadingSpinner } from "@/components";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const dispatch: AppDispatch = useAppDispatch();
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	useLayoutEffect(() => {
		const verifyAuth = async () => {
			try {
				const result = await dispatch(refreshSession()).unwrap();

				// ✅ Guardar token en memoria
				setAuthToken(result.accessToken);

			} catch (error: any) {
				console.warn("No se pudo refrescar sesión automáticamente.", error);
				if (error?.message) console.error("Mensaje del error:", error.message);

				router.push("/login");
			} finally {
				setLoading(false);
			}
		};

		verifyAuth();
	}, [dispatch, router]);

	if (loading) {
		return <LoadingSpinner/>;
	}

	return <>{children}</>;
}
