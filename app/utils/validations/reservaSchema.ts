import { z } from "zod";

export const reservaAddSchema = z.object({
  // HUESPED
  nombre: z.string().min(1, "Requerido"),
  apellido: z.string().min(1, "Requerido"),
  dni: z.string().min(6, "Mínimo 6 caracteres"),
  telefono: z.string().min(6, "Mínimo 6 caracteres"),
  email: z
    .string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  origen: z.string().min(1, "Requerido"),

  // RESERVA
  idHabitacion: z.coerce.number().int().positive("Seleccione una habitación"),
  fechaDesde: z.string().min(1, "Seleccione la fecha" ),
  fechaHasta: z.string().min(1, "Seleccione la fecha" ),
  montoPagado: z.coerce.number().min(0, "No puede ser negativo"),
}).refine(
  (v) => v.fechaHasta >= v.fechaDesde,
  { path: ["fechaHasta"], message: "La salida debe ser posterior al ingreso" }
);

export type ReservaAddForm = z.infer<typeof reservaAddSchema>;