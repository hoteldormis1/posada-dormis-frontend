import React from "react";
import {GraficoPie} from "@/components/index";

const GraficoPieEstadoReservas = () => {
	return (
		<div className="w-full max-w-full h-auto">
			<div className="relative w-full max-w-md h-9/10 mx-auto aspect-square">
				<GraficoPie
					labels={["reservado", "check-in", "check-out", "ocupado"]}
					data={[2, 0, 1, 8]}
					title="Estado de habitaciones hoy"
				/>
			</div>
		</div>
	);
};

export default GraficoPieEstadoReservas;
