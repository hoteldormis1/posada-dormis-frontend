// GraficoCantidadDeReservas.tsx
"use client";

import React, { useMemo } from "react";
import GraficoVertical from "../Components/GraficoVertical";

type Serie = { label: string; value: number };

interface Props {
  data: Serie[];
  title?: string;
  className?: string;
  color?: string;
  datasetLabel?: string;
  yType?: "number" | "money";
}

const GraficoCantidadDeReservas: React.FC<Props> = ({
  data,
  title = "",
  className,
  color = "#22c55e",
  datasetLabel = "Cantidad de reservas",
  yType = "number",
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
            label: datasetLabel,
            data: values,
            backgroundColor: color,
          },
        ]}
        title={title}
        yType={yType}
      />
    </div>
  );
};

export default GraficoCantidadDeReservas;
