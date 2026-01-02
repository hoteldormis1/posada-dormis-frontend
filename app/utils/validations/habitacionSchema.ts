import { z } from "zod";
import { numeroHabitacionSchema, precioSchema, numeroPositivoSchema } from "./commonValidations";

export const habitacionAddSchema = z.object({
  numero: numeroHabitacionSchema,
  tipo: z.string().min(1, "Seleccione un tipo de habitación"),
  capacidad: z.coerce.number().int().min(1, "La capacidad debe ser al menos 1"),
  precio: precioSchema,
  descripcion: z.string().optional(),
});

export const habitacionEditSchema = z.object({
  numero: numeroHabitacionSchema,
  tipo: z.string().min(1, "Seleccione un tipo de habitación"),
  capacidad: z.coerce.number().int().min(1, "La capacidad debe ser al menos 1"),
  precio: precioSchema,
  descripcion: z.string().optional(),
});

export type HabitacionAddForm = z.infer<typeof habitacionAddSchema>;
export type HabitacionEditForm = z.infer<typeof habitacionEditSchema>;
