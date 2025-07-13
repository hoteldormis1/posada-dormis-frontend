'use client'

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { LoginIzquierda } from "../../components"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { loginUser } from "@/lib/store/utils/user/userSlice"
import type { AppDispatch, RootState } from "@/lib/store/store"

const Login: React.FC = () => {
  const dispatch: AppDispatch = useAppDispatch()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [clave, setClave] = useState("")
  const [error, setError] = useState("")

  const { loading } = useAppSelector((state: RootState) => state.user)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await dispatch(loginUser({ email, clave })).unwrap()
      router.push("/dashboard")
    } catch (err) {
      if (typeof err === 'string') {
        setError(err)
      } else {
        setError("Error desconocido al iniciar sesión")
      }
    }
  }

  return (
    <div
      className="flex flex-col justify-center items-center min-h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/carlos_paz.png')" }}
    >
      <div className="flex flex-col w-full md:w-auto md:flex-row px-8">
        <LoginIzquierda includeDescription={true} />

        <div className="flex flex-col justify-center w-full md:w-1/2 bg-black bg-opacity-80 p-8 text-white">
          <h2 className="text-2xl font-semibold mb-6">Ingresar a tu cuenta</h2>
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
                placeholder="********"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex items-center justify-between gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-1/3 text-center bg-[#43AC6A] hover:bg-[#369658] text-white py-2 px-4 rounded transition duration-200"
              >
                {loading ? "Accediendo..." : "Acceder"}
              </button>
              <a href="/olvidarContrasena" className="text-sm underline">
                Olvidé mi contraseña
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
