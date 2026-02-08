import { Reserva } from "@/models/types";
import { isDDMMYYYY, isISO, toDateInputValue } from "@/utils/helpers/date";

export const mapRowToFormDataReservas = (reserva: Reserva) => {
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
    // Huésped
    nombre,
    apellido,
    dni: reserva.dniHuesped || "",
    telefono: reserva.telefonoHuesped || "",
    origen: "AR",

    // Reserva
    idHabitacion: String((reserva as any).idHabitacion ?? ""),
    fechaDesde: fechaDesdeForm,
    fechaHasta: fechaHastaForm,
    montoPagado: String(reserva.montoPagado ?? ""),
  } as Record<string, string>;
};
