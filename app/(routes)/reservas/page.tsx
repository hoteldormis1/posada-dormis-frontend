"use client";

import React, { useEffect, useMemo } from "react";
import { inputBaseEstilos, labelBaseEstilos, pantallaPrincipalEstilos } from "@/styles/global-styles";
import { LoadingSpinner, TableComponent } from "@/components";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchHuespedes } from "@/lib/store/utils/index";
import { useToastAlert } from "@/hooks/useToastAlert";
import { FormFieldInputConfig, Reserva, SortOrder } from "@/models/types";
import { fetchHabitaciones } from "@/lib/store/utils/habitaciones/habitacionesSlice";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { reservaAddSchema, reservaEditSchema } from "@/utils/validations/reservaSchema";
import { mapRowToFormDataReservas } from "@/utils/helpers/mappers";
import { getCountryName } from "@/utils/helpers/format";
import { diffNoches, toISOFromFlexible, parseDateWithFallbackISO } from "@/utils/helpers/date";
import { getPrecioHabitacion } from "@/utils/helpers/money";
import makeCustomFields from "@/components/reservas/makeCustomFields";
import { hasPermission } from "@/utils/helpers/permissions";
import { useGetReservasQuery, useAddReservaMutation, useEditReservaMutation, useDeleteReservaMutation } from "@/lib/store/api/reservasApi";

const Reservas: React.FC = () => {
	const dispatch = useAppDispatch<AppDispatch>();
	const { datos: huespedes } = useAppSelector((state: RootState) => state.huespedes);
	const { habitaciones } = useAppSelector((state: RootState) => state);
	const { errorToast, successToast } = useToastAlert();
	const { confirm } = useSweetAlert();
	const { data: reservas = [], isFetching, isError, refetch } = useGetReservasQuery();
	const [createReserva] = useAddReservaMutation();
	const [updateReserva] = useEditReservaMutation();
	const [removeReserva] = useDeleteReservaMutation();

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

	const estadosDeReserva = useAppSelector((state: RootState) => state.habitaciones.estadosDeReserva);

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
		{
			key: "idEstadoReserva",
			type: "select",
			label: "Estado de Reserva",
			options: estadosDeReserva.map((estado: any) => {
				return {
					value: estado.idEstadoReserva,
					label: estado.nombre.charAt(0).toUpperCase() + estado.nombre.slice(1),
				}
			}),
			editable: true
		},
		{ key: "montoPagado", label: "Monto Pagado", type: "custom", editable: true },
	];

	// Carga inicial de catálogos dependientes
	useEffect(() => {
		(async () => {
			const [habRes, hueRes] = await Promise.all([
				dispatch(fetchHabitaciones({ sortOrder: SortOrder.asc })),
				dispatch(fetchHuespedes()),
			]);

			if (fetchHabitaciones.rejected.match(habRes)) {
				errorToast(habRes.payload || "Error al obtener habitaciones");
			}
			if (fetchHuespedes.rejected.match(hueRes)) {
				errorToast(hueRes.payload || "Error al obtener huéspedes");
			}
		})();
	}, [dispatch, errorToast]);

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

			await updateReserva(payload).unwrap();
			await refetch();
			successToast("Reserva actualizada correctamente.");
		} catch (err: any) {
			errorToast(typeof err === "string" ? err : "Ocurrió un error al actualizar la reserva.");
		}
	};

	const onSaveAdd = async (formData: Record<string, unknown>) => {
		const {
			huespedMode, idHuesped,
			nombre, apellido, dni, telefono, email, origen,
			idHabitacion, idEstadoReserva, fechaDesde, fechaHasta, montoPagado
		} = formData;

		const countryName = getCountryName(String(origen || "AR"), "es");

		// cálculo del monto total
		const precioPorDia = getPrecioHabitacion(habitaciones, idHabitacion);
		const noches = diffNoches(String(fechaDesde), String(fechaHasta));
		const montoTotal = precioPorDia * noches;
		const pagadoNum = Number(montoPagado) || 0;
		const montoPagadoSeguro = Math.min(pagadoNum, montoTotal);

		// base del payload
		const payload: any = {
			idHabitacion: Number(idHabitacion),
			idEstadoReserva: Number(idEstadoReserva),
			fechaDesde: parseDateWithFallbackISO(String(fechaDesde)),
			fechaHasta: parseDateWithFallbackISO(String(fechaHasta)),
			montoPagado: montoPagadoSeguro,
		};

		if (huespedMode === "existente") {
			payload.idHuesped = Number(idHuesped);   // ✅ acá va
		} else {
			payload.huesped = {
				nombre: String(nombre || ""),
				apellido: String(apellido || ""),
				dni: String(dni || ""),
				telefono: String(telefono || ""),
				email: String(email || ""),
				origen: countryName,
			};
		}

		try {
			await createReserva(payload).unwrap();
			await refetch();
			successToast("Reserva creada exitosamente.");
		} catch (err) {
			errorToast(typeof err === "string" ? err : "Error al crear reserva.");
		}
	};


	const onSaveDelete = async (id: string) => {
		try {
			const confirmed = await confirm("Esta acción no se puede deshacer.");
			if (!confirmed) return;
			await removeReserva(id).unwrap();
			successToast("Reserva eliminada exitosamente.");
		} catch (err) {
			errorToast(typeof err === "string" ? err : "Error al eliminar la reserva.");
		}
	};

	const { currentUser } = useAppSelector((state: RootState) => state.user);
	const {tiposUsuarios} = useAppSelector((state: RootState) => state.user);
	const idTipoUsuarioActual = currentUser?.idTipoUsuario;
	const puedeBorrar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "reserva", "delete");
	const puedeEditar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "reserva", "update");
	const puedeAgregar = hasPermission(tiposUsuarios, idTipoUsuarioActual, "reserva", "create");

	return (
		<div className={pantallaPrincipalEstilos}>
			<div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
				{(() => {
					if (isFetching) return <LoadingSpinner />;
					if (isError)
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
							showActions={{create: puedeAgregar, delete: puedeBorrar, edit: puedeEditar}}
						/>
					);
				})()}
			</div>
		</div>
	);
};

export default Reservas;
