import React from "react";
import {GraficoPie} from "@/components/index";
import { getEstadoReservaChartColor, getEstadoReservaLabel } from "@/utils/helpers/reservaEstado";

const GraficoPieEstadoReservas = () => {
  const estados = ["pendiente", "checkin", "checkout", "confirmada"];

	return (
		<div className="w-full max-w-full h-auto">
			<div className="relative w-full max-w-md h-9/10 mx-auto aspect-square">
				<GraficoPie
					labels={estados.map((estado) => getEstadoReservaLabel(estado))}
					data={[2, 0, 1, 8]}
					title="Estado de habitaciones hoy"
          backgroundColors={estados.map((estado) => getEstadoReservaChartColor(estado, 0.7))}
				/>
			</div>
		</div>
	);
};

export default GraficoPieEstadoReservas;
