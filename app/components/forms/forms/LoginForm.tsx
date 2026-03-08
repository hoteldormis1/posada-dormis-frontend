"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { loginUser, refreshSession } from "@/lib/store/utils/user/userSlice";
import type { AppDispatch, RootState } from "@/lib/store/store";
import { useToastAlert } from "@/hooks/useToastAlert";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginSchema } from "@/utils/validations/authSchema";

const LoginForm = () => {
	const dispatch: AppDispatch = useAppDispatch();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { successToast, errorToast } = useToastAlert();

	const [email, setEmail] = useState("");
	const [clave, setClave] = useState("");
	const [showPass, setShowPass] = useState(false);
	const [errors, setErrors] = useState<{ email?: string; clave?: string }>({});

	const { loading } = useAppSelector((state: RootState) => state.user);

	const returnTo = searchParams.get("returnTo") || "/admin/calendario";

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
	  
		const result = loginSchema.safeParse({ email, clave });
		
		if (!result.success) {
			const errorMap: { email?: string; clave?: string } = {};
			result.error.issues.forEach((issue) => {
				const field = issue.path[0] as "email" | "clave";
				errorMap[field] = issue.message;
			});
			setErrors(errorMap);
			return;
		}

		setErrors({});
	  
		try {
		  await dispatch(loginUser({ email, clave })).unwrap();
	  
		  await dispatch(refreshSession()).unwrap();
	  
		  successToast("Inicio de sesión exitoso");
		  router.replace(returnTo);
		} catch (err) {
		  const msg = typeof err === "string" ? err : "Error desconocido al iniciar sesión";
		  errorToast(msg);
		} finally {
		}
	  };

	return (
		<form onSubmit={handleSubmit} className="w-full space-y-4">
			<div>
				<label htmlFor="email" className="login-field-label">Correo electrónico</label>
				<input
					id="email"
					name="email"
					type="email"
					placeholder="usuario@ejemplo.com"
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
						if (errors.email) setErrors({ ...errors, email: undefined });
					}}
					className="login-field-input"
				/>
				{errors.email && <p className="text-red-300 text-xs mt-1.5">{errors.email}</p>}
			</div>

			<div>
				<div className="flex items-center justify-between mb-1.5">
					<label htmlFor="password" className="login-field-label !mb-0">Contraseña</label>
					<button
						type="button"
						onClick={() => router.push("/olvidarContrasena")}
						className="cursor-pointer text-[11.5px] text-emerald-300 hover:opacity-80 transition"
					>
						¿Olvidaste tu contraseña?
					</button>
				</div>
				<div className="relative">
					<input
						id="password"
						name="password"
						type={showPass ? "text" : "password"}
						placeholder="••••••••"
						value={clave}
						onChange={(e) => {
							setClave(e.target.value);
							if (errors.clave) setErrors({ ...errors, clave: undefined });
						}}
						className="login-field-input pr-11"
					/>
					<button
						type="button"
						onClick={() => setShowPass((s) => !s)}
						className="absolute inset-y-0 right-3 flex items-center text-white/50 hover:text-white/80"
						aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
					>
						{showPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
					</button>
				</div>
				{errors.clave && <p className="text-red-300 text-xs mt-1.5">{errors.clave}</p>}
			</div>

			<button type="submit" disabled={loading} className="login-cta mt-2">
				{loading ? "Accediendo..." : "Acceder al sistema →"}
			</button>
			<button
				type="button"
				onClick={() => router.push("/")}
				className="cursor-pointer w-full rounded-xl border border-white/18 text-white/80 hover:bg-white/8 py-3 transition font-semibold"
			>
				Hacer una reserva
			</button>
		</form>
	);
};

export default LoginForm;
