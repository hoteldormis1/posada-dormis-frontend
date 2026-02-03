import { z } from "zod";

/**
 * Validaciones comunes reutilizables para formularios
 */

// Validación de nombre/apellido (solo letras, acentos y espacios)
export const nombreSchema = z
  .string()
  .min(1, "Este campo es obligatorio")
  .min(2, "Debe tener al menos 2 caracteres")
  .regex(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/, "Solo se permiten letras");

// Validación de DNI argentino (7-8 dígitos)
export const dniSchema = z
  .string()
  .min(1, "El DNI es obligatorio")
  .regex(/^\d{7,8}$/, "El DNI debe tener 7 u 8 dígitos");

// Validación de teléfono (flexible para formatos internacionales)
export const telefonoSchema = z
  .string()
  .min(1, "El teléfono es obligatorio")
  .min(8, "Debe tener al menos 8 caracteres")
  .max(20, "No puede exceder 20 caracteres")
  .regex(/^[\d\s\-\+\(\)]{8,20}$/, "Formato de teléfono inválido");

// Validación de email
export const emailSchema = z
  .string()
  .min(1, "El email es obligatorio")
  .email("Email inválido")
  .toLowerCase();

// Validación de email opcional
export const emailOptionalSchema = z
  .string()
  .email("Email inválido")
  .optional()
  .or(z.literal(""));

// Validación de origen/país
export const origenSchema = z
  .string()
  .min(1, "El país de origen es obligatorio")
  .min(2, "Debe tener al menos 2 caracteres");

// Validación de contraseña
export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
  .regex(/[a-z]/, "Debe contener al menos una minúscula")
  .regex(/[0-9]/, "Debe contener al menos un número");

// Validación de contraseña simple (sin requisitos complejos)
export const passwordSimpleSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres");

// Validación de número positivo
export const numeroPositivoSchema = z
  .coerce
  .number()
  .positive("Debe ser un número positivo");

// Validación de precio/monto
export const precioSchema = z
  .coerce
  .number()
  .min(0, "El monto no puede ser negativo");

// Validación de número de habitación
export const numeroHabitacionSchema = z
  .coerce
  .number()
  .int("Debe ser un número entero")
  .positive("Debe ser un número positivo");

// Validación de fecha en formato DD/MM/YYYY
export const fechaDDMMYYYYSchema = z
  .string()
  .min(1, "La fecha es obligatoria")
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: dd/mm/yyyy");

// Validación de fecha en formato YYYY-MM-DD
export const fechaYYYYMMDDSchema = z
  .string()
  .min(1, "La fecha es obligatoria")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato: yyyy-mm-dd");

// Helper para validar que una fecha sea posterior a otra
export const validarFechaPosterior = (
  fechaInicio: string,
  fechaFin: string,
  formatoDDMMYYYY: boolean = true
): boolean => {
  try {
    let inicio: Date;
    let fin: Date;

    if (formatoDDMMYYYY) {
      const [dayIni, monthIni, yearIni] = fechaInicio.split('/');
      const [dayFin, monthFin, yearFin] = fechaFin.split('/');
      inicio = new Date(Number(yearIni), Number(monthIni) - 1, Number(dayIni));
      fin = new Date(Number(yearFin), Number(monthFin) - 1, Number(dayFin));
    } else {
      inicio = new Date(fechaInicio);
      fin = new Date(fechaFin);
    }

    return fin >= inicio;
  } catch {
    return false;
  }
};

// Schema para huésped (reutilizable)
export const huespedSchema = z.object({
  nombre: nombreSchema,
  apellido: nombreSchema,
  dni: dniSchema,
  telefono: telefonoSchema,
  origen: origenSchema,
});

export type HuespedFormData = z.infer<typeof huespedSchema>;

