"use client"

import React from "react";
import {
	fuenteDeTitulo,
	pantallaPrincipalEstilos,
} from "../../styles/global-styles";
import { FiltroFechas, GraficosContent, HotelEstadisticas } from "@/components";
import { fetchUsuarios } from "@/lib/store/utils/user/userSlice";

const Dashboard = () => {


	React.useEffect(() => {
		const fetchUsuariosTest = async () => {
			try {
				const data = await fetchUsuarios();
				console.log("Prueba de carga de usuarios post login en dashboard:", data);
			} catch (err) {
				console.error("Error al obtener usuarios:", err);
			}
		};
		fetchUsuariosTest();
	}, []);

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
