"use client";

import React, { useMemo } from "react";
import { pantallaPrincipalEstilos } from "@/styles/global-styles";
import { LoadingSpinner, TableComponent } from "@/components";
import { AppDispatch, RootState } from "@/lib/store/store";
import { useEntityTable } from "@/hooks/useEntityTable";
import {
	addHabitacion,
	deleteHabitacion,
	editHabitacion,
	fetchHabitaciones,
	setHabitacionesPage,
	setHabitacionesPageSize,
} from "@/lib/store/utils/habitaciones/habitacionesSlice";
import { FormFieldInputConfig, Habitacion, SortOrder, StateStatus } from "@/models/types";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useToastAlert } from "@/hooks/useToastAlert";
import { useSweetAlert } from "@/hooks/useSweetAlert";

const Habitaciones = () => {
	const {
		datos,
		error,
		page,
		pageSize,
		total,
		sortField,
		sortOrder,
		handlePageChange,
		handlePageSizeChange,
		handleSort,
		search,
		setSearch,
		handleSearch,
		tipoHabitaciones,
		estadoHabitaciones,
		fetchData,
	} = useEntityTable({
		fetchAction: fetchHabitaciones,
		setPageAction: setHabitacionesPage,
		setPageSizeAction: setHabitacionesPageSize,
		selector: (state: RootState) => ({
			...state.habitaciones,
			tipoHabitaciones: state.habitaciones.tipoHabitaciones,
			estadoHabitaciones: state.habitaciones.estadoHabitaciones,
		}),
		defaultSortField: "numero",
		defaultSortOrder: SortOrder.asc,
	});

	const dispatch: AppDispatch = useAppDispatch();

	const { errorToast, successToast } = useToastAlert();

	const { status } = useAppSelector((state: RootState) => state.habitaciones);

	const { confirm } = useSweetAlert();

	const inputOptions: FormFieldInputConfig[] = [
		{
			key: "numero",
			type: "number",
			label: "Número",
		},
		{
			key: "tipo",
			type: "select",
			label: "Tipo de habitación",
			options: tipoHabitaciones.map((tipo) => ({
				value: tipo.tipo,
				label: `${tipo.tipo} - $${tipo.precio}`,
			})),
		},
		{
			key: "estado",
			type: "select",
			label: "Estado de habitación",
			options: estadoHabitaciones.map((estado) => ({
				value: estado.estado,
				label: estado.estado.charAt(0).toUpperCase() + estado.estado.slice(1),
			})),
		},
	];

	const columns = useMemo(
		() => [
			{ header: "Número", key: "numero" },
			{ header: "Tipo", key: "tipo" },
			{ header: "Precio", key: "precio" },
			{ header: "Estado", key: "estado" },
		],
		[]
	);

	const data = useMemo(() => {
		if (!datos || !Array.isArray(datos)) return [];
		return datos.map((h) => ({
			id: String(h.idHabitacion), 
			numero: h.numero,
			tipo: h.tipo,
			precio: h.precio,
			estado: h.estado,
			idHabitacion: h.idHabitacion, 
		}));
	}, [datos]);

	const onSaveEdit = async (
		formData: Record<string, unknown>,
		selectedRow: Habitacion | null
	) => {
		const { tipo, estado } = formData;

		if (!selectedRow || !("idHabitacion" in selectedRow)) {
			errorToast("Error: No se pudo identificar la habitación seleccionada.");
			return;
		}

		const { idHabitacion } = selectedRow;

		const tipoSeleccionado = tipoHabitaciones.find((t) => t.tipo === tipo);
		const estadoSeleccionado = estadoHabitaciones.find(
			(e) => e.estado === estado
		);

		if (!tipoSeleccionado || !estadoSeleccionado) {
			errorToast(
				"Tipo o estado inválido. Verificá los datos e intentá nuevamente."
			);
			return;
		}

		type PayloadHabitacionEditar = {
			idTipoHabitacion: number;
			idEstadoHabitacion: number;
			idHabitacion: number;
		};

		const payload: PayloadHabitacionEditar = {
			idTipoHabitacion: tipoSeleccionado.idTipoHabitacion,
			idEstadoHabitacion: estadoSeleccionado.idEstadoHabitacion,
			idHabitacion: Number(idHabitacion),
		};

		try {
			await dispatch(editHabitacion(payload)).unwrap();
			await fetchData();
			successToast("Habitación editada exitosamente.");
		} catch (error) {
			errorToast(
				typeof error === "string" ? error : "Error al editar habitación."
			);
		}
	};

	const onSaveAdd = async (formData: Record<string, unknown>): Promise<void> => {
		const { tipo, estado, numero } = formData;

		const tipoSeleccionado = tipoHabitaciones.find((t) => t.tipo === tipo);
		const estadoSeleccionado = estadoHabitaciones.find(
			(e) => e.estado === estado
		);

		if (!tipoSeleccionado || !estadoSeleccionado) {
			errorToast("Tipo o estado inválido. Verificá los datos.");
			return;
		}

		if (typeof numero !== "number" || isNaN(numero)) {
			errorToast("Número o precio inválido.");
			return;
		}

		type PayloadHabitacionAgregar = {
			idTipoHabitacion: number;
			idEstadoHabitacion: number;
			numero: number;
		};

		const payload: PayloadHabitacionAgregar = {
			idTipoHabitacion: tipoSeleccionado.idTipoHabitacion,
			idEstadoHabitacion: estadoSeleccionado.idEstadoHabitacion,
			numero,
		};

		try {
			await dispatch(addHabitacion(payload)).unwrap();
			await fetchData();
			successToast("Habitación agregada exitosamente.");
		} catch (error) {
			errorToast(
				typeof error === "string" ? error : "Error al agregar habitación."
			);
		}
	};

	const onSaveDelete = async (id: string): Promise<void> => {
		try {
			const confirmed = await confirm("Esta acción no se puede deshacer.");
			if (!confirmed) return;
			await dispatch(deleteHabitacion(Number(id))).unwrap();
			await fetchData();
			successToast("Habitación eliminada exitosamente.");
		} catch (err) {
			errorToast(
				typeof err === "string" ? err : "Error al eliminar la habitación."
			);
		}
	};

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
								Error al cargar las habitaciones: {error}
							</p>
						);
					}

					// if (datos.length === 0) {
					// 	return (
					// 		<p className="text-center mt-10 text-gray-500">
					// 			No hay habitaciones registradas.
					// 		</p>
					// 	);
					// }

					return (
						<TableComponent
							title="Habitaciones"
							columns={columns}
							data={data}
							showFormActions={true}
							showPagination={true}
							currentPage={page}
							pageSize={pageSize}
							totalItems={total}
							sortField={sortField}
							sortOrder={sortOrder}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
							onSort={handleSort}
							search={search}
							onSearchChange={setSearch}
							onSearchSubmit={handleSearch}
							onSaveEdit={onSaveEdit}
							onSaveAdd={onSaveAdd}
							onSaveDelete={onSaveDelete}
							inputOptions={inputOptions}
						/>
					);
				})()}
			</div>
		</div>
	);
};

export default Habitaciones;
