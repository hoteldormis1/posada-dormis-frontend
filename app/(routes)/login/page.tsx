"use client";

import React, { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "../../components";
import { useToastAlert } from "@/hooks/useToastAlert";

const Login: React.FC = () => {
  const searchParams = useSearchParams();
  const { errorToast } = useToastAlert();
  const toastShown = useRef(false); // Evita doble ejecución

  useEffect(() => {
    const isExpired = searchParams.get("expired") === "true";
    if (isExpired && !toastShown.current) {
      toastShown.current = true;
      errorToast("Tu sesión ha caducado. Por favor inicia sesión nuevamente.");
      // window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams, errorToast]);

  return (
    <div className="login-screen">
      <section className="login-left">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border border-emerald-400/30 bg-emerald-400/15 flex items-center justify-center text-sm">
            🏠
          </div>
          <div>
            <p className="text-white font-semibold leading-tight">Posada Dormi&apos;s</p>
            <p className="text-xs text-white/55">Mina Clavero, Córdoba</p>
          </div>
        </div>

        <div className="flex-1 flex items-center">
          <div>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight max-w-[520px]">
              Posada Dormi&apos;s
            </h1>
            <p className="mt-4 text-xl font-semibold text-white/95">
              ¡Bienvenido a la Posada Dormi&apos;s!
            </p>
            <p className="mt-6 text-white/70 max-w-[420px] text-[15px] leading-7">
              Ubicada en Mina Clavero, Córdoba, te ofrecemos una estancia inolvidable.
            </p>
            <ul className="mt-10 space-y-3 text-sm text-white/80">
              {[
                { icon: "🥐", text: "Desayuno incluido: Comienza tu día con un delicioso desayuno." },
                { icon: "✨", text: "Servicios exclusivos: Comodidades diseñadas para tu confort." },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg border border-emerald-400/30 bg-emerald-400/15 flex items-center justify-center text-xs">
                    {item.icon}
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-xs text-white/30">© 2025 Posada Dormi&apos;s</p>
      </section>

      <section className="login-right">
        <div className="w-full max-w-[360px]">
          <h2 className="login-panel-title">Bienvenido de vuelta</h2>
          <p className="login-panel-subtitle mb-8">
            Ingresá tus credenciales para continuar
          </p>
          <LoginForm />
          <div className="flex items-center gap-3 my-6">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] text-white/30">Sistema interno</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <p className="text-center text-[11px] text-white/20 tracking-wide">
            POSADA DORMI&apos;S · v2.0
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
