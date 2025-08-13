"use client";

import React, { useEffect, useMemo } from "react";
import { inputBaseEstilos, labelBaseEstilos, pantallaPrincipalEstilos } from "@/styles/global-styles";
import { LoadingSpinner, TableComponent } from "@/components";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import { addReserva, deleteReserva, editReserva, fetchHuespedes, fetchReservas } from "@/lib/store/utils/index";
import { useToastAlert } from "@/hooks/useToastAlert";
import { FormFieldInputConfig, Reserva, SortOrder, StateStatus } from "@/models/types";
import { fetchHabitaciones } from "@/lib/store/utils/habitaciones/habitacionesSlice";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { reservaAddSchema, reservaEditSchema } from "@/utils/validations/reservaSchema";
import { mapRowToFormDataReservas } from "@/utils/helpers/mappers";
import { getCountryName } from "@/utils/helpers/format";
import { diffNoches, toISOFromFlexible, parseDateWithFallbackISO } from "@/utils/helpers/date";
import { getPrecioHabitacion } from "@/utils/helpers/money";
import makeCustomFields from "@/components/reservas/makeCustomFields";

const Reservas: React.FC = () => {
	const dispatch = useAppDispatch<AppDispatch>();
	const { reservas, status } = useAppSelector((state: RootState) => state.reservas);
	const { datos: huespedes } = useAppSelector((state: RootState) => state.huespedes);
	const { habitaciones } = useAppSelector((state: RootState) => state);
	const { errorToast, successToast } = useToastAlert();
	const { confirm } = useSweetAlert();

	const columns = [
		{ header: "Habitación", key: "numeroHab" },
		{ header: "Fecha de ingreso", key: "ingreso" },
		{ header: "Fecha de salida", key: "egreso" },
		{ header: "Huésped", key: "huespedNombre" },
		{ header: "Teléfono", key: "telefonoHuesped" },
		{ header: "Monto pagado", key: "montoPagado" },
		{ header: "Total", key: "total" },
		{ header: "Estado", key: "estadoDeReserva" },
	]

	const buildReservaInputOptions = (habitacionesDatos: any[]): FormFieldInputConfig[] => [
		// MODE SELECTION
		{
			key: "huespedMode",
			type: "select",
			label: "Tipo de huésped",
			editable: false,
			options: [
				{ value: "existente", label: "Huésped existente" },
				{ value: "nuevo", label: "Nuevo huésped" },
			],
		},
		// HUESPED EXISTENTE
		{
			key: "idHuesped",
			type: "select",
			label: "Seleccionar huésped",
			editable: false,
			options: (huespedes ?? []).map((h: any) => ({
			  value: h.idHuesped,
			  label: `${h.nombre} ${h.apellido}`,
			})),
		},
		// HUESPED FIELDS (conditional editable)
		{ key: "nombre", label: "Nombre", type: "text", editable: false },
		{ key: "apellido", label: "Apellido", type: "text", editable: false },
		{ key: "dni", label: "DNI", type: "text", editable: false },
		{ key: "telefono", label: "Teléfono", type: "text", editable: false },
		{ key: "email", label: "Email", type: "text", editable: false },
		{ key: "origen", label: "Origen", type: "custom", editable: false },

		// RESERVA
		{
			key: "idHabitacion",
			type: "select",
			label: "Habitación",
			editable: false,
			options: (habitacionesDatos ?? []).map((h: any) => ({
				value: h.idHabitacion,
				label: `Número ${h.numero}`,
			})),
		},
		{ key: "fechaDesde", label: "Fecha desde", type: "date", editable: false },
		{ key: "fechaHasta", label: "Fecha hasta", type: "date", editable: false },
		{ key: "montoPagado", label: "Monto Pagado", type: "custom", editable: true },
	];

	// Carga inicial
	useEffect(() => {
		if (status !== StateStatus.idle) return;

		(async () => {
			const [habRes, resRes, hueRes] = await Promise.all([
				dispatch(fetchHabitaciones({ sortOrder: SortOrder.asc })),
				dispatch(fetchReservas()),
				dispatch(fetchHuespedes()),
			]);

			if (fetchHabitaciones.rejected.match(habRes)) {
				errorToast(habRes.payload || "Error al obtener habitaciones");
			}
			if (fetchReservas.rejected.match(resRes)) {
				errorToast(resRes.payload || "Error al obtener reservas");
			}
			if (fetchHuespedes.rejected.match(hueRes)) {
			  errorToast(hueRes.payload || "Error al obtener huéspedes");
			}
		})();
	}, [dispatch, status, errorToast]);

	const data = useMemo(() => reservas, [reservas]);

	// Inputs del formulario dependientes de habitaciones
	const inputOptions = useMemo(
		() => buildReservaInputOptions(habitaciones?.datos ?? []),
		[habitaciones?.datos]
	);

	// Custom fields renderers (inyecta estilos y estado externo necesario)
	const customFields = useMemo(
		() => {
			const { origen, montoPagado } = makeCustomFields({
				labelBaseEstilos,
				inputBaseEstilos,
				habitaciones,
			});
			return {
				origen,
				montoPagado,
			} as const;
		},
		[habitaciones]
	);

	const onSaveEdit = async (updatedRow: any) => {
		try {
			const payload: any = {
				id: String(updatedRow.id),
				idEstadoReserva: updatedRow.idEstadoReserva !== undefined ? Number(updatedRow.idEstadoReserva) : undefined,
				fechaDesde: toISOFromFlexible(updatedRow.fechaDesde),
				fechaHasta: toISOFromFlexible(updatedRow.fechaHasta),
				montoPagado: updatedRow.montoPagado !== undefined ? Number(updatedRow.montoPagado) : undefined,
			};

			Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

			await dispatch(editReserva(payload)).unwrap();
			await dispatch(fetchReservas());
			successToast("Reserva actualizada correctamente.");
		} catch (err: any) {
			errorToast(typeof err === "string" ? err : "Ocurrió un error al actualizar la reserva.");
		}
	};

	const onSaveAdd = async (formData: Record<string, unknown>) => {
		const { huespedMode, idHuesped, nombre, apellido, dni, telefono, email, origen, idHabitacion, fechaDesde, fechaHasta, montoPagado } = formData;

		const countryName = getCountryName(String(origen || "AR"), "es");

		const huesped = {
			nombre: String(nombre || ""),
			apellido: String(apellido || ""),
			dni: String(dni || ""),
			telefono: String(telefono || ""),
			email: String(email || ""),
			origen: countryName,
		};

		// Calcular monto total y asegurar que montoPagado no exceda el total
		const precioPorDia = getPrecioHabitacion(habitaciones, idHabitacion);
		const noches = diffNoches(String(fechaDesde), String(fechaHasta));
		const montoTotal = precioPorDia * noches;
		const pagadoNum = Number(montoPagado) || 0;
		const montoPagadoSeguro = Math.min(pagadoNum, montoTotal);

		const payload = {
			huesped,
			idHabitacion: Number(idHabitacion),
			idEstadoReserva: 1,
			fechaDesde: parseDateWithFallbackISO(String(fechaDesde)),
			fechaHasta: parseDateWithFallbackISO(String(fechaHasta)),
			montoPagado: montoPagadoSeguro,
		} as const;

		try {
			await dispatch(addReserva(payload as any)).unwrap();
			await dispatch(fetchReservas());
			successToast("Reserva creada exitosamente.");
		} catch (err) {
			errorToast(typeof err === "string" ? err : "Error al crear reserva.");
		}
	};

	const onSaveDelete = async (id: string) => {
		try {
			const confirmed = await confirm("Esta acción no se puede deshacer.");
			if (!confirmed) return;
			await dispatch(deleteReserva(id)).unwrap();
			successToast("Reserva eliminada exitosamente.");
		} catch (err) {
			errorToast(typeof err === "string" ? err : "Error al eliminar la reserva.");
		}
	};

	return (
		<div className={pantallaPrincipalEstilos}>
			<div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
				{(() => {
					if (status === StateStatus.loading) return <LoadingSpinner />;
					if (status === StateStatus.failed)
						return <p className="text-center mt-10 text-red-600">Ocurrió un error al cargar las reservas.</p>;

					return (
						<TableComponent<Reserva>
							title="Reservas"
							columns={columns}
							data={data}
							showFormActions
							onSaveEdit={onSaveEdit}
							onSaveAdd={onSaveAdd}
							onSaveDelete={onSaveDelete}
							inputOptions={inputOptions}
							customFields={customFields}
							validationSchemaEdit={reservaEditSchema}
							validationSchemaAdd={reservaAddSchema}
							mapRowToFormData={mapRowToFormDataReservas}
						/>
					);
				})()}
			</div>
		</div>
	);
};

export default Reservas;
