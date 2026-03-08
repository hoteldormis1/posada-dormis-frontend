"use client";

import Swal from "sweetalert2";

const baseConfig = {
	background: "#0f1a12",
	color: "#e8e8ed",
	backdrop: "rgba(0, 0, 0, 0.72)",
	customClass: {
		popup: "swal-popup",
		title: "swal-title",
		htmlContainer: "swal-html",
		confirmButton: "swal-btn swal-btn--confirm",
		cancelButton: "swal-btn swal-btn--cancel",
		closeButton: "swal-close",
		icon: "swal-icon",
	},
};

const injectStyles = () => {
	if (typeof document === "undefined") return;
	if (document.getElementById("swal-custom-styles")) return;
	const style = document.createElement("style");
	style.id = "swal-custom-styles";
	style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=Inter:wght@400;500&display=swap');

    .swal2-container {
      z-index: 999999 !important;
    }

    .swal-popup {
      font-family: 'Inter', sans-serif !important;
      border-radius: 20px !important;
      border: 1px solid rgba(255,255,255,0.10) !important;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.04),
        0 32px 64px rgba(0,0,0,0.6),
        0 0 80px rgba(99,102,241,0.06) !important;
      padding: 2.5em 2.5em 2em !important;
    }

    /* Solo aplicar animación de entrada, sin pisar el swal2-hide de cierre */
    .swal2-show.swal-popup {
      animation: swal-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both !important;
    }

    @keyframes swal-in {
      from { opacity: 0; transform: scale(0.88) translateY(12px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }

    .swal-title {
      font-family: 'Syne', sans-serif !important;
      font-size: 1.35rem !important;
      font-weight: 700 !important;
      letter-spacing: -0.02em !important;
      color: #f0f0f5 !important;
      margin-bottom: 0.4em !important;
    }

    .swal-html {
      font-size: 0.92rem !important;
      color: #9a9aaf !important;
      line-height: 1.6 !important;
      margin-top: 0 !important;
    }

    .swal-btn {
      font-family: 'Inter', sans-serif !important;
      font-size: 0.875rem !important;
      font-weight: 500 !important;
      padding: 0.6em 1.6em !important;
      border-radius: 10px !important;
      border: none !important;
      cursor: pointer !important;
      transition: all 0.15s ease !important;
      letter-spacing: 0.01em !important;
    }

    .swal-btn--confirm {
      background: #10b981 !important;
      color: #062317 !important;
      box-shadow: 0 4px 14px rgba(16,185,129,0.35) !important;
    }
    .swal-btn--confirm:hover {
      background: #059669 !important;
      color: #ecfdf5 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 20px rgba(16,185,129,0.45) !important;
    }

    .swal-btn--cancel {
      background: rgba(255,255,255,0.06) !important;
      color: #9a9aaf !important;
      border: 1px solid rgba(255,255,255,0.10) !important;
    }
    .swal-btn--cancel:hover {
      background: rgba(255,255,255,0.12) !important;
      color: #e8e8ed !important;
    }

    .swal-btn--danger-confirm {
      background: #ef4444 !important;
      color: #fff !important;
      box-shadow: 0 4px 14px rgba(239,68,68,0.35) !important;
    }
    .swal-btn--danger-confirm:hover {
      background: #dc2626 !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 20px rgba(239,68,68,0.45) !important;
    }

    .swal-close {
      color: #5a5a6e !important;
      font-size: 1.2rem !important;
      transition: color 0.15s !important;
      top: 1em !important;
      right: 1em !important;
      cursor: pointer !important;
    }
    .swal-close:hover {
      color: #e8e8ed !important;
    }

    .swal-icon {
      margin-bottom: 0.6em !important;
      border: none !important;
    }

    .swal-popup::before {
      content: '';
      display: block;
      position: absolute;
      top: 0; left: 50%;
      transform: translateX(-50%);
      width: 48px; height: 3px;
      border-radius: 0 0 4px 4px;
      background: linear-gradient(90deg, #6366f1, #818cf8);
      pointer-events: none;
    }
    .swal-popup--danger::before {
      background: linear-gradient(90deg, #ef4444, #f87171);
    }
  `;
	document.head.appendChild(style);
};

export function useSweetAlert() {
	if (typeof document !== "undefined") {
		injectStyles();
	}

	const alert = (message: string) => {
		return Swal.fire({
			...baseConfig,
			icon: "info",
			title: "Atención",
			text: message,
			confirmButtonText: "Entendido",
		});
	};

	const confirm = async (message: string): Promise<boolean> => {
		const result = await Swal.fire({
			...baseConfig,
			icon: "question",
			title: "¿Estás seguro?",
			text: message,
			width: "440px",
			showCancelButton: true,
			focusCancel: true,
			reverseButtons: true,
			confirmButtonText: "Sí, continuar",
			cancelButtonText: "Cancelar",
			showCloseButton: true,
			allowOutsideClick: true,
			allowEscapeKey: true,
			stopKeydownPropagation: false,
			returnFocus: false,
		});
		return result.isConfirmed;
	};

	return {
		alert,
		confirm,
	};
}
