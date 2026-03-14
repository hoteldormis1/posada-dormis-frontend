/**
 * Extrae el mensaje de error legible de una respuesta Axios.
 * La respuesta del backend tiene forma: { code, error, details? }
 */
export const extractErrorMessage = (err: any, fallback = "Ocurrió un error"): string =>
	err?.response?.data?.error ||
	err?.response?.data?.mensaje ||
	err?.message ||
	fallback;

/**
 * Extrae el code semántico de la respuesta del backend.
 * Ejemplo: "ENTITY_NOT_FOUND", "DNI_EXISTS", "ENTITY_IN_USE"
 */
export const extractErrorCode = (err: any): string | null =>
	err?.response?.data?.code ?? null;

/**
 * Devuelve un mensaje amigable según el code semántico del backend.
 * Usar cuando se quiera sobrescribir o enriquecer el mensaje del toast.
 */
export const getFriendlyErrorMessage = (err: any, fallback = "Ocurrió un error"): string => {
	const code = extractErrorCode(err);
	const serverMessage = extractErrorMessage(err, fallback);

	const friendlyMessages: Record<string, string> = {
		ENTITY_NOT_FOUND: "El registro no fue encontrado.",
		ENTITY_IN_USE: serverMessage, // ya trae el detalle (ej: "tiene 3 reservas")
		DNI_EXISTS: serverMessage,    // ya trae nombre/apellido del existente
		DNI_DUPLICADO: serverMessage,
		DNI_BLACKLISTED: "Este huésped está en la lista de no deseados.",
		ROOM_UNAVAILABLE: "La habitación ya está reservada en esas fechas.",
		ROOM_OUT_OF_SERVICE: "La habitación está fuera de servicio.",
		FK_CONSTRAINT: "No se puede eliminar porque tiene datos relacionados.",
		UNIQUE_CONSTRAINT: serverMessage,
		VALIDATION_ERROR: serverMessage,
		MISSING_FIELDS: serverMessage,
		ESTADO_TRANSICION_INVALIDA: serverMessage,
		MONTO_INVALIDO: serverMessage,
		ESTADIA_MINIMA: "La estadía mínima es de 2 noches.",
		UNAUTHORIZED: "No tenés permisos para realizar esta acción.",
		FORBIDDEN: "Acceso denegado.",
		INTERNAL_ERROR: "Error interno del servidor. Intentá de nuevo.",
	};

	return (code && friendlyMessages[code]) ? friendlyMessages[code] : serverMessage;
};
