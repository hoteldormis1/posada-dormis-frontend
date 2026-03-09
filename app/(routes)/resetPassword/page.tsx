"use client";

import React, { useState, useEffect } from "react";
import { useToastAlert } from "@/hooks/useToastAlert";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash, FaLock, FaExclamationTriangle } from "react-icons/fa";


const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [userInfo, setUserInfo] = useState<{ email: string; nombre: string } | null>(null);
    
    const { successToast, errorToast } = useToastAlert();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        // Verificar el token cuando se carga la página
        const verifyToken = async () => {
            if (!token || token.trim() === '') {
                errorToast("Token no proporcionado");
                setVerifying(false);
                setTokenValid(false);
                return;
            }

            try {
                // Limpiar el token de espacios en blanco
                const cleanToken = token.trim();
                const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

                // Codificar el token en la URL
                const response = await fetch(`${apiUrl}/auth/password-reset/verify?token=${encodeURIComponent(cleanToken)}`, {
                    method: 'GET',
                    credentials: 'include',
                });

                const data = await response.json();
                
                if (data.valid) {
                    setTokenValid(true);
                    setUserInfo({ email: data.email, nombre: data.nombre });
                } else {
                    errorToast(data.message || "El enlace no es válido o ha expirado");
                    setTokenValid(false);
                }
            } catch (error: any) {
                console.error("Error al verificar token:", error);
                errorToast("Error al verificar el enlace. Por favor intentá nuevamente.");
                setTokenValid(false);
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones
        if (!password.trim() || !confirmPassword.trim()) {
            errorToast("Por favor completá todos los campos");
            return;
        }

        if (password.length < 6) {
            errorToast("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (password !== confirmPassword) {
            errorToast("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);

        try {
            // Limpiar el token de espacios en blanco
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const cleanToken = token?.trim();
            
            
            if (!cleanToken) {
                errorToast("Token no válido. Por favor solicitá un nuevo enlace.");
                setLoading(false);
                return;
            }

            const response = await fetch(`${apiUrl}/auth/password-reset/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ token: cleanToken, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al restablecer la contraseña');
            }

            successToast(data.message || "Contraseña restablecida exitosamente");
            
            // Limpiar campos
            setPassword("");
            setConfirmPassword("");
            
            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                router.push("/login");
            }, 2000);

        } catch (error: any) {
            console.error("Error al restablecer contraseña:", error);
            const message = error.message || "Error al restablecer la contraseña. Intentá nuevamente.";
            errorToast(message);
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
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
                                Restablecer acceso
                            </p>
                            <h1 className="text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight max-w-[520px]">
                                Estamos validando <br />
                                tu <span className="italic text-emerald-300">enlace</span>
                            </h1>
                            <p className="mt-6 text-white/70 max-w-[420px] text-[15px] md:text-[17px] leading-7">
                                Verificamos que tu solicitud sea segura antes de mostrar el formulario.
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-white/60">© 2026 Posada Dormi&apos;s</p>
                </section>

                <section className="login-right">
                    <div className="w-full max-w-[360px]">
                        <h2 className="login-panel-title md:text-[2rem]">Verificando enlace</h2>
                        <p className="login-panel-subtitle mb-8">
                            Esto tarda solo unos segundos
                        </p>
                        <div className="flex items-center gap-3 text-white/80 rounded-xl border border-white/12 bg-white/6 px-4 py-3">
                            <svg className="animate-spin h-5 w-5 text-emerald-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm">Verificando enlace...</span>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    if (!tokenValid) {
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
                                Restablecer acceso
                            </p>
                            <h1 className="text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight max-w-[520px]">
                                El enlace ya no <br />
                                es <span className="italic text-emerald-300">válido</span>
                            </h1>
                            <p className="mt-6 text-white/70 max-w-[420px] text-[15px] md:text-[17px] leading-7">
                                Podés generar uno nuevo y continuar con el proceso de forma segura.
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-white/60">© 2026 Posada Dormi&apos;s</p>
                </section>

                <section className="login-right">
                    <div className="w-full max-w-[360px]">
                        <h2 className="login-panel-title md:text-[2rem]">Enlace inválido o expirado</h2>
                        <p className="login-panel-subtitle mb-8">
                            Solicitá uno nuevo para continuar
                        </p>
                        <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 mb-5 text-red-200 text-sm leading-6">
                            <FaExclamationTriangle className="inline mr-2 mb-0.5" />
                            El enlace de restablecimiento no es válido o ya venció.
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => router.push("/olvidarContrasena")}
                                className="login-cta"
                            >
                                Solicitar nuevo enlace
                            </button>
                            <button
                                onClick={() => router.push("/login")}
                                className="w-full rounded-xl border border-white/20 text-white/85 hover:bg-white/8 py-3 transition"
                            >
                                Volver al inicio de sesión
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

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
                            Restablecer acceso
                        </p>
                        <h1 className="text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight max-w-[520px]">
                            Elegí tu nueva <br />
                            <span className="italic text-emerald-300">contraseña</span>
                        </h1>
                        <p className="mt-6 text-white/70 max-w-[420px] text-[15px] md:text-[17px] leading-7">
                            Completá el formulario para recuperar el acceso a tu cuenta.
                        </p>
                    </div>
                </div>
                <p className="text-xs text-white/60">© 2026 Posada Dormi&apos;s</p>
            </section>

            <section className="login-right">
                <div className="w-full max-w-[360px]">
                    <h2 className="login-panel-title md:text-[2rem]">Restablecer contraseña</h2>
                    {userInfo && (
                        <p className="login-panel-subtitle mb-8">
                            Hola {userInfo.nombre}, ingresá tu nueva contraseña.
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="login-field-label">Nueva contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="login-field-input pr-10"
                                    placeholder="Mínimo 6 caracteres"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/75 cursor-pointer"
                                >
                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="login-field-label">Confirmar contraseña</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="login-field-input pr-10"
                                    placeholder="Repetí tu contraseña"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/75 cursor-pointer"
                                >
                                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                            </div>
                        </div>

                        {password && password.length < 6 && (
                            <p className="text-amber-300 text-xs">
                                La contraseña debe tener al menos 6 caracteres
                            </p>
                        )}

                        {password && confirmPassword && password !== confirmPassword && (
                            <p className="text-red-300 text-xs">
                                Las contraseñas no coinciden
                            </p>
                        )}

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading || !password || !confirmPassword || password !== confirmPassword || password.length < 6}
                                className="login-cta disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-[#0a2318]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Restableciendo...
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center justify-center gap-2">
                                        <FaLock size={14} />
                                        Restablecer contraseña
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push("/login")}
                                className="cursor-pointer w-full rounded-xl border border-white/20 text-white/85 hover:bg-white/8 py-3 transition"
                            >
                                Volver al inicio de sesión
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <span className="h-px flex-1 bg-white/10" />
                        <span className="text-[11px] text-white/60">Sistema interno</span>
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

export default ResetPassword;

