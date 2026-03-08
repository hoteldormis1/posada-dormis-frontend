"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/store/axiosConfig";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useToastAlert } from "@/hooks/useToastAlert";

const VerifyPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { successToast, errorToast } = useToastAlert();
  const guard = useRef(false);

  const [code, setCode] = useState("");
  const [ok, setOk] = useState<boolean | null>(null);
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const c = searchParams.get("code") || "";
    setCode(c);
    if (c && !guard.current) {
      guard.current = true;
      api
        .get("/auth/verify", { params: { code: c }, withCredentials: true })
        .then(({ data }) => setOk(Boolean(data?.valid)))
        .catch(() => setOk(false));
    }
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pass1 || !pass2) {
      errorToast("Completá ambas contraseñas.");
      return;
    }
    if (pass1.length < 8) {
      errorToast("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (pass1 !== pass2) {
      errorToast("Las contraseñas no coinciden.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(
        "/auth/verify",
        { code, password: pass1 },
        { withCredentials: true }
      );
      successToast("Cuenta verificada. Ya podés iniciar sesión.");
      router.replace("/login");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo verificar la cuenta.";
      errorToast(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // Estados de carga / token inválido
  if (ok === null) {
    return (
      <div className="login-screen flex items-center justify-center text-white">
        <div className="text-white/70 text-sm">Cargando…</div>
      </div>
    );
  }

  if (ok === false) {
    return (
      <div className="login-screen">
        <section className="login-left">
          <div>
            <p className="text-sm font-semibold text-emerald-300 tracking-[0.16em] uppercase mb-6">
              Activación de cuenta
            </p>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight max-w-[520px]">
              Tu acceso, <br />
              en segundos <span className="italic text-emerald-300">y seguro</span>
            </h1>
          </div>
        </section>
        <section className="login-right">
          <div className="w-full max-w-[360px]">
            <h2 className="login-panel-title">Enlace inválido o vencido</h2>
            <p className="login-panel-subtitle">
              Pedí un nuevo correo de verificación al administrador o volvé a iniciar sesión.
            </p>
            <a href="/login" className="login-cta inline-block text-center mt-7">
              Ir a iniciar sesión
            </a>
          </div>
        </section>
      </div>
    );
  }

  // OK === true
  return (
    <div className="login-screen">
      <section className="login-left">
        <div>
          <p className="text-sm font-semibold text-emerald-300 tracking-[0.16em] uppercase mb-6">
            Creá tu acceso
          </p>
          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight max-w-[520px]">
            Configurá tu <br />
            contraseña <span className="italic text-emerald-300">una vez</span>
          </h1>
          <p className="mt-6 text-white/70 max-w-[420px] text-[15px] leading-7">
            Este paso activa tu cuenta para ingresar al sistema interno.
          </p>
        </div>
      </section>

      <section className="login-right">
        <div className="w-full max-w-[360px]">
          <h2 className="login-panel-title">Crear sesión</h2>
          <p className="login-panel-subtitle mb-8">
            Definí tu contraseña para finalizar la activación
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="login-field-label">Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  type={show1 ? "text" : "password"}
                  placeholder="Nueva contraseña (mín. 8 caracteres)"
                  value={pass1}
                  onChange={(e) => setPass1(e.target.value)}
                  className="login-field-input pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow1((s) => !s)}
                  className="absolute inset-y-0 right-3 flex items-center text-white/50 hover:text-white/80"
                >
                  {show1 ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="login-field-label">Confirmar contraseña</label>
              <div className="relative">
                <input
                  id="passwordConfirm"
                  type={show2 ? "text" : "password"}
                  placeholder="Repetí tu contraseña"
                  value={pass2}
                  onChange={(e) => setPass2(e.target.value)}
                  className="login-field-input pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow2((s) => !s)}
                  className="absolute inset-y-0 right-3 flex items-center text-white/50 hover:text-white/80"
                >
                  {show2 ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="login-cta mt-2">
              {submitting ? "Confirmando..." : "Confirmar y activar →"}
            </button>
          </form>

          <p className="text-xs text-white/45 mt-4">
            El enlace de verificación es válido por tiempo limitado.
          </p>
        </div>
      </section>
    </div>
  );
};

export default VerifyPage;
