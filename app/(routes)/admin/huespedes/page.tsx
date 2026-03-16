"use client";

import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
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
import { isValidPhoneNumber } from "@/components/forms/formComponents/PhoneInput";

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
	if (/^[A-Za-z]{2}$/.test(raw)) {
		const code = raw.toUpperCase();
		try {
			const isKnownCountry = Boolean(
				new Intl.DisplayNames(["es"], { type: "region" }).of(code)
			);
			return isKnownCountry ? code : "AR";
		} catch {
			return "AR";
		}
	}
	return COUNTRY_NAME_TO_CODE[normalizeText(raw)] ?? "AR";
};

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const isTelefonoValido = (phone: string) => {
	const value = phone.trim();
	if (!value) return false;
	if (value.startsWith("+")) {
		try {
			return isValidPhoneNumber(value);
		} catch {
			return false;
		}
	}
	const digits = value.replace(/\D/g, "");
	return digits.length >= 8 && digits.length <= 15;
};

const huespedFormSchema = z.object({
	nombre: z.string().trim().min(1, "El nombre es obligatorio"),
	apellido: z.string().trim().min(1, "El apellido es obligatorio"),
	dni: z
		.string()
		.trim()
		.regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 dígitos"),
	telefono: z
		.string()
		.trim()
		.refine(isTelefonoValido, "Ingresá un teléfono válido"),
	origen: z.string().trim().min(2, "El país de origen es obligatorio"),
	email: z
		.string()
		.trim()
		.min(1, "El email es obligatorio")
		.refine((v) => EMAIL_RE.test(v) && !/\.\./.test(v), {
			message: "Ingresá un email válido",
		}),
	direccion: z.string().optional(),
});

const HuespedesPage = () => {
	const dispatch: AppDispatch = useAppDispatch();
	const { errorToast, successToast } = useToastAlert();
	const { confirm } = useSweetAlert();

	const [activeTab, setActiveTab] = useState<"huespedes" | "listaNegra">("huespedes");
	const [searchHuespedes, setSearchHuespedes] = useState("");
	const [searchListaNegra, setSearchListaNegra] = useState("");
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
		{ key: "email", type: "text", label: "Email", editable: true },
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
		{ header: "Email", key: "email" },
		{ header: "Dirección", key: "direccion" },
	], []);

	const data = useMemo(() => {
		if (!huespedes || !Array.isArray(huespedes)) return [];
		return huespedes.map((h) => {
			const origenCode = toCountryCode(String(h.origen || "AR"));
			return {
			id: String(h.idHuesped),
			idHuesped: h.idHuesped,
			nombre: h.nombre,
			apellido: h.apellido,
			dni: h.dni,
			telefono: h.telefono,
			origenCode,
			origen: getCountryName(origenCode, "es"),
			email: h.email || "-",
			direccion: h.direccion || "-",
		};
		});
	}, [huespedes]);

	type HuespedRow = {
		id: string;
		idHuesped: number;
		nombre: string;
		apellido: string;
		dni: string;
		telefono: string;
		origen: string;
		origenCode: string;
		email: string;
		direccion: string;
	};

	const mapRowToFormDataHuespedes = (row: HuespedRow) => ({
		nombre: String(row?.nombre ?? ""),
		apellido: String(row?.apellido ?? ""),
		dni: String(row?.dni ?? ""),
		telefono: String(row?.telefono ?? ""),
		origen: toCountryCode(String(row?.origenCode ?? row?.origen ?? "AR")),
		email: row?.email && row.email !== "-" ? String(row.email) : "",
		direccion: row?.direccion && row.direccion !== "-" ? String(row.direccion) : "",
	});

	const onSaveEdit = async (formData: Record<string, unknown>, selectedRow: any) => {
		if (!selectedRow || !("idHuesped" in selectedRow)) {
			errorToast("Error: No se pudo identificar el huésped seleccionado.");
			return;
		}
		const { idHuesped } = selectedRow;
		const parsed = huespedFormSchema.safeParse(formData);
		if (!parsed.success) {
			errorToast(parsed.error.issues[0]?.message || "Revisá los campos del formulario.");
			return;
		}
		const { nombre, apellido, dni, telefono, origen, email, direccion } = parsed.data;
		const payload: Partial<Huesped> & { idHuesped: number } = {
			idHuesped: Number(idHuesped),
			nombre,
			apellido,
			dni,
			telefono,
			origen: toCountryCode(origen),
			email: email.toLowerCase(),
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
		const parsed = huespedFormSchema.safeParse(formData);
		if (!parsed.success) {
			errorToast(parsed.error.issues[0]?.message || "Revisá los campos del formulario.");
			return;
		}
		const { nombre, apellido, dni, telefono, origen, email, direccion } = parsed.data;
		const payload: Partial<Huesped> = {
			nombre,
			apellido,
			dni,
			telefono,
			origen: toCountryCode(origen),
			email: email.toLowerCase(),
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

	const filteredData = useMemo(() => {
		const query = normalizeText(searchHuespedes);
		if (!query) return data;
		return data.filter((row) => {
			const searchableValues = [
				row.nombre,
				row.apellido,
				row.dni,
				row.telefono,
				row.origen,
				row.email,
				row.direccion,
			];
			return searchableValues.some((value) =>
				normalizeText(String(value ?? "")).includes(query)
			);
		});
	}, [data, searchHuespedes]);

	const filteredDataLN = useMemo(() => {
		const query = normalizeText(searchListaNegra);
		if (!query) return dataLN;
		return dataLN.filter((row) => {
			const searchableValues = [
				row.dni,
				row.motivo,
				row.observaciones,
				row.fechaAlta,
			];
			return searchableValues.some((value) =>
				normalizeText(String(value ?? "")).includes(query)
			);
		});
	}, [dataLN, searchListaNegra]);

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
								data={filteredData}
								showFormActions={true}
								showPagination={true}
								search={searchHuespedes}
								onSearchChange={setSearchHuespedes}
								onSearchSubmit={() => undefined}
								onSaveEdit={onSaveEdit}
								onSaveAdd={onSaveAdd}
								onSaveDelete={onSaveDelete}
								onSaveDeleteMany={onSaveDeleteMany}
								inputOptions={inputOptions}
								customFields={customFields}
								mapRowToFormData={mapRowToFormDataHuespedes}
								validationSchemaEdit={huespedFormSchema}
								validationSchemaAdd={huespedFormSchema}
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
							data={filteredDataLN}
							showFormActions={true}
							showPagination={true}
							search={searchListaNegra}
							onSearchChange={setSearchListaNegra}
							onSearchSubmit={() => undefined}
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
