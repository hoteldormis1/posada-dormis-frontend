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
import { hasPermission } from "@/utils/helpers/permissions";
import { useRouter } from "next/navigation";
import { MdCategory } from "react-icons/md";

const Habitaciones = () => {
	const dispatch: AppDispatch = useAppDispatch();
	const router = useRouter();
	const { errorToast, successToast } = useToastAlert();
	const { status } = useAppSelector((state: RootState) => state.habitaciones);
	const { confirm } = useSweetAlert();

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
		EstadoReservas,
		fetchData,
	} = useEntityTable({
		fetchAction: fetchHabitaciones,
		setPageAction: setHabitacionesPage,
		setPageSizeAction: setHabitacionesPageSize,
		selector: (state: RootState) => ({
			...state.habitaciones,
			tipoHabitaciones: state.habitaciones.tipoHabitaciones,
			EstadoReservas: state.habitaciones.estadosDeReserva,
		}),
		defaultSortField: "numero",
		defaultSortOrder: SortOrder.asc,
	});

	const inputOptions: FormFieldInputConfig[] = [
		{
			key: "numero",
			type: "number",
			label: "Número",
			editable: true
		},
		{
			key: "tipo",
			type: "select",
			label: "Tipo de habitación",
			options: tipoHabitaciones.map((tipo) => ({
				value: tipo.nombre,
				label: `${tipo.nombre} - $${tipo.precio}`,
			})),
			editable: true
		},
		/*{
			key: "nombre",
			type: "select",
			label: "Estado de habitación",
			options: EstadoReservas.map((nombre) => ({
				value: nombre.nombre,
				label: nombre.nombre.charAt(0).toUpperCase() + nombre.nombre.slice(1),
			})),
			editable: true
		},*/
	];

	const columns = useMemo(
		() => [
			{ header: "Número", key: "numero" },
			{ header: "Tipo", key: "tipo" },
			{ header: "Precio", key: "precio" },
			//{ header: "Estado", key: "estado" },
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

		const tipoSeleccionado = tipoHabitaciones.find((t) => t.nombre === estado);
		const estadoSeleccionado = EstadoReservas.find(
			(e) => e.nombre === tipo
		);

		if (!tipoSeleccionado || !estadoSeleccionado) {
			errorToast(
				"Tipo o nombre inválido. Verificá los datos e intentá nuevamente."
			);
			return;
		}

		type PayloadHabitacionEditar = {
			idTipoHabitacion: number;
			idEstadoReserva: number;
			idHabitacion: number;
		};

		const payload: PayloadHabitacionEditar = {
			idTipoHabitacion: tipoSeleccionado.idTipoHabitacion,
			idEstadoReserva: estadoSeleccionado.idEstadoReserva,
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
		const { tipo, numero } = formData;

		// Buscar tipo seleccionado
		const tipoSeleccionado = tipoHabitaciones.find((t) => t.nombre === String(tipo || ""));
		if (!tipoSeleccionado) {
			errorToast("Tipo de habitación inválido. Verificá los datos.");
			return;
		}

		// Coerción a número (los formularios suelen enviar string)
		const numeroNum = Number(numero);
		if (!Number.isFinite(numeroNum) || numeroNum <= 0 || !Number.isInteger(numeroNum)) {
			errorToast("Número de habitación inválido.");
			return;
		}

		type PayloadHabitacionAgregar = {
			idTipoHabitacion: number;
			numero: number;
		};

		const payload: PayloadHabitacionAgregar = {
			idTipoHabitacion: tipoSeleccionado.idTipoHabitacion,
			numero: numeroNum,
		};

		try {
			await dispatch(addHabitacion(payload)).unwrap();
			await fetchData?.();
			successToast("Habitación agregada exitosamente.");
		} catch (error) {
			errorToast(
				typeof error === "string" ? error : "Error al agregar la habitación."
			);
		}
	};

	const onSaveDelete = async (id: string): Promise<void> => {
		try {
			const confirmed = await confirm("¿Eliminar esta habitación? Esta acción no se puede deshacer.");
			if (!confirmed) return;

			await dispatch(deleteHabitacion(Number(id))).unwrap();
			await fetchData?.();
			successToast("Habitación eliminada exitosamente.");
		} catch (err) {
			errorToast(
				typeof err === "string" ? err : "Error al eliminar la habitación."
			);
		}
	};

	const { currentUser } = useAppSelector((state: RootState) => state.user);
	const {tiposUsuarios} = useAppSelector((state: RootState) => state.user);
	const idTipoUsuarioActual = currentUser?.idTipoUsuario;
	const puedeBorrar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "habitacion", "delete");
	const puedeEditar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "habitacion", "update"); 
	const puedeAgregar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "habitacion", "create");

	return (
		<div className={pantallaPrincipalEstilos}>
			<div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
				{/* Botón para gestionar tipos de habitaciones */}
				<div className="flex justify-end mb-4">
					<button
						onClick={() => router.push("/admin/tipoHabitaciones")}
						className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-main text-white rounded-md hover:bg-main/90 transition-colors duration-200 font-medium shadow-md"
					>
						<MdCategory size={20} />
						Gestionar Tipos de Habitaciones
					</button>
				</div>

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
							showActions={{create: puedeAgregar, delete: puedeBorrar, edit: puedeEditar}}
						/>
					);
				})()}
			</div>
		</div>
	);
};

export default Habitaciones;
