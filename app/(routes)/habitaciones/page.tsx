"use client";

import React, { useEffect, useMemo } from "react";
import {
	pantallaPrincipalEstilos,
} from "../../styles/global-styles";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { LoadingSpinner, TableComponent } from "@/components";
import { useToastAlert } from "@/utils/hooks/useToastAlert";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchHabitaciones } from "@/lib/store/utils/habitaciones/habitacionesSlice";

const Habitaciones = () => {
	const dispatch = useAppDispatch<AppDispatch>();
	const { habitaciones, status } = useAppSelector((state: RootState) => state.habitaciones);
	const { errorToast } = useToastAlert();

	useEffect(() => {
		if (status === "idle") {
			dispatch(fetchHabitaciones()).then((action) => {
				if (fetchHabitaciones.rejected.match(action)) {
					errorToast(action.payload || "Error al obtener habitaciones");
				}
			});
		}
	}, [dispatch, status, errorToast]);

	const columns = useMemo(
		() => [
			{ header: "Número", key: "numero" },
			{ header: "Tipo", key: "tipo" },
			{ header: "Precio", key: "precio" },
			{ header: "Estado", key: "estado" },
		],
		[]
	);

	const data = useMemo(
		() =>
			habitaciones.map((h) => ({
				id: String(h.idHabitacion),
				...h,
			})),
		[habitaciones]
	);

	return (
		<div className={pantallaPrincipalEstilos}>
			<div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
				{status === "loading" ? (
					<LoadingSpinner/>
				) : data.length === 0 ? (
					<p className="text-center mt-10">No hay habitaciones disponibles</p>
				) : (
					<TableComponent
						columns={columns}
						data={data}
						showFormActions={false}
						title="Habitaciones"
						// onAdd={() => console.log("Agregar habitación")}
						// onEdit={(row) => console.log("Editar habitación:", row)}
					/>
				)}
			</div>
		</div>
	);
};

export default Habitaciones;
