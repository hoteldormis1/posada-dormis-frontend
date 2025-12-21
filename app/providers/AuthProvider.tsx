"use client";

import { useLayoutEffect, useState } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { refreshSession } from "@/lib/store/utils/user/userSlice";
import { useRouter, usePathname } from "next/navigation";
import { AppDispatch } from "@/lib/store/store";
import { setAuthToken } from "@/lib/store/useAuthToken";
import { LoadingSpinner } from "@/components";

const PUBLIC_ROUTES = [
  "/login",
  "/verificarCuenta",
  "/resetPassword",
  "/olvidarContrasena",
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch: AppDispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    // ⛔️ Saltar auth refresh en rutas públicas
    if (pathname && PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) {
      setLoading(false);
      return;
    }

    const verifyAuth = async () => {
      try {
        const result = await dispatch(refreshSession()).unwrap();
        setAuthToken(result.accessToken);
      } catch (error: any) {
        console.warn("No se pudo refrescar sesión automáticamente.", error);
        if (error?.message) console.error("Mensaje del error:", error.message);
        router.push("/login?expired=true");
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [dispatch, router, pathname]);

  if (loading) return <LoadingSpinner />;

  return <>{children}</>;
}
