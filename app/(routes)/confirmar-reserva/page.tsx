"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaBed } from "react-icons/fa";

type Estado = "cargando" | "confirmando" | "confirmado" | "cancelando" | "cancelado" | "error" | "expirado";

export default function ConfirmarReservaPage() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const accion = params.get("accion") ?? "confirmar";

  const [estado, setEstado] = useState<Estado>("cargando");
  const [mensaje, setMensaje] = useState("");
  const processedKeyRef = useRef<string>("");

  useEffect(() => {
    const runKey = `${accion}::${token}`;
    if (processedKeyRef.current === runKey) return;
    processedKeyRef.current = runKey;

    if (!token) {
      setEstado("error");
      setMensaje("El enlace no es válido. Falta el token de confirmación.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (accion === "confirmar") {
      setEstado("confirmando");
      fetch(`${apiUrl}/public/reservas/confirmar?token=${encodeURIComponent(token)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setEstado("confirmado");
          } else if (data.code === "TOKEN_EXPIRED") {
            setEstado("expirado");
          } else if (data.code === "ROOM_UNAVAILABLE") {
            setEstado("error");
            setMensaje(data.error ?? "La habitación ya no está disponible.");
          } else {
            setEstado("error");
            setMensaje(data.error ?? "Ocurrió un error al confirmar la reserva.");
          }
        })
        .catch(() => {
          setEstado("error");
          setMensaje("No se pudo conectar con el servidor. Intentá de nuevo.");
        });
    } else {
      setEstado("cancelando");
      fetch(`${apiUrl}/public/reservas/cancelar-pendiente?token=${encodeURIComponent(token)}`)
        .then((r) => r.json())
        .then(() => setEstado("cancelado"))
        .catch(() => {
          // Incluso si falla, mostramos cancelado (el token igual expiró)
          setEstado("cancelado");
        });
    }
  }, [token, accion]);

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#0a2318_0%,#0d3320_40%,#1a4a2e_70%,#0f2d1e_100%)] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/20 px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl border border-emerald-400/30 bg-emerald-400/15 flex items-center justify-center">
          <FaBed className="text-emerald-300 text-lg" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">Posada Dormi&apos;s</p>
          <p className="text-[11px] text-white/45">Mina Clavero · Córdoba</p>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white/6 border border-white/15 rounded-2xl p-8 md:p-10 text-center backdrop-blur-md shadow-xl">

            {/* Cargando / procesando */}
            {(estado === "cargando" || estado === "confirmando" || estado === "cancelando") && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-white/8 border border-white/12 flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <svg className="w-8 h-8 text-white/40 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {estado === "cancelando" ? "Cancelando solicitud…" : "Procesando…"}
                </h2>
                <p className="text-sm text-white/45">Por favor esperá un momento.</p>
              </>
            )}

            {/* Confirmado */}
            {estado === "confirmado" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-9 h-9 text-emerald-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">¡Reserva enviada!</h2>
                <p className="text-sm text-white/60 mb-6 leading-relaxed">
                  Tu solicitud fue registrada correctamente en estado{" "}
                  <strong className="text-emerald-300">PENDIENTE</strong>. La posada la revisará y te avisará por email cuando sea confirmada.
                </p>
                <div className="bg-emerald-400/8 border border-emerald-400/20 rounded-xl p-4 mb-6 text-left space-y-2">
                  <h3 className="text-sm font-semibold text-white mb-2">¿Qué sigue?</h3>
                  {[
                    "La posada revisará tu solicitud",
                    "Recibirás un email cuando sea confirmada",
                    "Te contactarán con las instrucciones de pago",
                  ].map((paso, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="text-emerald-400 font-bold mt-0.5">{i + 1}.</span>
                      <span>{paso}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/"
                  className="block w-full bg-emerald-400/15 hover:bg-emerald-400/25 border border-emerald-400/30 text-emerald-300 font-semibold py-3 px-6 rounded-xl transition-all text-center text-sm"
                >
                  Volver al inicio
                </Link>
              </>
            )}

            {/* Cancelado */}
            {estado === "cancelado" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-white/6 border border-white/12 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Solicitud cancelada</h2>
                <p className="text-sm text-white/50 mb-6 leading-relaxed">
                  La solicitud de reserva fue descartada. No se registró ningún dato en el sistema.
                </p>
                <Link
                  href="/"
                  className="block w-full bg-white/8 hover:bg-white/12 border border-white/15 text-white/70 font-semibold py-3 px-6 rounded-xl transition-all text-center text-sm"
                >
                  Volver al inicio
                </Link>
              </>
            )}

            {/* Token expirado */}
            {estado === "expirado" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">El enlace expiró</h2>
                <p className="text-sm text-white/50 mb-6 leading-relaxed">
                  Los enlaces de confirmación tienen una validez de 2 horas. Podés volver a solicitar la reserva desde el inicio.
                </p>
                <Link
                  href="/"
                  className="block w-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 font-semibold py-3 px-6 rounded-xl transition-all text-center text-sm"
                >
                  Solicitar nueva reserva
                </Link>
              </>
            )}

            {/* Error genérico */}
            {estado === "error" && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-red-400/10 border border-red-400/25 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-red-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Ocurrió un problema</h2>
                <p className="text-sm text-white/50 mb-6 leading-relaxed">{mensaje}</p>
                <Link
                  href="/"
                  className="block w-full bg-red-400/10 hover:bg-red-400/18 border border-red-400/25 text-red-300 font-semibold py-3 px-6 rounded-xl transition-all text-center text-sm"
                >
                  Volver al inicio
                </Link>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
