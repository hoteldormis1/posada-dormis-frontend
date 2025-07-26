"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { refreshSession } from "@/lib/store/utils/user/userSlice";
import { useRouter, usePathname } from "next/navigation";
import { AppDispatch } from "@/lib/store/store";
import { setAuthToken } from "@/lib/store/useAuthToken";
import { LoadingSpinner } from "@/components";

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const dispatch: AppDispatch = useAppDispatch();
	const router = useRouter();
	const pathname = usePathname();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		const verifyAuth = async () => {
			try {
				const result = await dispatch(refreshSession()).unwrap();
				if (isMounted) setAuthToken(result.accessToken);
			} catch (error) {
				console.warn("No se pudo refrescar sesión automáticamente:", error);
				if (pathname !== "/login") {
					router.replace("/login");
				}
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		verifyAuth();

		return () => {
			isMounted = false; // evita actualizar el estado si el componente se desmonta
		};
	}, [dispatch, router, pathname]);

	if (loading) return <LoadingSpinner />;

	return <>{children}</>;
}
