import { z } from "zod";
import { emailSchema, passwordSchema, passwordSimpleSchema } from "./commonValidations";

// Schema para login
export const loginSchema = z.object({
  email: emailSchema,
  clave: z.string().min(1, "La contraseña es obligatoria"),
});

// Schema para recuperar contraseña
export const recuperarPasswordSchema = z.object({
  email: emailSchema,
});

// Schema para resetear contraseña
export const resetPasswordSchema = z.object({
  password: passwordSimpleSchema,
  passwordConfirm: passwordSimpleSchema,
}).refine((data) => data.password === data.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "Las contraseñas no coinciden",
});

// Schema para verificar cuenta
export const verificarCuentaSchema = z.object({
  password: passwordSimpleSchema,
  passwordConfirm: passwordSimpleSchema,
}).refine((data) => data.password === data.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "Las contraseñas no coinciden",
});

// Schema para cambiar contraseña
export const cambiarPasswordSchema = z.object({
  passwordActual: z.string().min(1, "La contraseña actual es obligatoria"),
  passwordNueva: passwordSimpleSchema,
  passwordConfirm: passwordSimpleSchema,
}).refine((data) => data.passwordNueva === data.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "Las contraseñas no coinciden",
}).refine((data) => data.passwordActual !== data.passwordNueva, {
  path: ["passwordNueva"],
  message: "La nueva contraseña debe ser diferente a la actual",
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RecuperarPasswordForm = z.infer<typeof recuperarPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type VerificarCuentaForm = z.infer<typeof verificarCuentaSchema>;
export type CambiarPasswordForm = z.infer<typeof cambiarPasswordSchema>;

