// GraficoCantidadDeIngresos.tsx
"use client";

import React, { useMemo } from "react";
import GraficoVertical from "../Components/GraficoVertical";

type Serie = { label: string; value: number };

interface Props {
  data: Serie[];             // [{ label: "20/8", value: 90000 }]
  title?: string;
  className?: string;        // ej: "h-44"
  currency?: string;         // "ARS" por defecto
  color?: string;            // color opcional del dataset
}

const GraficoCantidadDeIngresos: React.FC<Props> = ({
  data,
  title = "",
  className,
  currency = "ARS",
  color = "#7aa3ff",
}) => {
  const { labels, values } = useMemo(
    () => ({
      labels: data.map(d => d.label),
      values: data.map(d => d.value),
    }),
    [data]
  );

  return (
    <div className={className ?? "h-full"}>
      <GraficoVertical
        labels={labels}
        datasets={[
          {
            label: "Ingresos ($)",
            data: values,
            backgroundColor: color,
          },
        ]}
        title={title}
        yType="money"
        currency={currency}
      />
    </div>
  );
};

export default GraficoCantidadDeIngresos;
