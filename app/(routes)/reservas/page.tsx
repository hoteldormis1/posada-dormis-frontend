"use client";

import React, { useEffect, useMemo } from "react";
import { inputBaseEstilos, labelBaseEstilos, pantallaPrincipalEstilos } from "@/styles/global-styles";
import { LoadingSpinner, TableComponent } from "@/components";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import {
	addReserva,
	deleteReserva,
	editReserva,
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

// ===== Helpers =====
const isISO = (s?: string) => !!s && /\d{4}-\d{2}-\d{2}/.test(s);
const isDDMMYYYY = (s?: string) => !!s && /\d{2}\/\d{2}\/\d{4}/.test(s);

const toDateInputValue = (iso?: string) => {
	if (!iso) return "";
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
};

const parseDDMMYYYY = (s?: string) => {
	if (!isDDMMYYYY(s)) return null;
	const [dd, mm, yyyy] = String(s).split("/");
	const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 12, 0, 0, 0);
	return isNaN(d.getTime()) ? null : d;
};

const diffNoches = (desde?: string, hasta?: string) => {
	const d1 = parseDDMMYYYY(desde);
	const d2 = parseDDMMYYYY(hasta);
	if (!d1 || !d2) return 1;
	const ms = d2.getTime() - d1.getTime();
	return Math.max(Math.ceil(ms / (1000 * 60 * 60 * 24)), 1);
};

const getPrecioHabitacion = (habitaciones: any, idHabitacion: any) => {
	const hab = habitaciones?.datos?.find(
		(h: any) => Number(h.idHabitacion) === Number(idHabitacion)
	);
	return typeof hab?.precio === "number" ? hab.precio : 1000;
};

const Reservas: React.FC = () => {
	const dispatch = useAppDispatch<AppDispatch>();
	const { reservas, status } = useAppSelector((state: RootState) => state.reservas);
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

	// Inputs del formulario (con fallback a [] por si aún no cargó habitaciones)
	const inputOptions: FormFieldInputConfig[] = useMemo(
		() => [
			// HUESPED
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
				options: (habitaciones?.datos ?? []).map((h: any) => ({
					value: h.idHabitacion,
					label: `Número ${h.numero}`,
				})),
			},
			{ key: "fechaDesde", label: "Fecha desde", type: "date", editable: false }, // dd/MM/yyyy desde tu DynamicInputField
			{ key: "fechaHasta", label: "Fecha hasta", type: "date", editable: false },
			{ key: "montoPagado", label: "Monto Pagado", type: "custom", editable: true }, // Solo este campo es editable en modo edición
		],
		[habitaciones?.datos]
	);

	// Carga inicial
	useEffect(() => {
		if (status !== StateStatus.idle) return;

		(async () => {
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
		})();
	}, [dispatch, status, errorToast]);

	const data = useMemo(() => reservas, [reservas]);

	// Mapea fila -> formData para editar
	const mapRowToFormData = (reserva: Reserva) => {
		const nombreCompleto = reserva.huespedNombre || "";
		const [nombre, ...apellidos] = nombreCompleto.split(" ");
		const apellido = apellidos.join(" ") || "";

		const fechaDesdeForm = isDDMMYYYY(reserva.ingreso)
			? reserva.ingreso
			: isISO(reserva.ingreso)
				? toDateInputValue(reserva.ingreso)
				: "";
		const fechaHastaForm = isDDMMYYYY(reserva.egreso)
			? reserva.egreso
			: isISO(reserva.egreso)
				? toDateInputValue(reserva.egreso)
				: "";

		return {
			// Huesped
			nombre,
			apellido,
			dni: reserva.dniHuesped || "",
			email: reserva.emailHuesped || "",
			telefono: reserva.telefonoHuesped || "",
			origen: "AR",

			// Reserva
			idHabitacion: String((reserva as any).idHabitacion ?? ""),
			fechaDesde: fechaDesdeForm,
			fechaHasta: fechaHastaForm,
			montoPagado: String(reserva.montoPagado ?? ""),
		};
	};

	// Custom renderers
	const customFields = {
		origen: (value: string, onChange: (v: string) => void, ctx?: { disabled?: boolean }) => {
			const selected = value || "AR";
			return (
				<div className="flex flex-col gap-1">
					<label className={labelBaseEstilos}>Origen</label>
					<ReactFlagsSelect
						selected={selected}
						onSelect={(code) => onChange(code)}
						searchable
						placeholder="Seleccioná un país"
						className={ctx?.disabled ? "opacity-60 cursor-not-allowed" : ""}
						disabled={ctx?.disabled}
					/>
				</div>
			);
		},

		montoPagado: (
			value: string,
			onChange: (v: string) => void,
			ctx?: { formData?: Record<string, any>; mode?: "add" | "edit"; row?: any; disabled?: boolean }
		) => {
			const mode = ctx?.mode || "add";

			// Datos del form (para ADD) y de la fila (para EDIT)
			const idHabitacionSel = ctx?.formData?.idHabitacion;
			const fechaDesdeSel = ctx?.formData?.fechaDesde;
			const fechaHastaSel = ctx?.formData?.fechaHasta;

			// Cálculo "normal" (ADD): precio * noches
			const precio = getPrecioHabitacion(habitaciones, idHabitacionSel);
			const noches = diffNoches(String(fechaDesdeSel || ""), String(fechaHastaSel || ""));
			const montoCalculado = precio * noches;

			// En EDIT, el tope debe ser el total de la reserva
			const totalDeReserva = typeof ctx?.row?.total === "number" ? ctx.row.total : Number(ctx?.row?.total || 0);

			// MAX según modo
			const maxValue =
				mode === "edit"
					? Math.max(totalDeReserva, 1) || 1
					: Math.max(montoCalculado, 1) || 1;

			// Valor actual (inicializaciones)
			let currentValue = Number(value || 0);

			if (mode === "add" && currentValue === 0 && montoCalculado > 0) {
				currentValue = montoCalculado;
				setTimeout(() => onChange(String(currentValue)), 0);
			}

			if (mode === "edit" && currentValue === 0) {
				const rowMontoPagado = Number(ctx?.row?.montoPagado || 0);
				currentValue = rowMontoPagado;
				setTimeout(() => onChange(String(currentValue)), 0);
			}

			// Siempre capear al máximo definido para el modo actual
			currentValue = Math.min(currentValue, maxValue);

			const isDisabled = ctx?.disabled || false;
			const step = Math.max(Math.round(maxValue / 100), 1); // ~100 posiciones

			return (
				<div className="flex flex-col gap-2">
					<label className={`${labelBaseEstilos} flex justify-between`}>
						<span>Monto Pagado</span>
						<span className="text-xs text-[var(--color-muted)] dark:text-gray-300">
							${currentValue.toLocaleString()} / ${maxValue.toLocaleString()}
						</span>
					</label>

					{/* Slider */}
					<input
						type="range"
						value={currentValue}
						min={0}
						max={maxValue}
						step={step}
						onChange={(e) => onChange(e.target.value)}
						disabled={isDisabled}
						className={`w-full accent-[var(--color-main)] ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
						aria-label="Control deslizante de monto pagado"
					/>

					{/* Input numérico para precisión */}
					<div className="flex items-center gap-2">
						<input
							type="number"
							inputMode="numeric"
							value={currentValue}
							min={0}
							max={maxValue}
							step={1}
							onChange={(e) => {
								const v = Number(e.target.value || 0);
								const safe = Math.min(Math.max(v, 0), maxValue);
								onChange(String(safe));
							}}
							disabled={isDisabled}
							className={`${inputBaseEstilos} w-40 ${isDisabled ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}`}
							placeholder="Ingrese el monto"
						/>

						{/* Botón Auto */}
						<button
							type="button"
							onClick={() => {
								// En EDIT, “Auto” pone el total de la reserva; en ADD, recalcula por noches × precio
								const auto = mode === "edit" ? maxValue : montoCalculado;
								onChange(String(auto));
							}}
							disabled={isDisabled}
							className={`px-3 py-2 text-sm bg-[var(--color-main)] text-white rounded-md hover:bg-opacity-90 transition-colors ${isDisabled ? "opacity-60 cursor-not-allowed" : ""
								}`}
							title={mode === "edit" ? "Usar total de la reserva" : "Calcular (precio × noches)"}
						>
							Auto
						</button>
					</div>

					{/* Nota auxiliar */}
					<div className="text-xs text-[var(--color-muted)] dark:text-gray-400">
						{mode === "edit" ? (
							<>Total de la reserva: ${maxValue.toLocaleString()}</>
						) : (
							<>Precio por noche: ${precio.toLocaleString()} · Noches: {noches} · Total: ${montoCalculado.toLocaleString()}</>
						)}
					</div>
				</div>
			);
		},


	};

	const onSaveEdit = async (updatedRow: any) => {
		console.log(updatedRow);
		
		// helper: dd/MM/yyyy -> ISO
		const toISO = (s?: string) => {
		  if (!s) return undefined;
		  if (isDDMMYYYY(s)) {
			const [dd, mm, yyyy] = s.split("/");
			const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
			return isNaN(d.getTime()) ? undefined : d.toISOString();
		  }
		  if (isISO(s)) return s; // ya viene como YYYY-MM-DD (o ISO)
		  const d = new Date(s);
		  return isNaN(d.getTime()) ? undefined : d.toISOString();
		};
	  
		try {
		  const payload = {
			id: String(updatedRow.id),
	  
			// Solo campos que realmente podrías editar desde el form
			idEstadoReserva:
			  updatedRow.idEstadoReserva !== undefined
				? Number(updatedRow.idEstadoReserva)
				: undefined,
	  
			fechaDesde: toISO(updatedRow.fechaDesde),
			fechaHasta: toISO(updatedRow.fechaHasta),
	  
			montoPagado:
			  updatedRow.montoPagado !== undefined
				? Number(updatedRow.montoPagado)
				: undefined,
		  };
	  
		  // Limpia undefined para no sobreescribir en backend
		  Object.keys(payload).forEach(
			(k) => (payload as any)[k] === undefined && delete (payload as any)[k]
		  );
	  
		  await dispatch(editReserva(payload as any)).unwrap();
		  await dispatch(fetchReservas());
	  
		  successToast("Reserva actualizada correctamente.");
		} catch (err: any) {
		  errorToast(typeof err === "string" ? err : "Ocurrió un error al actualizar la reserva.");
		}
	  };
	  

	const getCountryName = (code: string, locale = "es") => {
		try {
			const dn = new Intl.DisplayNames([locale], { type: "region" });
			return dn.of(code) || code;
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
			origen,
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

		// Calcular monto total y asegurar que montoPagado no exceda el total
		const precioPorDia = getPrecioHabitacion(habitaciones, idHabitacion);
		const noches = diffNoches(String(fechaDesde), String(fechaHasta));
		const montoTotal = precioPorDia * noches;
		const pagadoNum = Number(montoPagado) || 0;
		const montoPagadoSeguro = Math.min(pagadoNum, montoTotal);

		const parseDate = (dateString: string) => {
			if (!dateString) return new Date().toISOString();
			if (isDDMMYYYY(dateString)) {
				const [day, month, year] = dateString.split("/");
				const date = new Date(Number(year), Number(month) - 1, Number(day));
				return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
			}
			const d = new Date(dateString);
			return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
		};

		const payload = {
			huesped,
			idHabitacion: Number(idHabitacion),
			idEstadoReserva: 1,
			fechaDesde: parseDate(String(fechaDesde)),
			fechaHasta: parseDate(String(fechaHasta)),
			montoPagado: montoPagadoSeguro,
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
