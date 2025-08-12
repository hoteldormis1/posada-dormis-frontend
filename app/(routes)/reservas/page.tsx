"use client";

import React, { useEffect, useMemo } from "react";
import { pantallaPrincipalEstilos } from "@/styles/global-styles";
import { LoadingSpinner, TableComponent } from "@/components";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import {
	addReserva,
	deleteReserva,
	fetchReservas,
} from "@/lib/store/utils/reservas/reservasSlice";
import { useToastAlert } from "@/hooks/useToastAlert";
import {
	FormFieldInputConfig,
	Reserva,
	SortOrder,
	StateStatus,
} from "@/models/types";
import { fetchHabitaciones } from "@/lib/store/utils/habitaciones/habitacionesSlice";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import ReactFlagsSelect from "react-flags-select";
import { reservaAddSchema, reservaEditSchema } from "@/utils/validations/reservaSchema";
import { log } from "console";

const Reservas: React.FC = () => {
	const dispatch = useAppDispatch<AppDispatch>();
	const { reservas, status } = useAppSelector(
		(state: RootState) => state.reservas
	);
	const { habitaciones } = useAppSelector((state: RootState) => state);
	const { errorToast, successToast } = useToastAlert();
	const { confirm } = useSweetAlert();

	// Columnas
	const columns = useMemo(
		() => [
			{ header: "Habitación", key: "numeroHab" },
			{ header: "Fecha de ingreso", key: "ingreso" },
			{ header: "Fecha de salida", key: "egreso" },
			{ header: "Huésped", key: "huespedNombre" },
			{ header: "Teléfono", key: "telefonoHuesped" },
			{ header: "Monto pagado", key: "montoPagado" },
			{ header: "Total", key: "total" },
			{ header: "Estado", key: "estadoDeReserva" },
		],
		[]
	);

	// Inputs del formulario (sacamos el select "origen" normal y lo renderizamos con ReactFlagsSelect)
	const inputOptions: FormFieldInputConfig[] = useMemo(
		() => [
			// HUESPED
			{ key: "nombre", label: "Nombre", type: "text" },
			{ key: "apellido", label: "Apellido", type: "text" },
			{ key: "dni", label: "DNI", type: "text" },
			{ key: "telefono", label: "Teléfono", type: "text" },
			{ key: "email", label: "Email", type: "text" },
			// 👇 Dejá el key "origen" pero como "custom" (o un type que tu TableComponent ignore),
			// para que lo pinte `customFields.origen` con ReactFlagsSelect
			{ key: "origen", label: "Origen", type: "custom" },

			// RESERVA
			{
				key: "idHabitacion",
				type: "select",
				label: "Habitación",
				options: habitaciones.datos.map((h) => ({
					value: h.idHabitacion,
					label: `Número ${h.numero}`,
				})),
			},
			{ key: "fechaDesde", label: "Fecha desde", type: "date" },
			{ key: "fechaHasta", label: "Fecha hasta", type: "date" },
			{ key: "montoPagado", label: "Monto Pagado", type: "number" },
		],
		[habitaciones.datos]
	);

	// Carga inicial
	useEffect(() => {
		if (status !== StateStatus.idle) return;

		const cargar = async () => {
			const [habRes, resRes] = await Promise.all([
				dispatch(fetchHabitaciones({ sortOrder: SortOrder.asc })),
				dispatch(fetchReservas()),
			]);

			if (fetchHabitaciones.rejected.match(habRes)) {
				errorToast(habRes.payload || "Error al obtener habitaciones");
			}
			if (fetchReservas.rejected.match(resRes)) {
				errorToast(resRes.payload || "Error al obtener reservas");
			}
		};
		cargar();
	}, [dispatch, status, errorToast]);

	const data = useMemo(() => reservas, [reservas]);

	// Helper para convertir fecha ISO a formato YYYY-MM-DD (válido para <input type="date">)
	const toDateInputValue = (iso?: string) => {
		if (!iso) return "";
		const d = new Date(iso);
		if (Number.isNaN(d.getTime())) return "";
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		return `${y}-${m}-${day}`;
	};
	
	// Mapea la reserva a los campos del formulario de edición
	const mapRowToFormData = (reserva: Reserva) => {
		// Separar nombre y apellido del campo huespedNombre
		const nombreCompleto = reserva.huespedNombre || "";
		const [nombre, ...apellidos] = nombreCompleto.split(" ");
		const apellido = apellidos.join(" ") || "";

		return {
		// Datos del huésped
		nombre: nombre,
		apellido: apellido,
		dni: reserva.dniHuesped || "", 
		email: reserva.emailHuesped || "", 
		telefono: reserva.telefonoHuesped || "",
		origen: "AR", 
	
		// Datos de la reserva
		idHabitacion: String((reserva as any).idHabitacion ?? ""), 
		fechaDesde: toDateInputValue(reserva.ingreso),
		fechaHasta: toDateInputValue(reserva.egreso),
		montoPagado: String(reserva.montoPagado ?? ""),
		};
	};

	// Custom renderer para el campo "origen" con banderas
	const customFields = {
		origen: (value: string, onChange: (v: string) => void) => {
			const selected = value || "AR";
			return (
				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-[var(--color-text)] dark:text-white">
						Origen
					</label>
					<ReactFlagsSelect
						selected={selected}
						onSelect={(code) => onChange(code)}
						searchable
						placeholder="Seleccioná un país"
					/>
				</div>
			);
		},
	};

	// Guardado de edición (dejado como stub)
	const onSaveEdit = async () => {
		// si más adelante editás el origen, ya estás cubierto porque `customFields.origen` lo renderiza
	};

	const getCountryName = (code: string, locale = "es") => {
		try {
			const dn = new Intl.DisplayNames([locale], { type: "region" });
			return dn.of(code) || code; // fallback al código si no resuelve
		} catch {
			return code;
		}
	};

	const onSaveAdd = async (formData: Record<string, unknown>) => {
		const {
			nombre,
			apellido,
			dni,
			telefono,
			email,
			idHabitacion,
			fechaDesde,
			fechaHasta,
			montoPagado,
			origen, // ← viene como "AR", "BR", etc.
		} = formData;

		const countryName = getCountryName(String(origen || "AR"), "es");

		const huesped = {
			nombre: String(nombre || ""),
			apellido: String(apellido || ""),
			dni: String(dni || ""),
			telefono: String(telefono || ""),
			email: String(email || ""),
			origen: countryName, 
		};



		// Convertir fechas de formato dd/mm/yyyy a ISO
		const parseDate = (dateString: string) => {
			if (!dateString) return new Date().toISOString();
			
			try {
				// Parsear formato dd/mm/yyyy
				const [day, month, year] = dateString.split('/');
				const date = new Date(Number(year), Number(month) - 1, Number(day));
				
				if (isNaN(date.getTime())) {
					throw new Error('Invalid date');
				}
				
				return date.toISOString();
			} catch (error) {
				console.warn('Error parsing date:', dateString, error);
				return new Date().toISOString();
			}
		};

		const payload = {
			huesped,
			idHabitacion: Number(idHabitacion),
			idEstadoReserva: 1,
			fechaDesde: parseDate(String(fechaDesde)),
			fechaHasta: parseDate(String(fechaHasta)),
			montoPagado: Number(montoPagado),
		};

		try {
			await dispatch(addReserva(payload)).unwrap();
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
						return (
							<p className="text-center mt-10 text-red-600">
								Ocurrió un error al cargar las reservas.
							</p>
						);

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
							validationSchema={reservaEditSchema}
							validationSchemaAdd={reservaAddSchema}
							mapRowToFormData={mapRowToFormData}
						/>
					);
				})()}
			</div>
		</div>
	);
};

export default Reservas;
