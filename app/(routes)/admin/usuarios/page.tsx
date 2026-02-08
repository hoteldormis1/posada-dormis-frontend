"use client";

import React, { useCallback, useMemo } from "react";
import api from "@/lib/store/axiosConfig";
import { RootState } from "@/lib/store/store";
import {
	fetchUsuarios,
	setUsuarioPage,
	setUsuarioPageSize,
} from "@/lib/store/utils/user/userSlice";
import { useEntityTable } from "@/hooks/useEntityTable";
import { LoadingSpinner, TableComponent } from "@/components";
import { pantallaPrincipalEstilos } from "@/styles/global-styles";
import { FormFieldInputConfig, SortOrder } from "@/models/types";
import { useAppSelector } from "@/lib/store/hooks";
import { AxiosError } from "axios";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { useToastAlert } from "@/hooks/useToastAlert";
import { hasPermission } from "@/utils/helpers/permissions";
import { invitarUsuarioSchema } from "@/utils/validations/usuarioSchema";

/**
 * Componente de administración de usuarios.
 *
 * @component
 * @description
 * Renderiza una tabla interactiva de usuarios con paginación, búsqueda,
 * ordenamiento, creación, invitación y eliminación de registros.  
 * Utiliza Redux y el hook `useEntityTable` para manejar el estado global
 * de la tabla y Axios para llamadas al backend.
 *
 * @example
 * // Uso dentro de una página
 * import Usuarios from "@/app/(rutas)/usuarios/page";
 * 
 * export default function Page() {
 *   return <Usuarios />;
 * }
 *
 * @returns {JSX.Element} Tabla de usuarios con formularios de alta/baja.
 *
 * @dependencies
 * - `useEntityTable`: Maneja datos, paginación y búsqueda.
 * - `TableComponent`: Renderiza tabla con inputs dinámicos.
 * - `useSweetAlert`: Hook de confirmación para acciones críticas.
 * - `useToastAlert`: Hook de notificaciones toast (éxito/error).
 * - `axiosConfig`: Cliente Axios con configuración global.
 *
 * @notes
 * - Filtra `tiposUsuarios` para excluir el rol `sysadmin` en el formulario.
 * - Implementa validaciones básicas antes de enviar invitaciones.
 * - Maneja errores con `parseAxiosError` para mostrar mensajes más claros.
 */


const Usuarios = () => {
	const {
		datos,
		loading,
		error,
		page,
		pageSize,
		total,
		search,
		setSearch,
		handleSearch,
		handlePageChange,
		handlePageSizeChange,
		sortField,
		sortOrder,
		handleSort,
	} = useEntityTable({
		fetchAction: fetchUsuarios,
		setPageAction: setUsuarioPage,
		setPageSizeAction: setUsuarioPageSize,
		selector: (state: RootState) => state.user,
		defaultSortField: "idUsuario",
		defaultSortOrder: SortOrder.asc,
	});
	const { confirm } = useSweetAlert();
	const { errorToast, successToast } = useToastAlert();
	const { currentUser } = useAppSelector((state: RootState) => state.user);
	const {tiposUsuarios} = useAppSelector((state: RootState) => state.user);
	
	// Columnas de la tabla
	const columns = useMemo(
		() => [
			{ header: "ID", key: "idUsuario" },
			{ header: "Nombre", key: "nombre" },
			{ header: "Email", key: "email" },
		],
		[]
	);
	
	function parseAxiosError(e: unknown) {
		const err = e as AxiosError<{ message?: string }>;
		const status = err?.response?.status;
		const serverMsg = err?.response?.data?.message;
		const message =
		  serverMsg ||
		  (status === 403
			? "No tenés permiso para realizar esta acción."
			: status === 401
			? "Tu sesión no es válida. Iniciá sesión nuevamente."
			: err?.message || "Ocurrió un error inesperado.");
		return { status, message };
	  }
	  
	  const onSaveAdd = async (formData: Record<string, unknown>): Promise<void> => {
		const payload = {
		  nombre: String(formData.nombre || "").trim(),
		  email: String(formData.email || "").trim().toLowerCase(),
		  tipoUsuario: String(formData.tipoUsuario || "").trim(),
		};
	  
		try {
		  await api.post("/usuarios/invite", payload, { withCredentials: true });
		  await handleSearch?.();
		  successToast("¡Invitación enviada exitosamente! El usuario recibirá un email para activar su cuenta.");
		} catch (e) {
		  const { status, message } = parseAxiosError(e);
	  
		  if (status === 403) {
			errorToast("No tenés permiso para invitar usuarios.");
			return;
		  }
	  
		  errorToast(message);
		}
	}

	  const onSaveDelete = async (id: string): Promise<void> => {
		const confirmed = await confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.");
		if (!confirmed) return;
	  
		try {
		  await api.delete(`/usuarios/${id}`, { withCredentials: true });
		  await handleSearch?.();
		  successToast("Usuario eliminado correctamente.");
		} catch (e) {
		  const { status, message } = parseAxiosError(e);
	  
		  if (status === 403) {
			errorToast("No tenés permiso para eliminar usuarios.");
			return;
		  }
	  
		  errorToast(message);
		}
	  };

	const inputOptions: FormFieldInputConfig[] = [
		{
			key: "nombre",
			type: "text",
			label: "Nombre",
			editable: true
		  },
		  {
			key: "email",
			type: "text",
			label: "Email",
			editable: true
		  },
		  {
			key: "tipoUsuario",
			type: "select",
			label: "Tipo de usuario",
			options: tiposUsuarios.filter((t) => t.nombre!=="sysadmin").map((t) => ({
				value: t.nombre,
				label: t.nombre,
			})),
			editable: true
		  },
	];

	// Formateo de datos
	const data = useMemo(
		() =>
			datos.map((u) => ({
				id: String(u.idUsuario),
				...u,
			})),
		[datos]
	);

	const idTipoUsuarioActual = currentUser?.idTipoUsuario;
	const puedeBorrar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "usuario", "delete");
	const puedeEditar = false; //nunca poder editar usuario acá
	const puedeAgregar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "usuario", "create");

	// IDs de tipos sysadmin (no se pueden borrar)
	const idsSysadmin = useMemo(
		() => tiposUsuarios.filter((t) => t.nombre === "sysadmin").map((t) => t.idTipoUsuario),
		[tiposUsuarios]
	);

	// No permitir borrar usuarios sysadmin ni al usuario actual
	const canDeleteRow = useCallback(
		(row: Record<string, any>) => {
			if (String(row.idUsuario) === String(currentUser?.idUsuario)) return false;
			if (idsSysadmin.includes(row.idTipoUsuario)) return false;
			return true;
		},
		[currentUser?.idUsuario, idsSysadmin]
	);

	return (
		<div className={pantallaPrincipalEstilos}>
			<div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
				{loading && <LoadingSpinner />}
				{!loading && !error && (
					<TableComponent
						columns={columns}
						data={data}
						showPagination
						currentPage={page}
						pageSize={pageSize}
						totalItems={total}
						title="Usuarios"
						search={search}
						onSearchChange={setSearch}
						onSearchSubmit={handleSearch}
						onPageChange={handlePageChange}
						onPageSizeChange={handlePageSizeChange}
						onSort={handleSort}
						sortField={sortField}
						sortOrder={sortOrder}
						onSaveAdd={onSaveAdd}
						onSaveDelete={onSaveDelete}
						onSaveEdit={()=>null}
						inputOptions={inputOptions}
						showFormActions={true}
						showActions={{create: puedeAgregar, delete: puedeBorrar, edit: puedeEditar}}
					canDeleteRow={canDeleteRow}
						addPopupDescription="Se enviará un email de invitación al usuario con un enlace para activar su cuenta y establecer su contraseña. El enlace será válido por 24 horas."
					/>
				)}
			</div>
		</div>
	);
};

export default Usuarios;
