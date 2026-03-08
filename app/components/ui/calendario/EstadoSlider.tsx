"use client";

import { getEstadoReservaTheme, normalizeEstadoReserva } from "@/utils/helpers/reservaEstado";

export interface EstadoReserva {
  idEstadoReserva: number;
  nombre: string;
  descripcion?: string;
  prioridad?: number;
}

interface EstadoSliderProps {
  estadoActual?: string;
  estados: EstadoReserva[];
  onChange?: (key: string) => void;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
}

export default function EstadoSlider({
  estadoActual = "",
  estados,
  onChange,
  loading = false,
  error = null,
  success = null,
}: EstadoSliderProps) {
  const emerald65 = "rgb(209 250 229 / 0.65)";
  const estadosMostrables = estados.filter(
    (e) => normalizeEstadoReserva(e.nombre) !== "rechazada"
  );
  const currentIndex = estadosMostrables.findIndex(
    (e) => e.nombre.toLowerCase() === estadoActual.toLowerCase()
  );
  const current = estadosMostrables[Math.max(currentIndex, 0)];
  const currentColors = getEstadoReservaTheme(current?.nombre).hex;
  const pct =
    estadosMostrables.length > 1
      ? (Math.max(currentIndex, 0) / (estadosMostrables.length - 1)) * 100
      : 0;

  if (!estadosMostrables.length) return null;

  return (
    <div
      className="relative overflow-hidden rounded-[14px] border-[1.5px] bg-white/4 px-5 pt-[18px] pb-[14px] backdrop-blur-[12px] transition-[border-color,box-shadow] duration-500"
      style={{
        fontFamily: "var(--font-sans), 'Poppins', 'Segoe UI', sans-serif",
        borderColor: `${currentColors.color}35`,
        boxShadow: `0 0 24px ${currentColors.color}12, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Glow accent */}
      <div
        className="pointer-events-none absolute -top-10 -right-5 h-[140px] w-[140px] rounded-full blur-[50px] transition-colors duration-500"
        style={{
          background: currentColors.color,
          opacity: 0.06,
        }}
      />

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.1em] leading-[1.2] text-emerald-100/65"
        >
          Cambiar Estado
        </span>
        <span
          className="rounded-full border px-[10px] py-[2px] text-[12px] font-semibold transition-all duration-300"
          style={{
            color: currentColors.color,
            background: `${currentColors.color}18`,
            borderColor: `${currentColors.color}35`,
          }}
        >
          {current?.nombre
            ? current.nombre.charAt(0).toUpperCase() + current.nombre.slice(1)
            : "—"}
        </span>
      </div>

      {/* Dots */}
      <div className="mb-2 flex justify-between">
        {estadosMostrables.map((e, i) => (
          <button
            key={e.idEstadoReserva}
            onClick={() => !loading && onChange?.(e.nombre.toLowerCase())}
            disabled={loading}
            title={e.descripcion ?? e.nombre}
            className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 outline-none transition-all duration-300 ease-out"
            style={{
              border:
                i === currentIndex
                  ? `2px solid ${currentColors.color}`
                  : i < currentIndex
                  ? `2px solid ${currentColors.color}60`
                  : "2px solid rgba(255,255,255,0.15)",
              background:
                i === currentIndex
                  ? currentColors.color
                  : i < currentIndex
                  ? `${currentColors.color}25`
                  : "rgba(255,255,255,0.04)",
              cursor: loading ? "not-allowed" : "pointer",
              transform: i === currentIndex ? "scale(1.2)" : "scale(1)",
              boxShadow:
                i === currentIndex
                  ? `0 0 0 3px ${currentColors.color}20, 0 2px 8px ${currentColors.color}35`
                  : "none",
            }}
          >
            {i < currentIndex && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6l3 3 5-5"
                  stroke={currentColors.color}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {i === currentIndex && (
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.9)",
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Track bar */}
      <div
        className="relative mx-[13px] h-1 rounded-[99px] bg-white/10"
        style={{
          background: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-[99px] transition-[width,background] duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${currentColors.color}70, ${currentColors.color})`,
            boxShadow: `0 0 8px ${currentColors.color}45`,
          }}
        />
      </div>

      {/* Labels */}
      <div className="mt-2 flex justify-between">
        {estadosMostrables.map((e, i) => (
          <span
            key={e.idEstadoReserva}
            onClick={() => !loading && onChange?.(e.nombre.toLowerCase())}
            className="w-12 select-none truncate text-center text-[11px] tracking-[0.03em] transition-colors duration-300"
            style={{
              fontWeight: i === currentIndex ? 700 : 500,
              color:
                i === currentIndex
                  ? currentColors.color
                  : i < currentIndex
                  ? `${currentColors.color}80`
                  : emerald65,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {e.nombre.charAt(0).toUpperCase() + e.nombre.slice(1)}
          </span>
        ))}
      </div>

      {/* Feedback */}
      {(error || success) && (
        <p
          className="mt-[10px] text-center text-[12px]"
          style={{
            color: error ? "#f87171" : "#6ee7b7",
          }}
        >
          {error ?? success}
        </p>
      )}

      {/* Loading bar */}
      {loading && (
        <div
          className="absolute bottom-0 left-0 h-0.5 w-full overflow-hidden rounded-b-[14px] bg-white/10"
          style={{
            background: "rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="h-full animate-[slider-load_0.6s_ease-out_forwards]"
            style={{
              background: currentColors.color,
            }}
          />
        </div>
      )}

      <style>{`@keyframes slider-load { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
