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

    console.log("[AuthProvider] Effect running, pathname:", pathname);

    if (isPublicRoute(pathname)) {
      console.log("[AuthProvider] Public route detected, skipping auth");
      if (isMounted) setIsReady(true);
      return;
    }

    const verifyAuth = async () => {
      console.log("[AuthProvider] Starting auth verification...");
      
      try {
        const existingToken = getAuthToken();
        console.log("[AuthProvider] Token in sessionStorage:", existingToken ? "✓ EXISTS" : "✗ MISSING");

        if (existingToken) {
          console.log("[AuthProvider] Restoring token to Redux...");
          dispatch(setAccessTokenInStore(existingToken));

          try {
            console.log("[AuthProvider] Fetching currentUser with existing token...");
            const user = await dispatch(fetchCurrentUser()).unwrap();
            console.log("[AuthProvider] ✓ CurrentUser loaded:", user);
          } catch (fetchError) {
            console.warn("[AuthProvider] ✗ fetchCurrentUser failed, trying refreshSession...");
            const refreshResult = await dispatch(refreshSession()).unwrap();
            console.log("[AuthProvider] ✓ refreshSession succeeded, currentUser should be in state");
          }
        } else {
          console.log("[AuthProvider] No token, calling refreshSession (uses httpOnly cookie)...");
          const refreshResult = await dispatch(refreshSession()).unwrap();
          console.log("[AuthProvider] ✓ refreshSession succeeded:", {
            hasToken: !!refreshResult.accessToken,
            hasUser: !!refreshResult.currentUser
          });
          
          if (!refreshResult.accessToken) {
            throw new Error("No token received from refreshSession");
          }
        }

        console.log("[AuthProvider] ✓ Auth complete, setting ready");
        if (isMounted) setIsReady(true);

      } catch (error: any) {
        console.error("[AuthProvider] ✗ Auth failed:", error.message || error);

        toast.error("Usuario no logueado. Por favor iniciá sesión.", {
          id: "auth-error",
          duration: 3000,
        });

        console.log("[AuthProvider] Redirecting to /login...");
        router.push("/login");
        
        if (isMounted) setIsReady(true);
      }
    };

    verifyAuth();
    
    return () => {
      console.log("[AuthProvider] Cleanup");
      isMounted = false;
    };
  }, [dispatch, router, pathname]);

  if (!isReady) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}