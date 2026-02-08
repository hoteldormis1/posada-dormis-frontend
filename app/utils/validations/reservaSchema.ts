import { z } from "zod";
import { 
  nombreSchema, 
  dniSchema, 
  telefonoSchema, 
  origenSchema,
  fechaDDMMYYYYSchema,
  precioSchema,
  validarFechaPosterior
} from "./commonValidations";

// Schema base para reserva que se adapta según el modo de huésped
export const reservaAddSchema = z
	.object({
		// Modo de huésped
		huespedMode: z.enum(["nuevo", "existente"]).optional(),
		
		// HUESPED EXISTENTE (opcional)
		idHuesped: z.any().optional(),
		
		// HUESPED NUEVO (campos que aceptan cualquier tipo, validación real en superRefine)
		nombre: z.coerce.string().optional(),
		apellido: z.coerce.string().optional(),
		dni: z.coerce.string().optional(),
		telefono: z.coerce.string().optional(),
		origen: z.coerce.string().optional(),

		// RESERVA (siempre requeridos)
		idHabitacion: z.coerce.number().int().positive("Seleccione una habitación"),
		fechaDesde: fechaDDMMYYYYSchema,
		fechaHasta: fechaDDMMYYYYSchema,
		montoPagado: precioSchema,
	})
	.superRefine((data, ctx) => {
		// Validar fechas
		if (!validarFechaPosterior(data.fechaDesde, data.fechaHasta, true)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["fechaHasta"],
				message: "La salida debe ser posterior al ingreso",
			});
		}

		// Validación condicional según el modo de huésped
		if (data.huespedMode === "existente") {
			// Si es huésped existente, debe tener idHuesped
			if (!data.idHuesped || String(data.idHuesped).trim() === "") {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["idHuesped"],
					message: "Seleccione un huésped",
				});
			}
			// No validar otros campos de huésped en modo existente
		} else {
			// Si es nuevo huésped o no se especificó modo, validar todos los campos
			const validarNombre = nombreSchema.safeParse(data.nombre);
			if (!validarNombre.success) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["nombre"],
					message: validarNombre.error.issues[0]?.message || "Campo requerido",
				});
			}

			const validarApellido = nombreSchema.safeParse(data.apellido);
			if (!validarApellido.success) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["apellido"],
					message: validarApellido.error.issues[0]?.message || "Campo requerido",
				});
			}

			const validarDni = dniSchema.safeParse(data.dni);
			if (!validarDni.success) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["dni"],
					message: validarDni.error.issues[0]?.message || "Campo requerido",
				});
			}

			const validarTelefono = telefonoSchema.safeParse(data.telefono);
			if (!validarTelefono.success) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["telefono"],
					message: validarTelefono.error.issues[0]?.message || "Campo requerido",
				});
			}

			const validarOrigen = origenSchema.safeParse(data.origen);
			if (!validarOrigen.success) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["origen"],
					message: validarOrigen.error.issues[0]?.message || "Campo requerido",
				});
			}
		}
	});

export const reservaEditSchema = z
	.object({
		// HUESPED
		/*nombre: z.string().min(1, "Campo requerido"),
		apellido: z.string().min(1, "Campo requerido"),
		dni: z.string().min(6, "Mínimo 6 caracteres"),
		telefono: z.string().min(6, "Mínimo 6 caracteres"),
		email: z.string().email("Email inválido").optional(),
		origen: z.string().min(1, "Campo requerido"),

		// RESERVA
		idHabitacion: z.coerce.number().int().positive("Seleccione una habitación"),
		fechaDesde: z.string().min(1, "Ingrese la fecha").regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: dd/mm/yyyy"),
		fechaHasta: z.string().min(1, "Ingrese la fecha").regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: dd/mm/yyyy"),*/
		montoPagado: z.coerce.number().positive("Campo requerido"),
	})

export type ReservaAddForm = z.infer<typeof reservaAddSchema>;
export type ReservaEditForm = z.infer<typeof reservaEditSchema>;
