"use client";

import React, { useState, useEffect } from "react";
import { LoginIzquierda } from "../../components";
import { useToastAlert } from "@/hooks/useToastAlert";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
                const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
                // Codificar el token en la URL
                const response = await fetch(`${baseURL}/auth/password-reset/verify?token=${encodeURIComponent(cleanToken)}`, {
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
            const cleanToken = token?.trim();
            
            if (!cleanToken) {
                errorToast("Token no válido. Por favor solicitá un nuevo enlace.");
                setLoading(false);
                return;
            }

            const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
            const response = await fetch(`${baseURL}/auth/password-reset/reset`, {
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
            <div
                className="flex flex-col justify-center items-center min-h-screen w-full bg-cover bg-center"
                style={{ backgroundImage: "url('/carlos_paz.png')" }}
            >
                <div className="bg-black bg-opacity-80 p-8 rounded-lg">
                    <div className="flex items-center gap-3 text-white">
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Verificando enlace...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div
                className="flex flex-col justify-center items-center min-h-screen w-full bg-cover bg-center"
                style={{ backgroundImage: "url('/carlos_paz.png')" }}
            >
                <div className="flex flex-col w-full md:w-auto md:flex-row px-8">
                    <LoginIzquierda includeDescription={false}/>

                    <div className="flex flex-col justify-center w-full md:w-1/2 bg-black bg-opacity-80 p-8 text-white">
                        <div className="text-center">
                            <div className="mb-4">
                                <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold mb-4">Enlace inválido o expirado</h2>
                            <p className="text-gray-300 mb-6">
                                El enlace de restablecimiento no es válido o ha expirado. 
                                Por favor solicitá un nuevo enlace.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => router.push("/olvidarContrasena")}
                                    className="w-full bg-[#43AC6A] hover:bg-[#389357] text-white py-2.5 px-4 rounded-lg transition-all duration-200 font-medium"
                                >
                                    Solicitar nuevo enlace
                                </button>
                                <button
                                    onClick={() => router.push("/login")}
                                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg transition-all duration-200 font-medium"
                                >
                                    Volver al inicio de sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col justify-center items-center min-h-screen w-full bg-cover bg-center"
            style={{ backgroundImage: "url('/carlos_paz.png')" }}
        >
            <div className="flex flex-col w-full md:w-auto md:flex-row px-8">
                <LoginIzquierda includeDescription={false}/>

                <div className="flex flex-col justify-center w-full md:w-1/2 bg-black bg-opacity-80 p-8 text-white">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-2">Restablecer contraseña</h2>
                        {userInfo && (
                            <p className="text-sm text-gray-300">
                                Hola {userInfo.nombre}, ingresá tu nueva contraseña.
                            </p>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                Nueva contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#43AC6A] transition-all"
                                    placeholder="Mínimo 6 caracteres"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                                >
                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                Confirmar contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#43AC6A] transition-all"
                                    placeholder="Repetí tu contraseña"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                                >
                                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                            </div>
                        </div>

                        {password && password.length < 6 && (
                            <p className="text-yellow-400 text-sm">
                                La contraseña debe tener al menos 6 caracteres
                            </p>
                        )}

                        {password && confirmPassword && password !== confirmPassword && (
                            <p className="text-red-400 text-sm">
                                Las contraseñas no coinciden
                            </p>
                        )}

                        <div className="flex flex-col gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading || !password || !confirmPassword || password !== confirmPassword || password.length < 6}
                                className={`w-full bg-[#43AC6A] hover:bg-[#389357] text-white py-2.5 px-4 rounded-lg transition-all duration-200 font-medium ${
                                    loading || !password || !confirmPassword || password !== confirmPassword || password.length < 6
                                        ? 'opacity-60 cursor-not-allowed' 
                                        : 'hover:shadow-lg transform hover:-translate-y-0.5'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Restableciendo...
                                    </span>
                                ) : (
                                    'Restablecer contraseña'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push("/login")}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg transition-all duration-200 font-medium"
                            >
                                Volver al inicio de sesión
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;

