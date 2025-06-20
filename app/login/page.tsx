import React from "react";
import Link from "next/link";
import { LoginIzquierda } from "../_components";

const Page = () => {
	return (
		<div
			className="flex flex-col justify-center items-center h-screen w-full bg-cover bg-center"
			style={{ backgroundImage: "url('/carlos_paz.png')" }} // o puede ser una URL externa
		>
			<div className="flex">
				{/* Izquierda: información de la posada */}
				<LoginIzquierda includeDescription={true}/>

				{/* Derecha: formulario de login */}
				<div className="flex flex-col  justify-center w-full md:w-1/2 bg-black bg-opacity-80 p-8 text-white">
					<h2 className="text-2xl font-semibold mb-6">Ingresar a tu cuenta</h2>
					<form className="w-full max-w-sm space-y-4">
						<div>
							<label htmlFor="email" className="block text-sm font-medium mb-1">
								Correo electrónico
							</label>
							<input
								type="email"
								id="email"
								className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
								placeholder="usuario@ejemplo.com"
							/>
						</div>
						<div>
							<label htmlFor="password" className="block text-sm font-medium mb-1">
								Contraseña
							</label>
							<input
								type="password"
								id="password"
								className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
								placeholder="********"
							/>
						</div>
						<div className="flex items-center justify-between gap-4 pt-4">
							<Link
								href="/dashboard"
								className="w-1/3 bg-[#43AC6A] hover:bg-[#43AC6A] text-white py-2 px-4 rounded transition duration-200"
							>
								Acceder
							</Link>
							<Link href="/olvidarContrasena">Olvidé mi contraseña</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Page;
