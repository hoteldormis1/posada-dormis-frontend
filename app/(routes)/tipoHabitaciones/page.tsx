"use client";

import React, { useMemo } from "react";
import { pantallaPrincipalEstilos } from "@/styles/global-styles";
import { LoadingSpinner, TableComponent } from "@/components";
import { AppDispatch, RootState } from "@/lib/store/store";
import { useEntityTable } from "@/hooks/useEntityTable";
import {
	addTipoHabitacion,
	deleteTipoHabitacion,
	editTipoHabitacion,
	fetchTipoHabitaciones,
	setTipoHabitacionesPage,
	setTipoHabitacionesPageSize,
} from "@/lib/store/utils/tipoHabitaciones/tipoHabitacionesSlice";
import { FormFieldInputConfig, SortOrder, StateStatus, TipoHabitacion } from "@/models/types";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useToastAlert } from "@/hooks/useToastAlert";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { hasPermission } from "@/utils/helpers/permissions";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

const TipoHabitaciones = () => {
	const dispatch: AppDispatch = useAppDispatch();
	const router = useRouter();
	const { errorToast, successToast } = useToastAlert();
	const { status } = useAppSelector((state: RootState) => state.tipoHabitaciones);
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
		fetchData,
	} = useEntityTable({
		fetchAction: fetchTipoHabitaciones,
		setPageAction: setTipoHabitacionesPage,
		setPageSizeAction: setTipoHabitacionesPageSize,
		selector: (state: RootState) => state.tipoHabitaciones,
		defaultSortField: "nombre",
		defaultSortOrder: SortOrder.asc,
	});

	const inputOptions: FormFieldInputConfig[] = [
		{
			key: "nombre",
			type: "text",
			label: "Nombre",
			editable: true,
		},
		{
			key: "precio",
			type: "number",
			label: "Precio Base",
			editable: true,
		},
	];

	const columns = useMemo(
		() => [
			{ header: "Nombre", key: "nombre" },
			{ header: "Precio Base", key: "precio" },
		],
		[]
	);

	const data = useMemo(() => {
		if (!datos || !Array.isArray(datos)) return [];
		return datos.map((t) => ({
			id: String(t.idTipoHabitacion),
			idTipoHabitacion: t.idTipoHabitacion,
			nombre: t.nombre,
			precio: `$${t.precio.toLocaleString("es-AR")}`,
			precioRaw: t.precio, // Guardar el valor numérico sin formato
		}));
	}, [datos]);

	// Mapear los datos de la fila al formulario de edición
	const mapRowToFormData = (row: any): Record<string, string> => {
		return {
			nombre: row.nombre || "",
			precio: String(row.precioRaw || row.precio || ""), // Usar el valor numérico
		};
	};

	const onSaveEdit = async (
		formData: Record<string, unknown>,
		selectedRow: TipoHabitacion | null
	) => {
		const { nombre, precio } = formData;

		if (!selectedRow || !("idTipoHabitacion" in selectedRow)) {
			errorToast("Error: No se pudo identificar el tipo de habitación seleccionado.");
			return;
		}

		const { idTipoHabitacion } = selectedRow;

		// Validaciones
		if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
			errorToast("El nombre es obligatorio.");
			return;
		}

		const precioNum = Number(precio);
		if (!Number.isFinite(precioNum) || precioNum <= 0) {
			errorToast("El precio debe ser un número positivo.");
			return;
		}

		type PayloadTipoHabitacionEditar = {
			idTipoHabitacion: number;
			nombre: string;
			precio: number;
		};

		const payload: PayloadTipoHabitacionEditar = {
			idTipoHabitacion: Number(idTipoHabitacion),
			nombre: nombre.trim(),
			precio: precioNum,
		};

		try {
			await dispatch(editTipoHabitacion(payload)).unwrap();
			await fetchData();
			successToast("Tipo de habitación editado exitosamente.");
		} catch (error) {
			errorToast(
				typeof error === "string" ? error : "Error al editar tipo de habitación."
			);
		}
	};

	const onSaveAdd = async (formData: Record<string, unknown>): Promise<void> => {
		const { nombre, precio } = formData;

		// Validaciones
		if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
			errorToast("El nombre es obligatorio.");
			return;
		}

		const precioNum = Number(precio);
		if (!Number.isFinite(precioNum) || precioNum <= 0) {
			errorToast("El precio debe ser un número positivo.");
			return;
		}

		type PayloadTipoHabitacionAgregar = {
			nombre: string;
			precio: number;
		};

		const payload: PayloadTipoHabitacionAgregar = {
			nombre: nombre.trim(),
			precio: precioNum,
		};

		try {
			await dispatch(addTipoHabitacion(payload)).unwrap();
			await fetchData?.();
			successToast("Tipo de habitación agregado exitosamente.");
		} catch (error) {
			errorToast(
				typeof error === "string" ? error : "Error al agregar el tipo de habitación."
			);
		}
	};

	const onSaveDelete = async (id: string): Promise<void> => {
		try {
			const confirmed = await confirm(
				"¿Eliminar este tipo de habitación? Esta acción no se puede deshacer y puede afectar las habitaciones existentes."
			);
			if (!confirmed) return;

			await dispatch(deleteTipoHabitacion(Number(id))).unwrap();
			await fetchData?.();
			successToast("Tipo de habitación eliminado exitosamente.");
		} catch (err) {
			errorToast(
				typeof err === "string" ? err : "Error al eliminar el tipo de habitación."
			);
		}
	};

	const { currentUser } = useAppSelector((state: RootState) => state.user);
	const { tiposUsuarios } = useAppSelector((state: RootState) => state.user);
	const idTipoUsuarioActual = currentUser?.idTipoUsuario;
	const puedeBorrar = hasPermission(
		tiposUsuarios,
		idTipoUsuarioActual,
		"tipoHabitacion",
		"delete"
	);
	const puedeEditar = hasPermission(
		tiposUsuarios,
		idTipoUsuarioActual,
		"tipoHabitacion",
		"update"
	);
	const puedeAgregar = hasPermission(
		tiposUsuarios,
		idTipoUsuarioActual,
		"tipoHabitacion",
		"create"
	);

	return (
		<div className={pantallaPrincipalEstilos}>
			<div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
				{/* Botón para volver a habitaciones */}
				<div className="flex justify-start mb-4">
					<button
						onClick={() => router.push("/habitaciones")}
						className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 font-medium shadow-md"
					>
						<MdArrowBack size={20} />
						Volver a Habitaciones
					</button>
				</div>

				{(() => {
					if (status === StateStatus.loading) {
						return <LoadingSpinner />;
					}

					if (status === StateStatus.failed) {
						return (
							<p className="text-center mt-10 text-red-600">
								Error al cargar los tipos de habitaciones: {error}
							</p>
						);
					}

					return (
						<TableComponent
							title="Tipos de Habitaciones"
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
							mapRowToFormData={mapRowToFormData}
							showActions={{
								create: puedeAgregar,
								delete: puedeBorrar,
								edit: puedeEditar,
							}}
						/>
					);
				})()}
			</div>
		</div>
	);
};

export default TipoHabitaciones;

