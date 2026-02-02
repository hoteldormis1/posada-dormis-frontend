"use client";

import { useLayoutEffect, useState } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { refreshSession } from "@/lib/store/utils/user/userSlice";
import { useRouter, usePathname } from "next/navigation";
import { AppDispatch } from "@/lib/store/store";
import { setAuthToken } from "@/lib/store/useAuthToken";
import { LoadingSpinner } from "@/components";
import toast from "react-hot-toast";

const PUBLIC_ROUTES = [
  "/",
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
        
        // El token ya fue seteado en memoria por refreshSession
        if (!result.accessToken) {
          throw new Error("No se recibió token");
        }
      } catch (error: any) {
        console.warn("No se pudo refrescar sesión:", error);
        
        // Mostrar toast de error UNA SOLA VEZ
        toast.error("Usuario no logueado. Por favor iniciá sesión.", {
          id: "auth-error", // ID único para evitar duplicados
          duration: 3000,
        });
        
        // Redirigir al login
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [dispatch, router, pathname]);

  if (loading) return <LoadingSpinner />;

  return <>{children}</>;
}
