import Image from "next/image";
import React from "react";
import { inicio } from "../../../../public/public-api";

interface Props {
  includeDescription: boolean;
}

const LoginIzquierda: React.FC<Props> = ({ includeDescription }) => {
	return (
		<div className="flex flex-col justify-center w-full md:w-1/2 bg-[#E9F3F6] bg-opacity-90 p-8">
			<h1 className="text-3xl md:text-4xl font-bold pb-6 font-semibold">
				Posada Dormi’s
			</h1>
			<p className="text-lg font-semibold">¡Bienvenido a la Posada Dormi’s!</p>
			<p className="mb-4 max-w-md font-semibold">
				Ubicada en Mina Clavero, Córdoba, te ofrecemos una estancia inolvidable.
			</p>
			{includeDescription && (
				<ul className="text-sm list-disc list-inside text-left max-w-md space-y-2">
					{/*<li>Reserva rápida y sencilla: Reserva tu habitación al instante.</li>*/}
					<li>Desayuno incluido: Comienza tu día con un delicioso desayuno.</li>
					<li>Servicios exclusivos: Comodidades diseñadas para tu confort.</li>
				</ul>
			)}
			<div className="flex items-center py-6">
				<Image src={inicio} alt="Logo LLA" width={150} height={50} />
			</div>
			<p className="text-xs text-gray-600">
				© 2025. Todos los derechos reservados.
			</p>
		</div>
	);
};

export default LoginIzquierda;
