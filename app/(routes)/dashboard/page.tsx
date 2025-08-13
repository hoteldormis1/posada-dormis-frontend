"use client";

import React from "react";
import {
	fuenteDeTitulo,
	pantallaPrincipalEstilos,
} from "@/styles/global-styles";
import { FiltroFechas, GraficosContent, HotelEstadisticas } from "@/components";

const Dashboard = () => {

	return (
		<div className={pantallaPrincipalEstilos + " pb-40"}>
			<label className={fuenteDeTitulo}>Dashboards</label>
			<div>
				<FiltroFechas />
				<HotelEstadisticas />
				<GraficosContent />
			</div>
		</div>
	);
};

export default Dashboard;
