"use client";

import React, { useEffect, useMemo, useState } from "react";
import { pantallaPrincipalEstilos } from "@/styles/global-styles";
import { LoadingSpinner, TableComponent } from "@/components";
import { AppDispatch, RootState } from "@/lib/store/store";
import {
	fetchHuespedes,
	addHuesped,
	editHuesped,
	deleteHuesped,
} from "@/lib/store/utils/huespedes/huespedesSlice";
import {
	fetchHuespedNoDeseado,
	addHuespedNoDeseado,
	editHuespedNoDeseado,
	deleteHuespedNoDeseado,
} from "@/lib/store/utils/huespedNoDeseado/huespedNoDeseadoSlice";
import { FormFieldInputConfig, StateStatus } from "@/models/types";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useToastAlert } from "@/hooks/useToastAlert";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { hasPermission } from "@/utils/helpers/permissions";
import { Huesped } from "@/models/types/huesped";
import { FaUsers, FaBan } from "react-icons/fa";

const HuespedesPage = () => {
	const dispatch: AppDispatch = useAppDispatch();
	const { errorToast, successToast } = useToastAlert();
	const { confirm } = useSweetAlert();

	const [activeTab, setActiveTab] = useState<"huespedes" | "listaNegra">("huespedes");

	// ─── Huéspedes ───
	const { datos: huespedes, status, error } = useAppSelector(
		(state: RootState) => state.huespedes
	);
	const { accessToken } = useAppSelector((state: RootState) => state.user);

	useEffect(() => {
		if (status === StateStatus.idle && accessToken) {
			dispatch(fetchHuespedes());
		}
	}, [dispatch, status, accessToken]);

	// ─── Lista negra ───
	const { datos: listaNegra, status: statusLN, error: errorLN } = useAppSelector(
		(state: RootState) => state.huespedNoDeseado
	);

	useEffect(() => {
		if (statusLN === StateStatus.idle && accessToken) {
			dispatch(fetchHuespedNoDeseado());
		}
	}, [dispatch, statusLN, accessToken]);

	// ─── Permisos ───
	const { currentUser, tiposUsuarios } = useAppSelector((state: RootState) => state.user);
	const idTipoUsuarioActual = currentUser?.idTipoUsuario;
	const puedeBorrar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "huesped", "delete");
	const puedeEditar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "huesped", "update");
	const puedeAgregar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "huesped", "create");
	const puedeBorrarLN = hasPermission(tiposUsuarios, idTipoUsuarioActual, "huespedNoDeseado", "delete");
	const puedeEditarLN = hasPermission(tiposUsuarios, idTipoUsuarioActual, "huespedNoDeseado", "update");
	const puedeAgregarLN = hasPermission(tiposUsuarios, idTipoUsuarioActual, "huespedNoDeseado", "create");

	// ═══════════════ HUÉSPEDES config ═══════════════
	const inputOptions: FormFieldInputConfig[] = [
		{ key: "nombre", type: "text", label: "Nombre", editable: true },
		{ key: "apellido", type: "text", label: "Apellido", editable: true },
		{ key: "dni", type: "text", label: "DNI", editable: true },
		{ key: "telefono", type: "text", label: "Teléfono", editable: true },
		{ key: "origen", type: "text", label: "País de origen", editable: true },
		{ key: "direccion", type: "text", label: "Dirección (opcional)", editable: true },
	];

	const columns = useMemo(() => [
		{ header: "Nombre", key: "nombre" },
		{ header: "Apellido", key: "apellido" },
		{ header: "DNI", key: "dni" },
		{ header: "Teléfono", key: "telefono" },
		{ header: "Origen", key: "origen" },
		{ header: "Dirección", key: "direccion" },
	], []);

	const data = useMemo(() => {
		if (!huespedes || !Array.isArray(huespedes)) return [];
		return huespedes.map((h) => ({
			id: String(h.idHuesped),
			idHuesped: h.idHuesped,
			nombre: h.nombre,
			apellido: h.apellido,
			dni: h.dni,
			telefono: h.telefono,
			origen: h.origen,
			direccion: h.direccion || "-",
		}));
	}, [huespedes]);

	const onSaveEdit = async (formData: Record<string, unknown>, selectedRow: any) => {
		if (!selectedRow || !("idHuesped" in selectedRow)) {
			errorToast("Error: No se pudo identificar el huésped seleccionado.");
			return;
		}
		const { idHuesped } = selectedRow;
		const { nombre, apellido, dni, telefono, origen, direccion } = formData;
		if (!nombre || !apellido || !dni || !telefono || !origen) {
			errorToast("Los campos nombre, apellido, DNI, teléfono y origen son obligatorios.");
			return;
		}
		const payload: Partial<Huesped> & { idHuesped: number } = {
			idHuesped: Number(idHuesped),
			nombre: String(nombre).trim(),
			apellido: String(apellido).trim(),
			dni: String(dni).trim(),
			telefono: String(telefono).trim(),
			origen: String(origen).trim(),
			direccion: direccion ? String(direccion).trim() : undefined,
		};
		try {
			await dispatch(editHuesped(payload)).unwrap();
			successToast("Huésped actualizado exitosamente.");
		} catch (error) {
			errorToast(typeof error === "string" ? error : "Error al actualizar huésped.");
		}
	};

	const onSaveAdd = async (formData: Record<string, unknown>): Promise<void> => {
		const { nombre, apellido, dni, telefono, origen, direccion } = formData;
		if (!nombre || !apellido || !dni || !telefono || !origen) {
			errorToast("Los campos nombre, apellido, DNI, teléfono y origen son obligatorios.");
			return;
		}
		const payload: Partial<Huesped> = {
			nombre: String(nombre).trim(),
			apellido: String(apellido).trim(),
			dni: String(dni).trim(),
			telefono: String(telefono).trim(),
			origen: String(origen).trim(),
			direccion: direccion ? String(direccion).trim() : undefined,
		};
		try {
			await dispatch(addHuesped(payload)).unwrap();
			successToast("Huésped agregado exitosamente.");
		} catch (error) {
			errorToast(typeof error === "string" ? error : "Error al agregar huésped.");
		}
	};

	const onSaveDelete = async (id: string): Promise<void> => {
		try {
			const confirmed = await confirm("¿Eliminar este huésped? Esta acción no se puede deshacer.");
			if (!confirmed) return;
			await dispatch(deleteHuesped(Number(id))).unwrap();
			successToast("Huésped eliminado exitosamente.");
		} catch (err) {
			errorToast(typeof err === "string" ? err : "Error al eliminar huésped.");
		}
	};

	// ═══════════════ LISTA NEGRA config ═══════════════
	const inputOptionsLN: FormFieldInputConfig[] = [
		{ key: "dni", type: "text", label: "DNI", editable: true },
		{ key: "motivo", type: "text", label: "Motivo", editable: true },
		{ key: "observaciones", type: "text", label: "Observaciones", editable: true },
	];

	const columnsLN = useMemo(() => [
		{ header: "DNI", key: "dni" },
		{ header: "Motivo", key: "motivo" },
		{ header: "Observaciones", key: "observaciones" },
		{ header: "Fecha de alta", key: "fechaAlta" },
	], []);

	const dataLN = useMemo(() => {
		if (!listaNegra || !Array.isArray(listaNegra)) return [];
		return listaNegra.map((h) => ({
			id: String(h.idHuespedNoDeseado),
			idHuespedNoDeseado: h.idHuespedNoDeseado,
			dni: h.dni,
			motivo: h.motivo || "-",
			observaciones: h.observaciones || "-",
			fechaAlta: h.createdAt ? new Date(h.createdAt).toLocaleDateString("es-AR") : "-",
		}));
	}, [listaNegra]);

	const onSaveEditLN = async (formData: Record<string, unknown>, selectedRow: any) => {
		if (!selectedRow || !("idHuespedNoDeseado" in selectedRow)) {
			errorToast("Error: No se pudo identificar el registro.");
			return;
		}
		const { idHuespedNoDeseado } = selectedRow;
		const { dni, motivo, observaciones } = formData;
		if (!dni || String(dni).trim().length < 7) {
			errorToast("El DNI es obligatorio (mínimo 7 caracteres).");
			return;
		}
		try {
			await dispatch(editHuespedNoDeseado({
				idHuespedNoDeseado: Number(idHuespedNoDeseado),
				dni: String(dni).trim(),
				motivo: motivo ? String(motivo).trim() : null,
				observaciones: observaciones ? String(observaciones).trim() : null,
			})).unwrap();
			successToast("Registro actualizado.");
		} catch (err) {
			errorToast(typeof err === "string" ? err : "Error al actualizar.");
		}
	};

	const onSaveAddLN = async (formData: Record<string, unknown>): Promise<void> => {
		const { dni, motivo, observaciones } = formData;
		if (!dni || String(dni).trim().length < 7) {
			errorToast("El DNI es obligatorio (mínimo 7 caracteres).");
			return;
		}
		try {
			await dispatch(addHuespedNoDeseado({
				dni: String(dni).trim(),
				motivo: motivo ? String(motivo).trim() : null,
				observaciones: observaciones ? String(observaciones).trim() : null,
			})).unwrap();
			successToast("Huésped bloqueado exitosamente.");
		} catch (err) {
			errorToast(typeof err === "string" ? err : "Error al agregar.");
		}
	};

	const onSaveDeleteLN = async (id: string): Promise<void> => {
		try {
			const confirmed = await confirm("¿Desbloquear este huésped? Podrá volver a reservar.");
			if (!confirmed) return;
			await dispatch(deleteHuespedNoDeseado(Number(id))).unwrap();
			successToast("Huésped desbloqueado exitosamente.");
		} catch (err) {
			errorToast(typeof err === "string" ? err : "Error al eliminar.");
		}
	};

	// ═══════════════ RENDER ═══════════════
	const isLoading = activeTab === "huespedes" ? status === StateStatus.loading : statusLN === StateStatus.loading;
	const isFailed = activeTab === "huespedes" ? status === StateStatus.failed : statusLN === StateStatus.failed;
	const currentError = activeTab === "huespedes" ? error : errorLN;

	return (
		<div className={pantallaPrincipalEstilos}>
			<div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
				{/* Tabs */}
				<div className="flex gap-2 mb-4">
					<button
						onClick={() => setActiveTab("huespedes")}
						className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors duration-200 shadow-md cursor-pointer ${
							activeTab === "huespedes"
								? "bg-main text-white"
								: "bg-white text-main border border-main hover:bg-main/10"
						}`}
					>
						<FaUsers size={18} />
						Huéspedes
					</button>
					<button
						onClick={() => setActiveTab("listaNegra")}
						className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors duration-200 shadow-md cursor-pointer ${
							activeTab === "listaNegra"
								? "bg-red-600 text-white"
								: "bg-white text-red-600 border border-red-600 hover:bg-red-50"
						}`}
					>
						<FaBan size={18} />
						Bloqueados
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

					if (activeTab === "huespedes") {
						return (
							<TableComponent
								title="Huéspedes"
								columns={columns}
								data={data}
								showFormActions={true}
								showPagination={false}
								onSaveEdit={onSaveEdit}
								onSaveAdd={onSaveAdd}
								onSaveDelete={onSaveDelete}
								inputOptions={inputOptions}
								showActions={{
									create: puedeAgregar,
									delete: puedeBorrar,
									edit: puedeEditar,
								}}
							/>
						);
					}

					return (
						<TableComponent
							title="Huéspedes Bloqueados"
							columns={columnsLN}
							data={dataLN}
							showFormActions={true}
							showPagination={false}
							onSaveEdit={onSaveEditLN}
							onSaveAdd={onSaveAddLN}
							onSaveDelete={onSaveDeleteLN}
							inputOptions={inputOptionsLN}
							showActions={{
								create: puedeAgregarLN,
								delete: puedeBorrarLN,
								edit: puedeEditarLN,
							}}
						/>
					);
				})()}
			</div>
		</div>
	);
};

export default HuespedesPage;
