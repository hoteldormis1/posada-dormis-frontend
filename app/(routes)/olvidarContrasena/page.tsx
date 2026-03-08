"use client";

import React, { useState } from "react";
import { useToastAlert } from "@/hooks/useToastAlert";
import { useRouter } from "next/navigation";
import { recuperarPasswordSchema } from "@/utils/validations/authSchema";

const OlvidarContrasena = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const { successToast, errorToast } = useToastAlert();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar con Zod
        const result = recuperarPasswordSchema.safeParse({ email });
        
        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }

        setError(undefined);
        setLoading(true);

        try {
            const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
            
            const response = await fetch(`${baseURL}/auth/password-reset/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email: email.toLowerCase().trim() })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar el email');
            }
            
            successToast(data.message || "Si el email existe, recibirás instrucciones para restablecer tu contraseña");
            
            // Limpiar el formulario
            setEmail("");
            
            // Redirigir al login después de 3 segundos
            setTimeout(() => {
                router.push("/login");
            }, 3000);

        } catch (error: any) {
            const message = error.message || "Error al enviar el email. Intentá nuevamente.";
            errorToast(message);
        } finally {
            setLoading(false);
        }
    };

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
                        <p className="text-sm md:text-base font-semibold text-emerald-300 tracking-[0.16em] uppercase mb-6">
                            Recuperar acceso
                        </p>
                        <h1 className="text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight max-w-[520px]">
                            Volvé a entrar <br />
                            de forma <span className="italic text-emerald-300">segura</span>
                        </h1>
                        <p className="mt-6 text-white/70 max-w-[420px] text-[15px] md:text-[17px] leading-7">
                            Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                    </div>
                </div>
                <p className="text-xs text-white/30">© 2025 Posada Dormi&apos;s</p>
            </section>

            <section className="login-right">
                <div className="w-full max-w-[360px]">
                    <h2 className="login-panel-title md:text-[2rem]">¿Olvidaste tu contraseña?</h2>
                    <p className="login-panel-subtitle mb-8">
                        Te enviaremos un enlace para restablecerla
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="login-field-label">Correo electrónico</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="usuario@ejemplo.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError(undefined);
                                }}
                                disabled={loading}
                                required
                                className="login-field-input"
                            />
                            {error && <p className="text-red-300 text-xs mt-1.5">{error}</p>}
                        </div>

                        <button type="submit" disabled={loading} className="login-cta">
                            {loading ? "Enviando..." : "Enviar enlace →"}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push("/login")}
                            className="w-full rounded-xl border border-white/20 text-white/85 hover:bg-white/8 py-3 transition"
                        >
                            Volver al login
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <span className="h-px flex-1 bg-white/10" />
                        <span className="text-[11px] text-white/30">Sistema interno</span>
                        <span className="h-px flex-1 bg-white/10" />
                    </div>
                    <p className="text-center text-[11px] text-white/20 tracking-wide">
                        POSADA DORMI&apos;S
                    </p>
                </div>
            </section>
        </div>
    );
};

export default OlvidarContrasena;
