"use client";

import { useLayoutEffect, useState } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import { refreshSession, setAccessTokenInStore, fetchCurrentUser } from "@/lib/store/utils/user/userSlice";
import { useRouter, usePathname } from "next/navigation";
import { AppDispatch } from "@/lib/store/store";
import { getAuthToken } from "@/lib/store/useAuthToken";
import { LoadingSpinner } from "@/components";
import toast from "react-hot-toast";

const PUBLIC_ROUTES = [
  "/login",
  "/verificarCuenta",
  "/resetPassword",
  "/olvidarContrasena",
  "/confirmar-reserva",
];

const isPublicRoute = (path: string | null): boolean => {
  if (!path) return false;
  
  // Exact match for landing page
  if (path === "/") return true;
  
  // Check if path starts with any public route
  return PUBLIC_ROUTES.some((route) => path.startsWith(route));
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch: AppDispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    let isMounted = true;

    if (isPublicRoute(pathname)) {
      if (isMounted) setIsReady(true);
      return;
    }

    const verifyAuth = async () => {
      
      try {
        const existingToken = getAuthToken();

        if (existingToken) {
          dispatch(setAccessTokenInStore(existingToken));

          try {
            const user = await dispatch(fetchCurrentUser()).unwrap();
          } catch (fetchError) {
            const refreshResult = await dispatch(refreshSession()).unwrap();
          }
        } else {
          const refreshResult = await dispatch(refreshSession()).unwrap();
          
          
          if (!refreshResult.accessToken) {
            throw new Error("No token received from refreshSession");
          }
        }

        if (isMounted) setIsReady(true);

      } catch (error: any) {
        console.error("[AuthProvider] ✗ Auth failed:", error.message || error);

        toast.error("Usuario no logueado. Por favor iniciá sesión.", {
          id: "auth-error",
          duration: 3000,
        });

        router.push("/login");
        
        if (isMounted) setIsReady(true);
      }
    };

    verifyAuth();
    
    return () => {
      isMounted = false;
    };
  }, [dispatch, router, pathname]);

  if (!isReady) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}