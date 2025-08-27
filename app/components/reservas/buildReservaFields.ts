import { FormFieldInputConfig, Option } from "./types";
import { EstadoReserva, Habitacion } from "@/models/types"; // tus tipos

export function buildReservaFields(
  habitaciones: Habitacion[],
  estados: EstadoReserva[],
  huespedesOpts: Option[]
): FormFieldInputConfig[] {
  return [
    // Selector de modo
    {
      key: "huespedMode",
      type: "select",
      label: "Tipo de huésped",
      options: [
        { value: "existente", label: "Huésped existente" },
        { value: "nuevo", label: "Nuevo huésped" },
      ],
      editable: true,
    },

    // Huesped existente (visible sólo si modo = existente)
    {
      key: "idHuesped",
      type: "select",
      label: "Seleccionar huésped",
      options: huespedesOpts,
      editable: true,
      visibleWhen: ({ formData }) => formData.huespedMode === "existente",
    },

    // Campos del huésped (sólo si modo = nuevo)
    { key: "nombre",   type: "text",  label: "Nombre",  editable: true, visibleWhen: ({ formData }) => formData.huespedMode !== "existente" },
    { key: "apellido", type: "text",  label: "Apellido", editable: true, visibleWhen: ({ formData }) => formData.huespedMode !== "existente" },
    { key: "dni",      type: "text",  label: "DNI",      editable: true, visibleWhen: ({ formData }) => formData.huespedMode !== "existente" },
    { key: "telefono", type: "text",  label: "Teléfono", editable: true, visibleWhen: ({ formData }) => formData.huespedMode !== "existente" },
    { key: "email",    type: "text",  label: "Email",    editable: true, visibleWhen: ({ formData }) => formData.huespedMode !== "existente" },
    { key: "origen",   type: "custom",label: "Origen",   editable: true, visibleWhen: ({ formData }) => formData.huespedMode !== "existente" },

    // Reserva
    {
      key: "idHabitacion",
      type: "select",
      label: "Habitación",
      editable: true,
      options: (habitaciones ?? []).map((h) => ({
        value: h.idHabitacion,
        label: `Número ${h.numero}`,
      })),
    },
    { key: "fechaDesde", type: "date", label: "Fecha desde", editable: true },
    { key: "fechaHasta", type: "date", label: "Fecha hasta", editable: true },

    {
      key: "idEstadoReserva",
      type: "select",
      label: "Estado de Reserva",
      editable: true,
      options: estados.map((e) => ({
        value: e.idEstadoReserva,
        label: e.nombre.charAt(0).toUpperCase() + e.nombre.slice(1),
      })),
    },

    { key: "montoPagado", type: "custom", label: "Monto Pagado", editable: true },
  ];
}