"use client";

import { useLayoutEffect, useState } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { refreshSession, setAccessTokenInStore, fetchCurrentUser } from "@/lib/store/utils/user/userSlice";
import { useRouter, usePathname } from "next/navigation";
import { AppDispatch } from "@/lib/store/store";
import { getAuthToken } from "@/lib/store/useAuthToken";
import { LoadingSpinner } from "@/components";
import { useToastAlert } from "@/hooks/useToastAlert";

// Rutas que redirigen al calendario si el usuario ya tiene sesión activa.
// La landing "/" es pública (sin sesión se muestra normalmente, NO va a login).
const AUTH_REDIRECT_ROUTES = ["/login"];

// Rutas públicas que siempre se muestran sin importar el estado de sesión.
const PUBLIC_ONLY_ROUTES = [
  "/",
  "/verificarCuenta",
  "/resetPassword",
  "/olvidarContrasena",
  "/confirmar-reserva",
];

const isPublicRoute = (path: string | null): boolean => {
  if (!path) return false;
  return PUBLIC_ONLY_ROUTES.some((route) =>
    route === "/" ? path === "/" : path.startsWith(route)
  ) || AUTH_REDIRECT_ROUTES.some((route) => path.startsWith(route));
};

const isAuthRedirectRoute = (path: string | null): boolean => {
  if (!path) return false;
  return AUTH_REDIRECT_ROUTES.some((route) => path === route || path.startsWith(route + "?"));
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch: AppDispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const { errorToast } = useToastAlert();

  useLayoutEffect(() => {
    let isMounted = true;

    // En rutas como /login o /: si hay sesión activa, redirigir al calendario.
    if (isAuthRedirectRoute(pathname)) {
      const tryRedirectIfLoggedIn = async () => {
        try {
          const existingToken = getAuthToken();
          if (existingToken) {
            dispatch(setAccessTokenInStore(existingToken));
            await dispatch(fetchCurrentUser()).unwrap();
            if (isMounted) router.replace("/admin/calendario");
            return;
          }
          // Sin token: intentar recuperar sesión con la cookie de refresh.
          await dispatch(refreshSession()).unwrap();
          if (isMounted) router.replace("/admin/calendario");
        } catch {
          // Sin sesión válida: mostrar la página normalmente (ej: login).
          if (isMounted) setIsReady(true);
        }
      };
      tryRedirectIfLoggedIn();
      return () => { isMounted = false; };
    }

    // Rutas públicas sin redirección (verificación, reset de contraseña, etc.).
    if (isPublicRoute(pathname)) {
      if (isMounted) setIsReady(true);
      return;
    }

    // Solo verifica autenticación al montar la app (no en cada navegación).
    // Los tokens expirados durante la sesión son manejados por el interceptor de axios (403 → refresh).
    if (isReady) return;

    const verifyAuth = async () => {
      try {
        const existingToken = getAuthToken();

        if (existingToken) {
          dispatch(setAccessTokenInStore(existingToken));
          try {
            await dispatch(fetchCurrentUser()).unwrap();
          } catch {
            // Token expirado: refresh explícito para el estado inicial.
            await dispatch(refreshSession()).unwrap();
          }
        } else {
          // Sin token en localStorage (nuevo tab, browser cerrado, mobile):
          // intentar recuperar sesión con la cookie de refresh (válida 7 días).
          const refreshResult = await dispatch(refreshSession()).unwrap();
          if (!refreshResult.accessToken) {
            throw new Error("No se recibió token del servidor");
          }
        }

        if (isMounted) setIsReady(true);
      } catch {
        errorToast("Sesión no encontrada. Por favor iniciá sesión.");
        router.push("/login");
        if (isMounted) setIsReady(true);
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch, router, pathname, isReady, errorToast]);

  if (!isReady) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}