import React from "react";
import { HiUserGroup } from "react-icons/hi";
import { MdArticle, MdFreeCancellation, MdLocalAtm } from "react-icons/md";

const estadisticas = [
	{ titulo: "Reservas", valor: "123", icon: <MdArticle size={24} className="text-main" /> },
	{ titulo: "Ventas", valor: "$45.000", icon: <MdLocalAtm size={24} className="text-main" /> },
	{ titulo: "Tasa de ocupación", valor: "78%", icon: <HiUserGroup  size={24} className="text-main" /> },
	{ titulo: "Reservas canceladas", valor: "5", icon: <MdFreeCancellation size={24} className="text-main" /> },
];

const HotelEstadisticas = () => {
	return (
		<div className="pt-8 w-full">
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 w-full rounded-xl p-6 border-1 border-gray-400 shadow-md">
				{estadisticas.map((item, index) => (
					<div
						key={index}
						className="bg-tertiary flex gap-8 items-center justify-center px-2 py-4 rounded-xl"
					>
						{item.icon}
						<div className="flex flex-col items-center justify-center">
							<span className="flex gap-4 items-center text-sm font-semibold text-gray-700">
								{item.titulo}
							</span>
							<span className="text-md font-bold text-primary mt-1">{item.valor}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default HotelEstadisticas;
