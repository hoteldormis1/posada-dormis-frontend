"use client";

import React, { useMemo, useState } from "react";
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
import {
	addTipoHabitacion,
	deleteTipoHabitacion,
	editTipoHabitacion,
	fetchTipoHabitaciones,
	setTipoHabitacionesPage,
	setTipoHabitacionesPageSize,
} from "@/lib/store/utils/tipoHabitaciones/tipoHabitacionesSlice";
import { FormFieldInputConfig, Habitacion, SortOrder, StateStatus } from "@/models/types";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useToastAlert } from "@/hooks/useToastAlert";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { hasPermission } from "@/utils/helpers/permissions";
import { FaBed } from "react-icons/fa";
import { MdCategory } from "react-icons/md";

const Habitaciones = () => {
	const dispatch: AppDispatch = useAppDispatch();
	const { errorToast, successToast } = useToastAlert();
	const { confirm } = useSweetAlert();

	const [activeTab, setActiveTab] = useState<"habitaciones" | "tipos">("habitaciones");

	// ─── Permisos ───
	const { currentUser, tiposUsuarios } = useAppSelector((state: RootState) => state.user);
	const idTipoUsuarioActual = currentUser?.idTipoUsuario;

	const puedeBorrar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "habitacion", "delete");
	const puedeEditar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "habitacion", "update");
	const puedeAgregar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "habitacion", "create");

	const puedeBorrarTH = hasPermission(tiposUsuarios, idTipoUsuarioActual, "tipoHabitacion", "delete");
	const puedeEditarTH = hasPermission(tiposUsuarios, idTipoUsuarioActual, "tipoHabitacion", "update");
	const puedeAgregarTH = hasPermission(tiposUsuarios, idTipoUsuarioActual, "tipoHabitacion", "create");

	// ═══════════════ HABITACIONES ═══════════════
	const { status } = useAppSelector((state: RootState) => state.habitaciones);

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
	];

	const columns = useMemo(
		() => [
			{ header: "Número", key: "numero" },
			{ header: "Tipo", key: "tipo" },
			{ header: "Precio", key: "precio" },
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

		const tipoSeleccionado = tipoHabitaciones.find((t) => t.nombre === String(tipo || ""));
		if (!tipoSeleccionado) {
			errorToast("Tipo de habitación inválido. Verificá los datos.");
			return;
		}

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

	// ═══════════════ TIPOS DE HABITACIONES ═══════════════
	const { status: statusTH } = useAppSelector((state: RootState) => state.tipoHabitaciones);

	const {
		datos: datosTH,
		error: errorTH,
		page: pageTH,
		pageSize: pageSizeTH,
		total: totalTH,
		sortField: sortFieldTH,
		sortOrder: sortOrderTH,
		handlePageChange: handlePageChangeTH,
		handlePageSizeChange: handlePageSizeChangeTH,
		handleSort: handleSortTH,
		search: searchTH,
		setSearch: setSearchTH,
		handleSearch: handleSearchTH,
		fetchData: fetchDataTH,
	} = useEntityTable({
		fetchAction: fetchTipoHabitaciones,
		setPageAction: setTipoHabitacionesPage,
		setPageSizeAction: setTipoHabitacionesPageSize,
		selector: (state: RootState) => state.tipoHabitaciones,
		defaultSortField: "nombre",
		defaultSortOrder: SortOrder.asc,
	});

	const inputOptionsTH: FormFieldInputConfig[] = [
		{ key: "nombre", type: "text", label: "Nombre", editable: true },
		{ key: "precio", type: "number", label: "Precio Base", editable: true },
	];

	const columnsTH = useMemo(
		() => [
			{ header: "Nombre", key: "nombre" },
			{ header: "Precio Base", key: "precio" },
		],
		[]
	);

	const dataTH = useMemo(() => {
		if (!datosTH || !Array.isArray(datosTH)) return [];
		return datosTH.map((t) => ({
			id: String(t.idTipoHabitacion),
			idTipoHabitacion: t.idTipoHabitacion,
			nombre: t.nombre,
			precio: `$${t.precio.toLocaleString("es-AR")}`,
			precioRaw: t.precio,
		}));
	}, [datosTH]);

	const mapRowToFormDataTH = (row: any): Record<string, string> => ({
		nombre: row.nombre || "",
		precio: String(row.precioRaw || row.precio || ""),
	});

	const onSaveEditTH = async (formData: Record<string, unknown>, selectedRow: any) => {
		const { nombre, precio } = formData;

		if (!selectedRow || !("idTipoHabitacion" in selectedRow)) {
			errorToast("Error: No se pudo identificar el tipo de habitación seleccionado.");
			return;
		}

		const { idTipoHabitacion } = selectedRow as { idTipoHabitacion: number };

		if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
			errorToast("El nombre es obligatorio.");
			return;
		}

		const precioNum = Number(precio);
		if (!Number.isFinite(precioNum) || precioNum <= 0) {
			errorToast("El precio debe ser un número positivo.");
			return;
		}

		try {
			await dispatch(editTipoHabitacion({
				idTipoHabitacion: Number(idTipoHabitacion),
				nombre: nombre.trim(),
				precio: precioNum,
			})).unwrap();
			await fetchDataTH();
			successToast("Tipo de habitación editado exitosamente.");
		} catch (error) {
			errorToast(typeof error === "string" ? error : "Error al editar tipo de habitación.");
		}
	};

	const onSaveAddTH = async (formData: Record<string, unknown>): Promise<void> => {
		const { nombre, precio } = formData;

		if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
			errorToast("El nombre es obligatorio.");
			return;
		}

		const precioNum = Number(precio);
		if (!Number.isFinite(precioNum) || precioNum <= 0) {
			errorToast("El precio debe ser un número positivo.");
			return;
		}

		try {
			await dispatch(addTipoHabitacion({
				nombre: nombre.trim(),
				precio: precioNum,
			})).unwrap();
			await fetchDataTH?.();
			successToast("Tipo de habitación agregado exitosamente.");
		} catch (error) {
			errorToast(typeof error === "string" ? error : "Error al agregar el tipo de habitación.");
		}
	};

	const onSaveDeleteTH = async (id: string): Promise<void> => {
		try {
			const confirmed = await confirm(
				"¿Eliminar este tipo de habitación? Esta acción no se puede deshacer y puede afectar las habitaciones existentes."
			);
			if (!confirmed) return;

			await dispatch(deleteTipoHabitacion(Number(id))).unwrap();
			await fetchDataTH?.();
			successToast("Tipo de habitación eliminado exitosamente.");
		} catch (err) {
			errorToast(typeof err === "string" ? err : "Error al eliminar el tipo de habitación.");
		}
	};

	// ═══════════════ RENDER ═══════════════
	const isLoading = activeTab === "habitaciones" ? status === StateStatus.loading : statusTH === StateStatus.loading;
	const isFailed = activeTab === "habitaciones" ? status === StateStatus.failed : statusTH === StateStatus.failed;
	const currentError = activeTab === "habitaciones" ? error : errorTH;

	return (
		<div className={pantallaPrincipalEstilos}>
			<div className="m-auto w-full sm:w-11/12 md:w-10/12 pt-6">
				{/* Tabs */}
				<div className="flex gap-2 mb-4">
					<button
						onClick={() => setActiveTab("habitaciones")}
						className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors duration-200 shadow-md cursor-pointer ${
							activeTab === "habitaciones"
								? "bg-main text-white"
								: "bg-white text-main border border-main hover:bg-main/10"
						}`}
					>
						<FaBed size={18} />
						Habitaciones
					</button>
					<button
						onClick={() => setActiveTab("tipos")}
						className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors duration-200 shadow-md cursor-pointer ${
							activeTab === "tipos"
								? "bg-blue-500 text-white"
								: "bg-white text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white"
						}`}
					>
						<MdCategory size={18} />
						Tipos de Habitaciones
					</button>
				</div>

				{(() => {
					if (isLoading) return <LoadingSpinner />;

					if (isFailed) {
						return (
							<p className="text-center mt-10 text-red-600">
								Error al cargar: {currentError}
							</p>
						);
					}

					if (activeTab === "habitaciones") {
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
								showActions={{ create: puedeAgregar, delete: puedeBorrar, edit: puedeEditar }}
							/>
						);
					}

					return (
						<TableComponent
							title="Tipos de Habitaciones"
							columns={columnsTH}
							data={dataTH}
							showFormActions={true}
							showPagination={true}
							currentPage={pageTH}
							pageSize={pageSizeTH}
							totalItems={totalTH}
							sortField={sortFieldTH}
							sortOrder={sortOrderTH}
							onPageChange={handlePageChangeTH}
							onPageSizeChange={handlePageSizeChangeTH}
							onSort={handleSortTH}
							search={searchTH}
							onSearchChange={setSearchTH}
							onSearchSubmit={handleSearchTH}
							onSaveEdit={onSaveEditTH}
							onSaveAdd={onSaveAddTH}
							onSaveDelete={onSaveDeleteTH}
							inputOptions={inputOptionsTH}
							mapRowToFormData={mapRowToFormDataTH}
							showActions={{ create: puedeAgregarTH, delete: puedeBorrarTH, edit: puedeEditarTH }}
						/>
					);
				})()}
			</div>
		</div>
	);
};

export default Habitaciones;
