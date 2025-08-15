import React, { useMemo } from "react";
import { diffNoches } from "@/utils/helpers/date";
import { getPrecioHabitacion } from "@/utils/helpers/money";

type Ctx = {
  formData?: Record<string, any>;
  mode?: "add" | "edit";
  row?: any;
  disabled?: boolean;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  ctx?: Ctx;
  habitaciones: any;
  labelClass: string;
  inputClass: string;
  mainColorVar?: string; // ej: var(--color-main)
};

const MontoPagadoField: React.FC<Props> = ({ value, onChange, ctx, habitaciones, labelClass, inputClass, mainColorVar = "var(--color-main)" }) => {
  const mode = ctx?.mode || "add";

  const { precio, noches, montoCalculado, totalDeReserva, maxValue, currentValue, step, isDisabled } = useMemo(() => {
    // Datos del form (para ADD) y de la fila (para EDIT)
    const idHabitacionSel = ctx?.formData?.idHabitacion;
    const fechaDesdeSel = ctx?.formData?.fechaDesde;
    const fechaHastaSel = ctx?.formData?.fechaHasta;

    // Cálculo "normal" (ADD): precio * noches
    const precio = getPrecioHabitacion(habitaciones, idHabitacionSel);
    const noches = diffNoches(String(fechaDesdeSel || ""), String(fechaHastaSel || ""));
    const montoCalculado = precio * noches;

    // En EDIT, el tope debe ser el total de la reserva
    const totalDeReserva = typeof ctx?.row?.total === "number" ? ctx.row.total : Number(ctx?.row?.total || 0);

    // MAX según modo
    const maxValue = mode === "edit" ? Math.max(totalDeReserva, 1) || 1 : Math.max(montoCalculado, 1) || 1;

    // Valor actual (inicializaciones)
    let currentValue = Number(value || 0);

    if (mode === "add" && currentValue === 0 && montoCalculado > 0) {
      currentValue = montoCalculado;
      setTimeout(() => onChange(String(currentValue)), 0);
    }

    if (mode === "edit" && currentValue === 0) {
      const rowMontoPagado = Number(ctx?.row?.montoPagado || 0);
      currentValue = rowMontoPagado;
      setTimeout(() => onChange(String(currentValue)), 0);
    }

    // Siempre capear al máximo definido para el modo actual
    currentValue = Math.min(currentValue, maxValue);

    const isDisabled = ctx?.disabled || false;
    const step = Math.max(Math.round(maxValue / 100), 1); // ~100 posiciones

    return { precio, noches, montoCalculado, totalDeReserva, maxValue, currentValue, step, isDisabled };
  }, [ctx?.formData?.idHabitacion, ctx?.formData?.fechaDesde, ctx?.formData?.fechaHasta, ctx?.mode, ctx?.row?.montoPagado, ctx?.row?.total, habitaciones, mode, onChange, value]);

  return (
    <div className="flex flex-col gap-2">
      <label className={`${labelClass} flex justify-between`}>
        <span>Monto Pagado</span>
        <span className="text-xs text-[var(--color-muted)] dark:text-gray-300">
          ${currentValue.toLocaleString()} / ${maxValue.toLocaleString()}
        </span>
      </label>

      {/* Slider */}
      <input
        type="range"
        value={currentValue}
        min={0}
        max={maxValue}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        disabled={isDisabled}
        className={`w-full ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
        style={{ accentColor: `var(${mainColorVar})` }}
        aria-label="Control deslizante de monto pagado"
      />

      {/* Input numérico para precisión */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={currentValue}
          min={0}
          max={maxValue}
          step={1}
          onChange={(e) => {
            const v = Number(e.target.value || 0);
            const safe = Math.min(Math.max(v, 0), maxValue);
            onChange(String(safe));
          }}
          disabled={isDisabled}
          className={inputClass + ` ${isDisabled ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}`}
          placeholder="Ingrese el monto"
        />

        {/* Botón Auto */}
        <button
          type="button"
          onClick={() => {
            // En EDIT, “Auto” pone el total de la reserva; en ADD, recalcula por noches × precio
            const auto = mode === "edit" ? maxValue : montoCalculado;
            onChange(String(auto));
          }}
          disabled={isDisabled}
          className={`px-3 py-2 text-sm rounded-md text-white transition-colors ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
          style={{ background: `var(${mainColorVar})` }}
          title={mode === "edit" ? "Usar total de la reserva" : "Calcular (precio × noches)"}
        >
          Auto
        </button>
      </div>

      {/* Nota auxiliar */}
      <div className="text-xs text-[var(--color-muted)] dark:text-gray-400">
        {mode === "edit" ? (
          <>Total de la reserva: ${maxValue.toLocaleString()}</>
        ) : (
          <>Precio por noche: ${precio.toLocaleString()} · Noches: {noches} · Total: ${montoCalculado.toLocaleString()}</>
        )}
      </div>
    </div>
  );
};

export default MontoPagadoField;