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
import countryList from "react-select-country-list";

const Reservas: React.FC = () => {
	const dispatch = useAppDispatch<AppDispatch>();
	const { reservas, status } = useAppSelector(
		(state: RootState) => state.reservas
	);
	const { errorToast } = useToastAlert();
	const { habitaciones } = useAppSelector((state: RootState) => state);

	const options = useMemo(() => {
		return countryList()
			.getData()
			.map((c) => ({
				value: c.value,
				label: c.label,
				icon: `https://flagcdn.com/w20/${c.value.toLowerCase()}.png`,
			}));
	}, []);

	const inputOptions: FormFieldInputConfig[] = [
		// HUESPED
		{ key: "nombre", label: "Nombre", type: "text" },
		{ key: "apellido", label: "Apellido", type: "text" },
		{ key: "dni", label: "DNI", type: "text" },
		{ key: "telefono", label: "Teléfono", type: "text" },
		{ key: "email", label: "Email", type: "text" },
		{ key: "origen", label: "Origen", type: "select", options },

		// RESERVA
		{
			key: "idHabitacion",
			type: "select",
			label: "Habitación",
			options: habitaciones.datos.map((habitacion) => ({
				value: habitacion.idHabitacion,
				label: `Número ${habitacion.numero}`,
			})),
		},
		{ key: "fechaDesde", label: "Fecha desde", type: "date" },
		{ key: "fechaHasta", label: "Fecha hasta", type: "date" },
		{ key: "montoPagado", label: "Monto Pagado", type: "number" },
	];

	// Fetch de reservas al iniciar
	useEffect(() => {
		if (status !== StateStatus.idle) return;

		const cargarDatos = async () => {
			const [habitacionesRes, reservasRes] = await Promise.all([
				dispatch(fetchHabitaciones({ sortOrder: SortOrder.asc })),
				dispatch(fetchReservas()),
			]);

			if (fetchHabitaciones.rejected.match(habitacionesRes)) {
				errorToast(habitacionesRes.payload || "Error al obtener habitaciones");
			}

			if (fetchReservas.rejected.match(reservasRes)) {
				errorToast(reservasRes.payload || "Error al obtener reservas");
			}
		};

		cargarDatos();
	}, [dispatch, status, errorToast]);

	// Columnas de la tabla
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

	// Datos para la tabla
	const data = useMemo(() => reservas, [reservas]);
	const { successToast } = useToastAlert();

	const onSaveEdit = async () =>
		// formData: Record<string, unknown>,
		// selectedRow: Reserva | null
		{
			// if (!selectedRow) {
			// 	errorToast("No se seleccionó ninguna reserva.");
			// 	return;
			// }
			// const payload = {
			// 	id: selectedRow.id,
			// 	idEstadoReserva: 1, // o algún otro si lo editás
			// 	fechaDesde: new Date(String(formData.fechaDesde)).toISOString(),
			// 	fechaHasta: new Date(String(formData.fechaHasta)).toISOString(),
			// 	montoPagado: Number(formData.montoPagado),
			// };
			// try {
			// 	await dispatch(editReserva(payload)).unwrap();
			// 	successToast("Reserva editada correctamente.");
			// } catch (err) {
			// 	errorToast(typeof err === "string" ? err : "Error al editar la reserva.");
			// }
		};

	const onSaveAdd = async (formData: Record<string, unknown>) => {
		const {
			nombre,
			apellido,
			dni,
			telefono,
			email,
			origen,
			idHabitacion,
			fechaDesde,
			fechaHasta,
			montoPagado,
		} = formData;

		const huesped = {
			nombre: String(nombre),
			apellido: String(apellido),
			dni: String(dni),
			telefono: String(telefono),
			email: String(email),
			origen: String(origen),
		};

		const payload = {
			huesped,
			idHabitacion: Number(idHabitacion),
			idEstadoReserva: 1, // "reservado" o estado inicial
			fechaDesde: new Date(String(fechaDesde)).toISOString(),
			fechaHasta: new Date(String(fechaHasta)).toISOString(),
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

	const { confirm } = useSweetAlert();

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
					if (status === StateStatus.loading) {
						return <LoadingSpinner />;
					}

					if (status === StateStatus.failed) {
						return (
							<p className="text-center mt-10 text-red-600">
								Ocurrió un error al cargar las reservas.
							</p>
						);
					}

					return (
						<TableComponent<Reserva>
							title="Reservas"
							columns={columns}
							data={data}
							showFormActions={true}
							onSaveEdit={onSaveEdit}
							onSaveAdd={onSaveAdd}
							onSaveDelete={onSaveDelete}
							inputOptions={inputOptions}
						/>
					);
				})()}
			</div>
		</div>
	);
};

export default Reservas;
