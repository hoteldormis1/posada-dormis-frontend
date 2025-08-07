"use client";

import React, { useEffect, useMemo } from "react";
import { pantallaPrincipalEstilos } from "../../styles/global-styles";
import { LoadingSpinner, TableComponent } from "@/components";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchReservas } from "@/lib/store/utils/reservas/reservasSlice";
import { useToastAlert } from "@/hooks/useToastAlert";
import { Reserva, StateStatus } from "@/models/types";

const Reservas: React.FC = () => {
	const dispatch = useAppDispatch<AppDispatch>();
	const { reservas, status } = useAppSelector(
		(state: RootState) => state.reservas
	);
	const { errorToast } = useToastAlert();

	// Fetch de reservas al iniciar
	useEffect(() => {
		if (status === StateStatus.idle) {
			dispatch(fetchReservas()).then((action) => {
				if (fetchReservas.rejected.match(action)) {
					errorToast(action.payload || "Error al obtener reservas");
				}
			});
		}
	}, [dispatch, status, errorToast]);

	// Columnas de la tabla
	const columns = useMemo(
		() => [
			{ header: "Habitación", key: "numeroHab" },
			{ header: "Fecha de ingreso", key: "ingreso" },
			{ header: "Fecha de salida", key: "egreso" },
			{ header: "Huésped", key: "huespedNombre" },
			{ header: "Teléfono", key: "telefonoHuesped" },
			{ header: "Monto pagado", key: "montoPagado" },
			{ header: "Total", key: "total" },
			{ header: "Estado", key: "estadoDeReserva" },
		],
		[]
	);

	// Datos para la tabla
	const data = useMemo(() => reservas, [reservas]);

	return (
		<div className={pantallaPrincipalEstilos}>
			<div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
				{(() => {
					if (status === StateStatus.loading) {
						return <LoadingSpinner />;
					}

					if (status === StateStatus.failed) {
						return (
							<p className="text-center mt-10 text-red-600">
								Ocurrió un error al cargar las reservas.
							</p>
						);
					}

					if (data.length === 0) {
						return (
							<p className="text-center mt-10 text-gray-500">
								No hay reservas registradas.
							</p>
						);
					}

					return (
						<TableComponent<Reserva>
							title="Reservas"
							columns={columns}
							data={data}
							showFormActions={false}
						/>
					);
				})()}
			</div>
		</div>
	);
};

export default Reservas;
