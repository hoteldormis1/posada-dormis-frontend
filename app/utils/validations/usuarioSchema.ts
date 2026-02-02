import { z } from "zod";
import { emailSchema, nombreSchema } from "./commonValidations";

// Schema para invitar usuario
export const invitarUsuarioSchema = z.object({
  nombre: nombreSchema,
  email: emailSchema,
  tipoUsuario: z.string().min(1, "Seleccione un tipo de usuario"),
});

// Schema para editar usuario
export const editarUsuarioSchema = z.object({
  nombre: nombreSchema,
  email: emailSchema,
  tipoUsuario: z.string().min(1, "Seleccione un tipo de usuario"),
  activo: z.boolean().optional(),
});

export type InvitarUsuarioForm = z.infer<typeof invitarUsuarioSchema>;
export type EditarUsuarioForm = z.infer<typeof editarUsuarioSchema>;

