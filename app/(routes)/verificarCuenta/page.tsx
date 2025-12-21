"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/store/axiosConfig";
import { InputForm, LoginIzquierda } from "@/components"; // mismo que en tu login
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
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        Cargando…
      </div>
    );
  }

  if (ok === false) {
    return (
      <div
        className="flex flex-col justify-center items-center min-h-screen w-full bg-cover bg-center"
        style={{ backgroundImage: "url('/carlos_paz.png')" }}
      >
        <div className="flex flex-col w-full md:w-auto md:flex-row px-8">
          <LoginIzquierda includeDescription={true} />
          <div className="flex flex-col justify-center w-full md:w-1/2 bg-black bg-opacity-80text-white">
            <h2 className="text-2xl font-semibold mb-4">Enlace inválido o vencido</h2>
            <p className="text-sm text-gray-300">
              Pedí un nuevo correo de verificación al administrador o volvé a iniciar sesión.
            </p>
            <div className="pt-6">
              <a
                href="/login"
                className="inline-block bg-[#43AC6A] hover:bg-[#369658] text-white py-2 px-4 rounded transition"
              >
                Ir a Iniciar sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // OK === true → Formulario con el mismo estilo del login:
  return (
    <div
      className="flex flex-col justify-center items-center min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/carlos_paz.png')" }}
    >
      <div className="flex flex-col w-full md:w-auto md:flex-row px-8">
        <LoginIzquierda includeDescription={true} />

        <div className="flex flex-col justify-center w-full md:w-1/2 bg-black bg-opacity-80 p-8 text-white">
          <h2 className="text-2xl font-semibold mb-6">Validá tu cuenta</h2>

          <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
            <InputForm
              inputKey="password"
              InputForm="password"
              placeholder="Nueva contraseña (mín. 8 caracteres)"
              value={pass1}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPass1(e.target.value)}
              required
            >
              Contraseña
            </InputForm>

            <InputForm
              inputKey="passwordConfirm"
              InputForm="password"
              placeholder="Repetí tu contraseña"
              value={pass2}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPass2(e.target.value)}
              required
            >
              Confirmar contraseña
            </InputForm>

            <div className="flex items-center justify-between gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`w-1/2 text-center text-white py-2 px-4 rounded transition duration-200 ${
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#43AC6A] hover:bg-[#369658]"
                }`}
              >
                {submitting ? "Confirmando..." : "Confirmar"}
              </button>

              <a href="/login" className="text-sm underline">
                Ir al login
              </a>
            </div>
          </form>

          {/* Leyenda opcional */}
          <p className="text-xs text-gray-300 mt-4">
            El enlace de verificación es válido por tiempo limitado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;
