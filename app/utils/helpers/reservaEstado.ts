export type EstadoReservaKey =
  | "pendiente"
  | "confirmada"
  | "checkin"
  | "checkout"
  | "cancelada"
  | "rechazada"
  | "desconocido";

type EstadoReservaTheme = {
  key: EstadoReservaKey;
  label: string;
  hex: {
    color: string;
    accent: string;
    bg: string;
  };
  tw: {
    dot: string;
    badgeSolid: string;
    badgeSoft: string;
    text: string;
    bg: string;
    border: string;
  };
};

const ESTADO_ALIAS: Record<string, EstadoReservaKey> = {
  pendiente: "pendiente",
  unconfirmed: "pendiente",
  confirmada: "confirmada",
  confirmed: "confirmada",
  checkin: "checkin",
  paid: "checkin",
  checkout: "checkout",
  cancelada: "cancelada",
  canceled: "cancelada",
  rechazada: "rechazada",
  rejected: "rechazada",
};

const ESTADO_THEME: Record<EstadoReservaKey, EstadoReservaTheme> = {
  pendiente: {
    key: "pendiente",
    label: "Pendiente",
    hex: { color: "#eab308", accent: "#a16207", bg: "#fefce8" },
    tw: {
      dot: "bg-yellow-400",
      badgeSolid: "bg-yellow-500 text-white border border-yellow-600",
      badgeSoft: "bg-amber-100 text-amber-700 border border-amber-200",
      text: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
  },
  confirmada: {
    key: "confirmada",
    label: "Confirmada",
    hex: { color: "#3b82f6", accent: "#1d4ed8", bg: "#eff6ff" },
    tw: {
      dot: "bg-blue-400",
      badgeSolid: "bg-blue-600 text-white border border-blue-700",
      badgeSoft: "bg-blue-100 text-blue-700 border border-blue-200",
      text: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
  },
  checkin: {
    key: "checkin",
    label: "Check-in",
    hex: { color: "#22c55e", accent: "#15803d", bg: "#f0fdf4" },
    tw: {
      dot: "bg-green-500",
      badgeSolid: "bg-green-600 text-white border border-green-700",
      badgeSoft: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
  },
  checkout: {
    key: "checkout",
    label: "Check-out",
    hex: { color: "#6366f1", accent: "#4338ca", bg: "#eef2ff" },
    tw: {
      dot: "bg-indigo-400",
      badgeSolid: "bg-indigo-500 text-white border border-indigo-600",
      badgeSoft: "bg-violet-100 text-violet-700 border border-violet-200",
      text: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-200",
    },
  },
  cancelada: {
    key: "cancelada",
    label: "Cancelada",
    hex: { color: "#ef4444", accent: "#b91c1c", bg: "#fef2f2" },
    tw: {
      dot: "bg-red-400",
      badgeSolid: "bg-red-500 text-white border border-red-600 line-through opacity-90",
      badgeSoft: "bg-red-100 text-red-700 border border-red-200",
      text: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
  },
  rechazada: {
    key: "rechazada",
    label: "Rechazada",
    hex: { color: "#f97316", accent: "#c2410c", bg: "#fff7ed" },
    tw: {
      dot: "bg-orange-400",
      badgeSolid: "bg-orange-500 text-white border border-orange-600 line-through opacity-90",
      badgeSoft: "bg-orange-100 text-orange-700 border border-orange-200",
      text: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
  },
  desconocido: {
    key: "desconocido",
    label: "Desconocido",
    hex: { color: "#94a3b8", accent: "#475569", bg: "#f8fafc" },
    tw: {
      dot: "bg-gray-400",
      badgeSolid: "bg-gray-500 text-white border border-gray-600",
      badgeSoft: "bg-gray-100 text-gray-700 border border-gray-200",
      text: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
    },
  },
};

export const ESTADOS_RESERVA_FLUJO: EstadoReservaKey[] = [
  "pendiente",
  "confirmada",
  "checkin",
  "checkout",
];

export const ESTADOS_RESERVA_OPCIONES = [
  { value: "", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmada", label: "Confirmada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "rechazada", label: "Rechazada" },
  { value: "checkin", label: "Check-in" },
  { value: "checkout", label: "Check-out" },
] as const;

export function normalizeEstadoReserva(estado?: string | null): EstadoReservaKey {
  if (!estado) return "desconocido";
  const key = estado.toLowerCase().trim().replace(/[-\s]/g, "");
  return ESTADO_ALIAS[key] ?? "desconocido";
}

export function getEstadoReservaTheme(estado?: string | null): EstadoReservaTheme {
  const key = normalizeEstadoReserva(estado);
  return ESTADO_THEME[key];
}

export function getEstadoReservaLabel(estado?: string | null): string {
  return getEstadoReservaTheme(estado).label;
}

export function getEstadoReservaChartColor(estado?: string | null, alpha = 0.7): string {
  const { color } = getEstadoReservaTheme(estado).hex;
  const hex = color.replace("#", "");
  const safeAlpha = Number.isFinite(alpha) ? Math.max(0, Math.min(1, alpha)) : 0.7;

  if (hex.length !== 6) return `rgba(148, 163, 184, ${safeAlpha})`;

  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
}
