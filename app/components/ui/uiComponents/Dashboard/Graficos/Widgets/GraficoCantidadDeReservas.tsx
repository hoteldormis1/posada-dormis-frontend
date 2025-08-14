// GraficoCantidadDeReservas.tsx
"use client";

import React, { useMemo } from "react";
import GraficoVertical from "../Components/GraficoVertical";

type Serie = { label: string; value: number };

interface Props {
  data: Serie[];             // [{ label:"20/8", value: 1 }]
  title?: string;
  className?: string;        // ej: "h-44"
  color?: string;            // color opcional del dataset
}

const GraficoCantidadDeReservas: React.FC<Props> = ({
  data,
  title = "",
  className,
  color = "#22c55e",
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
            label: "Cantidad de reservas",
            data: values,
            backgroundColor: color,
          },
        ]}
        title={title}
        yType="number"
      />
    </div>
  );
};

export default GraficoCantidadDeReservas;
