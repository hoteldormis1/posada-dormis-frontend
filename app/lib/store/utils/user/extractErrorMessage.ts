export const extractErrorMessage = (err, fallback = "Ocurrió un error") =>
	err?.response?.data?.error ||
	err?.response?.data?.mensaje ||
	err.message ||
	fallback;
