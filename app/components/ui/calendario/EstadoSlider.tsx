"use client";

import { getEstadoReservaTheme } from "@/utils/helpers/reservaEstado";

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
  const currentIndex = estados.findIndex(e => e.nombre.toLowerCase() === estadoActual.toLowerCase());
  const current = estados[Math.max(currentIndex, 0)];
  const currentColors = getEstadoReservaTheme(current?.nombre).hex;
  const pct = estados.length > 1 ? (Math.max(currentIndex, 0) / (estados.length - 1)) * 100 : 0;

  if (!estados.length) return null;

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        padding: "20px 20px 16px",
        borderRadius: "16px",
        background: currentColors.bg,
        border: `1.5px solid ${currentColors.color}30`,
        boxShadow: `0 4px 24px ${currentColors.color}18, 0 1px 4px rgba(0,0,0,0.06)`,
        transition: "all 0.5s cubic-bezier(.4,0,.2,1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: "absolute",
        width: 160, height: 160, borderRadius: "50%",
        background: currentColors.color, opacity: 0.07,
        top: -50, right: -30, filter: "blur(40px)",
        transition: "background 0.5s", pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Cambiar Estado
        </span>
        <span style={{
          fontSize: 12, fontWeight: 600, color: currentColors.accent,
          background: `${currentColors.color}18`, border: `1px solid ${currentColors.color}40`,
          borderRadius: 20, padding: "2px 10px", transition: "all 0.4s",
        }}>
          {current?.nombre
            ? current.nombre.charAt(0).toUpperCase() + current.nombre.slice(1)
            : "—"}
        </span>
      </div>

      {/* Track + dots */}
      <div style={{ position: "relative", paddingBottom: 4 }}>
        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          {estados.map((e, i) => (
            <button
              key={e.idEstadoReserva}
              onClick={() => !loading && onChange?.(e.nombre.toLowerCase())}
              disabled={loading}
              title={e.descripcion ?? e.nombre}
              style={{
                width: 28, height: 28, borderRadius: "50%", outline: "none", flexShrink: 0,
                border: i === currentIndex
                  ? `2.5px solid ${currentColors.color}`
                  : i < currentIndex
                    ? `2px solid ${currentColors.color}80`
                    : "2px solid #e2e8f0",
                background: i === currentIndex
                  ? currentColors.color
                  : i < currentIndex
                    ? `${currentColors.color}30`
                    : "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
                transform: i === currentIndex ? "scale(1.18)" : "scale(1)",
                boxShadow: i === currentIndex
                  ? `0 0 0 4px ${currentColors.color}25, 0 2px 8px ${currentColors.color}40`
                  : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {i < currentIndex && (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke={currentColors.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {i === currentIndex && (
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />
              )}
            </button>
          ))}
        </div>

        {/* Track bar */}
        <div style={{ position: "relative", height: 5, borderRadius: 99, background: "#e2e8f0", margin: "0 14px" }}>
          <div style={{
            position: "absolute", left: 0, top: 0, height: "100%",
            width: `${pct}%`, borderRadius: 99,
            background: `linear-gradient(90deg, ${currentColors.color}88, ${currentColors.color})`,
            transition: "width 0.5s cubic-bezier(.4,0,.2,1), background 0.5s",
            boxShadow: `0 1px 6px ${currentColors.color}50`,
          }} />
        </div>

        {/* Labels */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          {estados.map((e, i) => (
            <span
              key={e.idEstadoReserva}
              onClick={() => !loading && onChange?.(e.nombre.toLowerCase())}
              style={{
                fontSize: 10, fontWeight: i === currentIndex ? 700 : 500,
                color: i === currentIndex ? currentColors.accent : i < currentIndex ? currentColors.color : "#94a3b8",
                width: 48, textAlign: "center",
                cursor: loading ? "default" : "pointer",
                transition: "color 0.35s", userSelect: "none",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}
            >
              {e.nombre.charAt(0).toUpperCase() + e.nombre.slice(1)}
            </span>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {(error || success) && (
        <p style={{
          marginTop: 10, fontSize: 11, textAlign: "center",
          color: error ? "#dc2626" : "#16a34a",
        }}>
          {error ?? success}
        </p>
      )}

      {/* Loading bar */}
      {loading && (
        <div style={{
          position: "absolute", bottom: 0, left: 0,
          height: 3, width: "100%",
          background: "#e2e8f0", borderRadius: "0 0 16px 16px", overflow: "hidden",
        }}>
          <div style={{ height: "100%", background: currentColors.color, animation: "slide 0.6s ease-out forwards" }} />
        </div>
      )}

      <style>{`@keyframes slide { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
