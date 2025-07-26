"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm, LoginIzquierda } from "../../components";
import { useToastAlert } from "@/utils/hooks/useToastAlert";

const Login: React.FC = () => {
  const searchParams = useSearchParams();
  const { errorToast } = useToastAlert();
  const toastShown = useRef(false); // Evita doble ejecución

  useEffect(() => {
    const isExpired = searchParams.get("expired") === "true";
    if (isExpired && !toastShown.current) {
      toastShown.current = true;
      errorToast("Tu sesión ha caducado. Por favor inicia sesión nuevamente.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, errorToast]);

  return (
    <div
      className="flex flex-col justify-center items-center min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/carlos_paz.png')" }}
    >
      <div className="flex flex-col w-full md:w-auto md:flex-row px-8">
        <LoginIzquierda includeDescription={true} />

        <div className="flex flex-col justify-center w-full md:w-1/2 bg-black bg-opacity-80 p-8 text-white">
          <h2 className="text-2xl font-semibold mb-6">Ingresar a tu cuenta</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
