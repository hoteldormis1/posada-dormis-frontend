"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { loginUser, refreshSession } from "@/lib/store/utils/user/userSlice";
import type { AppDispatch, RootState } from "@/lib/store/store";
import { useToastAlert } from "@/hooks/useToastAlert";
import { setAuthToken } from "@/lib/store/useAuthToken";
import InputForm from "../formComponents/InputForm";
import { loginSchema } from "@/utils/validations/authSchema";

const LoginForm = () => {
	const dispatch: AppDispatch = useAppDispatch();
	const router = useRouter();
	const searchParams = useSearchParams();
	const { successToast, errorToast } = useToastAlert();

	const [email, setEmail] = useState("");
	const [clave, setClave] = useState("");
	const [errors, setErrors] = useState<{ email?: string; clave?: string }>({});
	const [submitting, setSubmitting] = useState(false);

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
		  setSubmitting(true);
		  await dispatch(loginUser({ email, clave })).unwrap();
	  
		  await dispatch(refreshSession()).unwrap();
	  
		  successToast("Inicio de sesión exitoso");
		  router.replace(returnTo);
		} catch (err) {
		  const msg = typeof err === "string" ? err : "Error desconocido al iniciar sesión";
		  errorToast(msg);
		} finally {
		  setSubmitting(false);
		}
	  };

	return (
		<form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 ">
			<InputForm
				inputKey="email"
				InputForm="email"
				placeholder="usuario@ejemplo.com"
				value={email}
				onChange={(e) => {
					setEmail(e.target.value);
					if (errors.email) setErrors({ ...errors, email: undefined });
				}}
				error={errors.email}
			>
				Correo electrónico
			</InputForm>

			<InputForm
				inputKey="password"
				InputForm="password"
				placeholder="********"
				value={clave}
				onChange={(e) => {
					setClave(e.target.value);
					if (errors.clave) setErrors({ ...errors, clave: undefined });
				}}
				error={errors.clave}
			>
				Contraseña
			</InputForm>

			<div className="flex items-center justify-between gap-4 pt-4">
				<button
					type="submit"
					disabled={loading}
					className={`w-1/3 text-center text-white py-2 px-4 rounded transition duration-200 ${
						loading
							? "bg-gray-400 cursor-not-allowed"
							: "bg-[#43AC6A] hover:bg-[#369658]"
					}`}
				>
					{loading ? "Accediendo..." : "Acceder"}
				</button>

				<button
					type="button"
					onClick={() => router.push("/olvidarContrasena")}
					className="text-sm underline hover:text-gray-300 transition-colors"
				>
					Olvidé mi contraseña
				</button>
			</div>
		</form>
	);
};

export default LoginForm;
