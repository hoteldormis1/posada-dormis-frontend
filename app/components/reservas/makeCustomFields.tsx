import React from "react";
import OrigenField from "./OrigenField";
import MontoPagadoField from "./MontoPagadoField";
import EstadoSlider from "@/components/ui/calendario/EstadoSlider";

// Tipo de renderer esperado por tu TableComponent
export type CustomFieldRenderer = (
  value: any,
  onChange: (v: any) => void,
  ctx?: any
) => React.ReactNode;

const makeCustomFields = ({
  labelBaseEstilos,
  inputBaseEstilos,
  habitaciones,
  estadosReserva,
}: {
  labelBaseEstilos: string;
  inputBaseEstilos: string;
  habitaciones: any;
  estadosReserva: Array<{ idEstadoReserva: number; nombre: string; descripcion?: string; prioridad?: number }>;
}) => {
  const origen: CustomFieldRenderer = (value, onChange, ctx) => (
    <OrigenField
      value={String(value || "AR")}
      onChange={(code) => onChange(code)}
      disabled={ctx?.disabled}
      labelClass={labelBaseEstilos}
    />
  );

  const montoPagado: CustomFieldRenderer = (value, onChange, ctx) => (
    <MontoPagadoField
      value={String(value ?? "0")}
      onChange={(v) => onChange(v)}
      ctx={ctx}
      habitaciones={habitaciones}
      labelClass={labelBaseEstilos}
      inputClass={`${inputBaseEstilos} w-40`}
      mainColorVar="--color-main"
    />
  );

  const idEstadoReserva: CustomFieldRenderer = (value, onChange, ctx) => {
    const currentId = Number(value || 0);
    const currentName = estadosReserva.find((e) => e.idEstadoReserva === currentId)?.nombre || "";

    return (
      <EstadoSlider
        estadoActual={currentName}
        estados={estadosReserva}
        onChange={(estadoNombre) => {
          const target = estadosReserva.find(
            (e) => e.nombre.toLowerCase() === estadoNombre.toLowerCase()
          );
          if (target) onChange(String(target.idEstadoReserva));
        }}
      />
    );
  };

  return { origen, montoPagado, idEstadoReserva } as const;
};

export default makeCustomFields;