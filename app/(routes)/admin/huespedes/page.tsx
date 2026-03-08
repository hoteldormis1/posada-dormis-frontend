"use client";

import React, { useEffect, useMemo, useState } from "react";
import { labelBaseEstilos, pantallaPrincipalEstilos } from "@/styles/global-styles";
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
import OrigenField from "@/components/reservas/OrigenField";
import { getCountryName } from "@/utils/helpers/format";

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
	argentina: "AR",
	uruguay: "UY",
	paraguay: "PY",
	bolivia: "BO",
	chile: "CL",
	brasil: "BR",
	peru: "PE",
	colombia: "CO",
	venezuela: "VE",
	ecuador: "EC",
	mexico: "MX",
	"estados unidos": "US",
	canada: "CA",
	espana: "ES",
	italia: "IT",
	alemania: "DE",
	francia: "FR",
};

const normalizeText = (value: string) =>
	value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim()
		.toLowerCase();

const toCountryCode = (value?: string) => {
	const raw = String(value ?? "").trim();
	if (!raw) return "AR";
	if (/^[A-Za-z]{2}$/.test(raw)) return raw.toUpperCase();
	return COUNTRY_NAME_TO_CODE[normalizeText(raw)] ?? "AR";
};

const HuespedesPage = () => {
	const dispatch: AppDispatch = useAppDispatch();
	const { errorToast, successToast } = useToastAlert();
	const { confirm } = useSweetAlert();

	const [activeTab, setActiveTab] = useState<"huespedes" | "listaNegra">("huespedes");
	const tabBase =
		"inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-colors cursor-pointer";
	const tabActive = "bg-emerald-400/20 text-emerald-200 border-emerald-300/30 shadow";
	const tabIdle =
		"bg-white/6 text-emerald-100/70 border-white/14 hover:bg-white/12 hover:border-white/25";

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
		{ key: "telefono", type: "phone", label: "Teléfono", editable: true },
		{ key: "origen", type: "custom", label: "País de origen", editable: true },
		{ key: "direccion", type: "text", label: "Dirección (opcional)", editable: true },
	];

	const customFields = useMemo(
		() => ({
			origen: (value: string, onChange: (nextValue: string) => void, ctx?: { disabled?: boolean }) => (
				<OrigenField
					value={toCountryCode(value)}
					onChange={(code) => onChange(code)}
					disabled={ctx?.disabled}
					labelClass={labelBaseEstilos}
					label="País de origen"
				/>
			),
		}),
		[]
	);

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
			origen: getCountryName(String(h.origen || "AR"), "es"),
			direccion: h.direccion || "-",
		}));
	}, [huespedes]);

	const mapRowToFormDataHuespedes = (row: any) => ({
		nombre: String(row?.nombre ?? ""),
		apellido: String(row?.apellido ?? ""),
		dni: String(row?.dni ?? ""),
		telefono: String(row?.telefono ?? ""),
		origen: toCountryCode(String(row?.origen ?? "AR")),
		direccion: row?.direccion && row.direccion !== "-" ? String(row.direccion) : "",
	});

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
			origen: String(origen).trim().toUpperCase(),
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
			origen: String(origen).trim().toUpperCase(),
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

	const onSaveDeleteMany = async (ids: string[]): Promise<void> => {
		const results = await Promise.allSettled(
			ids.map((id) => dispatch(deleteHuesped(Number(id))).unwrap())
		);
		const ok = results.filter((r) => r.status === "fulfilled").length;
		const fail = results.length - ok;
		if (ok > 0) successToast(`${ok} huésped(es) eliminado(s).`);
		if (fail > 0) {
			errorToast(
				`${fail} huésped(es) no se pudieron eliminar. Puede haber relaciones con otras tablas.`
			);
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

	const onSaveDeleteManyLN = async (ids: string[]): Promise<void> => {
		const results = await Promise.allSettled(
			ids.map((id) => dispatch(deleteHuespedNoDeseado(Number(id))).unwrap())
		);
		const ok = results.filter((r) => r.status === "fulfilled").length;
		const fail = results.length - ok;
		if (ok > 0) successToast(`${ok} bloqueo(s) eliminado(s).`);
		if (fail > 0) {
			errorToast(
				`${fail} registro(s) no se pudieron eliminar. Puede haber relaciones con otras tablas.`
			);
		}
	};

	// ═══════════════ RENDER ═══════════════
	const isLoading = activeTab === "huespedes" ? status === StateStatus.loading : statusLN === StateStatus.loading;
	const isFailed = activeTab === "huespedes" ? status === StateStatus.failed : statusLN === StateStatus.failed;
	const currentError = activeTab === "huespedes" ? error : errorLN;

	return (
		<div className={pantallaPrincipalEstilos}>
			<div className="m-auto w-full sm:w-11/12 md:w-10/12 pt-6">
				{/* Tabs */}
				<div className="flex flex-wrap gap-2 mb-4">
					<button
						onClick={() => setActiveTab("huespedes")}
						className={`${tabBase} ${activeTab === "huespedes" ? tabActive : tabIdle}`}
					>
						<FaUsers size={18} />
						Huéspedes
					</button>
					<button
						onClick={() => setActiveTab("listaNegra")}
						className={`${tabBase} ${activeTab === "listaNegra" ? tabActive : tabIdle}`}
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
								showPagination={true}
								onSaveEdit={onSaveEdit}
								onSaveAdd={onSaveAdd}
								onSaveDelete={onSaveDelete}
								onSaveDeleteMany={onSaveDeleteMany}
								inputOptions={inputOptions}
								customFields={customFields}
								mapRowToFormData={mapRowToFormDataHuespedes}
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
							showPagination={true}
							onSaveEdit={onSaveEditLN}
							onSaveAdd={onSaveAddLN}
							onSaveDelete={onSaveDeleteLN}
							onSaveDeleteMany={onSaveDeleteManyLN}
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
