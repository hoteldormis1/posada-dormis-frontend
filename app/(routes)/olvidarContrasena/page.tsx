"use client";

import React, { useState } from "react";
import { LoginIzquierda, InputForm } from "../../components";
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
            const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
            
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
        <div
            className="flex flex-col justify-center items-center min-h-screen w-full bg-cover bg-center"
            style={{ backgroundImage: "url('/carlos_paz.png')" }}
        >
            <div className="flex flex-col w-full md:w-auto md:flex-row px-8">
                <LoginIzquierda includeDescription={false}/>

                <div className="flex flex-col justify-center w-full md:w-1/2 bg-black bg-opacity-80 p-8 text-white">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold mb-2">¿Olvidaste tu contraseña?</h2>
                        <p className="text-sm text-gray-300">
                            Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                        <InputForm
                            inputKey="email"
                            InputForm="email"
                            placeholder="usuario@ejemplo.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError(undefined);
                            }}
                            error={error}
                            disabled={loading}
                            required
                        >
                            Email
                        </InputForm>

                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-[#43AC6A] hover:bg-[#389357] text-white py-2.5 px-4 rounded-lg transition-all duration-200 font-medium ${
                                    loading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg transform hover:-translate-y-0.5'
                                }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Enviando...
                                    </span>
                                ) : (
                                    'Enviar'
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push("/login")}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg transition-all duration-200 font-medium"
                            >
                                Volver
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OlvidarContrasena;
