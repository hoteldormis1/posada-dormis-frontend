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
import { FormFieldInputConfig, StateStatus } from "@/models/types";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useToastAlert } from "@/hooks/useToastAlert";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { hasPermission } from "@/utils/helpers/permissions";
import { Huesped } from "@/models/types/huesped";

const HuespedesPage = () => {
	const dispatch: AppDispatch = useAppDispatch();
	const { errorToast, successToast } = useToastAlert();
	const { confirm } = useSweetAlert();

	const { datos: huespedes, status, error } = useAppSelector(
		(state: RootState) => state.huespedes
	);
	const { accessToken } = useAppSelector((state: RootState) => state.user);

	// Cargar huéspedes al montar, solo si hay token
	useEffect(() => {
		if (status === StateStatus.idle && accessToken) {
			dispatch(fetchHuespedes());
		}
	}, [dispatch, status, accessToken]);

	const inputOptions: FormFieldInputConfig[] = [
		{
			key: "nombre",
			type: "text",
			label: "Nombre",
			editable: true,
		},
		{
			key: "apellido",
			type: "text",
			label: "Apellido",
			editable: true,
		},
		{
			key: "dni",
			type: "text",
			label: "DNI",
			editable: true,
		},
		{
			key: "telefono",
			type: "text",
			label: "Teléfono",
			editable: true,
		},
		{
			key: "origen",
			type: "text",
			label: "País de origen",
			editable: true,
		},
		{
			key: "direccion",
			type: "text",
			label: "Dirección (opcional)",
			editable: true,
		},
	];

	const columns = useMemo(
		() => [
			{ header: "Nombre", key: "nombre" },
			{ header: "Apellido", key: "apellido" },
			{ header: "DNI", key: "dni" },
			{ header: "Teléfono", key: "telefono" },
			{ header: "Origen", key: "origen" },
			{ header: "Dirección", key: "direccion" },
		],
		[]
	);

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

	const onSaveEdit = async (
		formData: Record<string, unknown>,
		selectedRow: any
	) => {
		if (!selectedRow || !("idHuesped" in selectedRow)) {
			errorToast("Error: No se pudo identificar el huésped seleccionado.");
			return;
		}

		const { idHuesped } = selectedRow;

		// Validaciones básicas
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
			errorToast(
				typeof error === "string" ? error : "Error al actualizar huésped."
			);
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
			errorToast(
				typeof error === "string" ? error : "Error al agregar huésped."
			);
		}
	};

	const onSaveDelete = async (id: string): Promise<void> => {
		try {
			const confirmed = await confirm(
				"¿Eliminar este huésped? Esta acción no se puede deshacer."
			);
			if (!confirmed) return;

			await dispatch(deleteHuesped(Number(id))).unwrap();
			successToast("Huésped eliminado exitosamente.");
		} catch (err) {
			errorToast(
				typeof err === "string" ? err : "Error al eliminar huésped."
			);
		}
	};

	const { currentUser, tiposUsuarios } = useAppSelector((state: RootState) => state.user);
	const idTipoUsuarioActual = currentUser?.idTipoUsuario;
	const puedeBorrar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "huesped", "delete");
	const puedeEditar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "huesped", "update");
	const puedeAgregar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "huesped", "create");

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
								Error al cargar los huéspedes: {error}
							</p>
						);
					}

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
				})()}
			</div>
		</div>
	);
};

export default HuespedesPage;
