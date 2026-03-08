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
      style={{
        fontFamily: "'DM Sans', sans-serif",
        padding: "18px 20px 14px",
        borderRadius: "14px",
        background: "rgba(255,255,255,0.04)",
        border: `1.5px solid ${currentColors.color}35`,
        boxShadow: `0 0 24px ${currentColors.color}12, inset 0 1px 0 rgba(255,255,255,0.06)`,
        backdropFilter: "blur(12px)",
        transition: "border-color 0.5s, box-shadow 0.5s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow accent */}
      <div
        style={{
          position: "absolute",
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: currentColors.color,
          opacity: 0.06,
          top: -40,
          right: -20,
          filter: "blur(50px)",
          transition: "background 0.5s",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Cambiar Estado
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: currentColors.color,
            background: `${currentColors.color}18`,
            border: `1px solid ${currentColors.color}35`,
            borderRadius: 20,
            padding: "2px 10px",
            transition: "all 0.4s",
          }}
        >
          {current?.nombre
            ? current.nombre.charAt(0).toUpperCase() + current.nombre.slice(1)
            : "—"}
        </span>
      </div>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        {estadosMostrables.map((e, i) => (
          <button
            key={e.idEstadoReserva}
            onClick={() => !loading && onChange?.(e.nombre.toLowerCase())}
            disabled={loading}
            title={e.descripcion ?? e.nombre}
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              outline: "none",
              flexShrink: 0,
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
              transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
              transform: i === currentIndex ? "scale(1.2)" : "scale(1)",
              boxShadow:
                i === currentIndex
                  ? `0 0 0 3px ${currentColors.color}20, 0 2px 8px ${currentColors.color}35`
                  : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
        style={{
          position: "relative",
          height: 4,
          borderRadius: 99,
          background: "rgba(255,255,255,0.08)",
          margin: "0 13px",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${pct}%`,
            borderRadius: 99,
            background: `linear-gradient(90deg, ${currentColors.color}70, ${currentColors.color})`,
            transition: "width 0.5s cubic-bezier(.4,0,.2,1), background 0.5s",
            boxShadow: `0 0 8px ${currentColors.color}45`,
          }}
        />
      </div>

      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        {estadosMostrables.map((e, i) => (
          <span
            key={e.idEstadoReserva}
            onClick={() => !loading && onChange?.(e.nombre.toLowerCase())}
            style={{
              fontSize: 9,
              fontWeight: i === currentIndex ? 700 : 500,
              color:
                i === currentIndex
                  ? currentColors.color
                  : i < currentIndex
                  ? `${currentColors.color}80`
                  : "rgba(255,255,255,0.28)",
              width: 48,
              textAlign: "center",
              cursor: loading ? "default" : "pointer",
              transition: "color 0.35s",
              userSelect: "none",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              letterSpacing: "0.03em",
            }}
          >
            {e.nombre.charAt(0).toUpperCase() + e.nombre.slice(1)}
          </span>
        ))}
      </div>

      {/* Feedback */}
      {(error || success) && (
        <p
          style={{
            marginTop: 10,
            fontSize: 11,
            textAlign: "center",
            color: error ? "#f87171" : "#6ee7b7",
          }}
        >
          {error ?? success}
        </p>
      )}

      {/* Loading bar */}
      {loading && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 2,
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "0 0 14px 14px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: currentColors.color,
              animation: "slider-load 0.6s ease-out forwards",
            }}
          />
        </div>
      )}

      <style>{`@keyframes slider-load { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
