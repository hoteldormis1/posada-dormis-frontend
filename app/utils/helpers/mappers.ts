import { Reserva } from "@/models/types";
import { isDDMMYYYY, isISO, isoToDDMMYYYY } from "@/utils/helpers/date";

export const mapRowToFormDataReservas = (reserva: Reserva) => {
  const nombreCompleto = reserva.huespedNombre || "";
  const [nombre, ...apellidos] = nombreCompleto.split(" ");
  const apellido = apellidos.join(" ") || "";

  const fechaDesdeRaw = String((reserva as any).fechaDesde || "");
  const fechaHastaRaw = String((reserva as any).fechaHasta || "");

  const fechaDesdeForm = isISO(fechaDesdeRaw)
    ? isoToDDMMYYYY(fechaDesdeRaw)
    : isDDMMYYYY(reserva.ingreso)
    ? reserva.ingreso
    : isISO(reserva.ingreso)
    ? isoToDDMMYYYY(reserva.ingreso)
    : "";
  const fechaHastaForm = isISO(fechaHastaRaw)
    ? isoToDDMMYYYY(fechaHastaRaw)
    : isDDMMYYYY(reserva.egreso)
    ? reserva.egreso
    : isISO(reserva.egreso)
    ? isoToDDMMYYYY(reserva.egreso)
    : "";

  return {
    // Selector de tipo de huésped para que el formulario de edición no quede inconsistente
    huespedMode: "existente",
    idHuesped: String((reserva as any).idHuesped ?? ""),
    idEstadoReserva: String((reserva as any).idEstadoReserva ?? ""),

    // Huésped
    nombre,
    apellido,
    dni: reserva.dniHuesped || "",
    telefono: reserva.telefonoHuesped || "",
    origen: String((reserva as any).origenHuesped || "AR"),
    direccion: String((reserva as any).direccionHuesped || ""),

    // Reserva
    idHabitacion: String((reserva as any).idHabitacion ?? ""),
    fechaDesde: fechaDesdeForm,
    fechaHasta: fechaHastaForm,
    montoPagado: String(reserva.montoPagado ?? ""),
  } as Record<string, string>;
};
