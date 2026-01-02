import { z } from "zod";
import { huespedSchema } from "./commonValidations";

// Schema para agregar huésped (usa el schema común)
export const huespedAddSchema = huespedSchema;

// Schema para editar huésped
export const huespedEditSchema = huespedSchema;

export type HuespedAddForm = z.infer<typeof huespedAddSchema>;
export type HuespedEditForm = z.infer<typeof huespedEditSchema>;

