import Swal from "sweetalert2";

export function useSweetAlert() {
	const alert = (message) => {
		return Swal.fire({
			icon: "info",
			title: "Atención",
			text: message,
			confirmButtonText: "OK",
		});
	};

	const successAlert = (message) => {
		return Swal.fire({
			icon: "success",
			title: "Éxito",
			text: message,
			confirmButtonText: "OK",
		});
	};

	const failureAlert = (message) => {
		return Swal.fire({
			icon: "error",
			title: "Error",
			text: message,
			confirmButtonText: "OK",
		});
	};

	const confirm = async (message) => {
		const result = await Swal.fire({
			icon: "question",
			title: "<strong>¿Estás seguro?</strong>",
			html: `<p style="font-size:1rem; color:#333;">${message}</p>`,
			width: "500px",
			padding: "2.5em",
			background: "#fafafa ",
			showCancelButton: true,
			focusCancel: true,
			reverseButtons: true,
			confirmButtonText: "Sí",
			cancelButtonText: "Cancelar",
			confirmButtonColor: "#3085d6", // azul primario
			cancelButtonColor: "#6c757d", // gris secundario
			customClass: {
				popup: "swal2-popup--medium",
				title: "swal2-title--confirm",
				confirmButton: "swal2-btn--primary",
				cancelButton: "swal2-btn--secondary",
			},
			backdrop: "rgba(0, 0, 0, 0.4)",
			showCloseButton: true,
			allowOutsideClick: false,
			allowEscapeKey: false,
		});
		return result.isConfirmed;
	};
	const confirmDanger = async (message) => {
		const result = await Swal.fire({
			icon: "warning",
			title: "<strong>¡Atención!</strong>",
			html: `<p style="font-size:1.1rem">${message}</p>`,
			width: "600px",
			padding: "3em",
			showCancelButton: true,
			focusCancel: true,
			reverseButtons: true,
			confirmButtonText: "Sí, continuar",
			cancelButtonText: "No, cancelar",
			confirmButtonColor: "#d33",
			cancelButtonColor: "#3085d6",
			customClass: {
				popup: "swal2-popup--large",
				title: "swal2-title--danger",
				confirmButton: "swal2-btn--danger",
				cancelButton: "swal2-btn--secondary",
			},
			// Simplified backdrop: just a semi-transparent black
			backdrop: "rgba(0, 0, 0, 0.8)",
			allowOutsideClick: false,
			allowEscapeKey: false,
		});
		return result.isConfirmed;
	};

	return {
		alert,
		successAlert,
		failureAlert,
		confirm,
		confirmDanger,
	};
}
