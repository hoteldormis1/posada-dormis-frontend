"use client";

import React from "react";
import { LoginForm, LoginIzquierda } from "../../components";

const Login: React.FC = () => {
	return (
		<div
			className="flex flex-col justify-center items-center min-h-screen w-full bg-cover bg-center"
			style={{ backgroundImage: "url('/carlos_paz.png')" }}
		>
			<div className="flex flex-col w-full md:w-auto md:flex-row px-8">
				<LoginIzquierda includeDescription={true} />

				<div className="flex flex-col justify-center w-full md:w-1/2 bg-black bg-opacity-80 p-8 text-white">
					<h2 className="text-2xl font-semibold mb-6">Ingresar a tu cuenta</h2>
					<LoginForm />
				</div>
			</div>
		</div>
	);
};

export default Login;
