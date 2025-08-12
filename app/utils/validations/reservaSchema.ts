import { z } from "zod";

export const reservaAddSchema = z
	.object({
		// HUESPED
		nombre: z.string().min(1, "Campo requerido"),
		apellido: z.string().min(1, "Campo requerido"),
		dni: z.string().min(6, "Mínimo 6 caracteres"),
		telefono: z.string().min(6, "Mínimo 6 caracteres"),
		email: z.string().email("Email inválido").optional(),

		origen: z.string().min(1, "Campo requerido"),

		// RESERVA
		idHabitacion: z.coerce.number().int().positive("Seleccione una habitación"),
		fechaDesde: z.string().min(1, "Ingrese la fecha").regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: dd/mm/yyyy"),
		fechaHasta: z.string().min(1, "Ingrese la fecha").regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: dd/mm/yyyy"),
		montoPagado: z.coerce.number().positive("Campo requerido"),
	})
	.refine((v) => {
		// Convertir fechas dd/mm/yyyy a objetos Date para comparar
		const parseDate = (dateStr: string) => {
			const [day, month, year] = dateStr.split('/');
			return new Date(Number(year), Number(month) - 1, Number(day));
		};
		
		const fechaDesde = parseDate(v.fechaDesde);
		const fechaHasta = parseDate(v.fechaHasta);
		
		return fechaHasta >= fechaDesde;
	}, {
		path: ["fechaHasta"],
		message: "La salida debe ser posterior al ingreso",
	});

export const reservaEditSchema = z
	.object({
		// HUESPED
		nombre: z.string().min(1, "Campo requerido"),
		apellido: z.string().min(1, "Campo requerido"),
		dni: z.string().min(6, "Mínimo 6 caracteres"),
		telefono: z.string().min(6, "Mínimo 6 caracteres"),
		email: z.string().email("Email inválido").optional(),
		origen: z.string().min(1, "Campo requerido"),

		// RESERVA
		idHabitacion: z.coerce.number().int().positive("Seleccione una habitación"),
		fechaDesde: z.string().min(1, "Ingrese la fecha").regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: dd/mm/yyyy"),
		fechaHasta: z.string().min(1, "Ingrese la fecha").regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato: dd/mm/yyyy"),
		montoPagado: z.coerce.number().positive("Campo requerido"),
	})
	.refine((v) => {
		// Convertir fechas dd/mm/yyyy a objetos Date para comparar
		const parseDate = (dateStr: string) => {
			const [day, month, year] = dateStr.split('/');
			return new Date(Number(year), Number(month) - 1, Number(day));
		};
		
		const fechaDesde = parseDate(v.fechaDesde);
		const fechaHasta = parseDate(v.fechaHasta);
		
		return fechaHasta >= fechaDesde;
	}, {
		path: ["fechaHasta"],
		message: "La salida debe ser posterior al ingreso",
	});

export type ReservaAddForm = z.infer<typeof reservaAddSchema>;
export type ReservaEditForm = z.infer<typeof reservaEditSchema>;
