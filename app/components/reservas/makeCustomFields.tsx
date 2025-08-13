import React from "react";
import OrigenField from "./OrigenField";
import MontoPagadoField from "./MontoPagadoField";

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
}: {
  labelBaseEstilos: string;
  inputBaseEstilos: string;
  habitaciones: any;
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

  return { origen, montoPagado } as const;
};

export default makeCustomFields;