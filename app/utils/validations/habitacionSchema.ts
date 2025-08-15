import { z } from "zod";

export const habitacionAddSchema = z.object({
  numero: z.coerce.number().int().positive("El número debe ser positivo"),
  tipo: z.string().min(1, "Seleccione un tipo de habitación"),
  capacidad: z.coerce.number().int().min(1, "La capacidad debe ser al menos 1"),
  precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
  descripcion: z.string().optional(),
});

export const habitacionEditSchema = z.object({
  numero: z.coerce.number().int().positive("El número debe ser positivo"),
  tipo: z.string().min(1, "Seleccione un tipo de habitación"),
  capacidad: z.coerce.number().int().min(1, "La capacidad debe ser al menos 1"),
  precio: z.coerce.number().min(0, "El precio no puede ser negativo"),
  descripcion: z.string().optional(),
});

export type HabitacionAddForm = z.infer<typeof habitacionAddSchema>;
export type HabitacionEditForm = z.infer<typeof habitacionEditSchema>;
