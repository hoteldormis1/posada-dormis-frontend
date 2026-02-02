import toast, { Toast } from "react-hot-toast";
import React from "react";

type ToastType = "success" | "error" | "info" | "loading";

const baseStyles =
  "flex items-center justify-between max-w-sm w-full p-4 rounded-2xl shadow-lg font-medium text-white transition-all duration-300 ease-in-out";

const bgColors: Record<ToastType, string> = {
  success: "bg-success",
  error: "bg-danger",
  info: "bg-blue-700",
  loading: "bg-yellow-700",
};

const icons: Record<ToastType, string> = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  loading: "⏳",
};

// Store para evitar duplicados
const activeToasts = new Map<string, string>();

const createToast = (type: ToastType, message: string) => {
  // Crear un ID único basado en tipo y mensaje
  const toastKey = `${type}-${message}`;
  
  // Si ya existe un toast con este contenido, no crear otro
  if (activeToasts.has(toastKey)) {
    return;
  }

  const toastId = toast.custom((t: Toast) => {
    const visibleStyle = t.visible
      ? "opacity-100 translate-y-0"
      : "opacity-0 -translate-y-2";

    return (
      <div
        role="alert"
        className={`${baseStyles} ${bgColors[type]} ${visibleStyle}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icons[type]}</span>
          <span>{message}</span>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="ml-4 text-white text-lg font-bold leading-none hover:opacity-80"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    );
  }, {
    duration: 3000,
  });

  // Registrar el toast activo
  activeToasts.set(toastKey, toastId);

  // Limpiar del registro cuando se cierre
  setTimeout(() => {
    activeToasts.delete(toastKey);
  }, 3100); // Un poco más que la duración para asegurar limpieza
};

export const useToastAlert = () => {
  return {
    successToast: (msg: string) => createToast("success", msg),
    errorToast: (msg: string) => createToast("error", msg),
    infoToast: (msg: string) => createToast("info", msg),
    loadingToast: (msg: string) => createToast("loading", msg),
  };
};
