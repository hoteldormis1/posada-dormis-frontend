"use client";

import React, { useEffect, useMemo } from "react";
import {
	pantallaPrincipalEstilos,
	fuenteDeTitulo,
} from "@/styles/global-styles";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import { TableComponent } from "@/components";
import { fetchAuditorias } from "@/lib/store/utils/auditorias/auditoriasSlice";

const Auditorias = () => {
	const dispatch = useAppDispatch<AppDispatch>();
	const { lista, loading, error } = useAppSelector(
		(state: RootState) => state.auditorias
	);

	const { accessToken } = useAppSelector((state: RootState) => state.user);
	
	useEffect(() => {
		if (accessToken && lista.length === 0 && !loading) {
			dispatch(fetchAuditorias());
		}
	}, [accessToken, dispatch]);

	const columns = useMemo(
		() => [
			{ header: "Método", key: "metodo" },
			{ header: "Ruta", key: "ruta" },
			{ header: "Acción", key: "accion" },
			{ header: "Usuario", key: "emailUsuario" },
			{ header: "Status", key: "status" },
			{ header: "Fecha", key: "fecha" },
		],
		[]
	);

	const data = useMemo(
		() =>
			lista.map((a) => ({
				id: String(a.id),
				metodo: a.metodo,
				ruta: a.ruta,
				accion: a.accion,
				emailUsuario: a.emailUsuario ?? "—",
				status: a.status ?? "—",
				fecha: new Date(a.fecha).toLocaleString("es-AR"),
			})),
		[lista]
	);

	return (
		<div>
			<div className={pantallaPrincipalEstilos}>
			<label className={fuenteDeTitulo}>Auditorías</label>
			<div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
				{loading ? (
					<p className="text-center mt-10">Cargando auditorías...</p>
				) : error ? (
					<p className="text-red-500 text-center mt-10">{error}</p>
				) : data.length === 0 ? (
					<p className="text-center mt-10">No hay auditorías registradas</p>
				) : (
					<TableComponent columns={columns} data={data} showFormActions={false} />
				)}
			</div>
		</div>
		</div>
	);
};

export default Auditorias;
