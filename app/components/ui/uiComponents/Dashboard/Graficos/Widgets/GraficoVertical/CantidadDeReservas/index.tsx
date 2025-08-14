"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

type Serie = { label: string; value: number };

interface GraficoCantidadDeReservasProps {
  data: Serie[];          // [{ label:"20/8", value: 1 }]
  title?: string;
  className?: string;     // ej: "h-44"
  lineColor?: string;     // ej: "#3b82f6"
  fillArea?: boolean;     // true para área rellena
}

const GraficoCantidadDeReservas: React.FC<GraficoCantidadDeReservasProps> = ({
  data,
  title = "",
  className,
  lineColor = "#22c55e", // verde (tailwind emerald-500 aprox.)
  fillArea = true,
}) => {
  const { labels, values, isSingle, yMax } = useMemo(() => {
    const labels = data.map(d => d.label);
    const values = data.map(d => d.value);
    const yMax = values.length ? Math.max(...values) : 0;
    return { labels, values, isSingle: labels.length === 1, yMax };
  }, [data]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { boxWidth: 10, font: { size: 10 } } },
      title: { display: !!title, text: title, font: { size: 12 } },
      tooltip: { bodyFont: { size: 10 } },
    },
    elements: {
      line: { tension: 0.3, borderWidth: 2 },
      point: {
        radius: isSingle ? 6 : 3,
        hoverRadius: isSingle ? 7 : 4,
        hitRadius: 8,
      },
    },
    scales: {
      x: {
        offset: !isSingle ? true : false, // sin márgenes extra si hay 1 punto
        ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        // un poco de “aire” arriba para 1 dato
        suggestedMax: isSingle ? yMax * 1.3 : undefined,
        ticks: { font: { size: 10 } },
        title: { display: true, text: "Cantidad" },
      },
    },
    layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: "Cantidad de reservas",
        data: values,
        borderColor: lineColor,
        backgroundColor: fillArea ? `${lineColor}33` : lineColor, // 20% alpha si fill
        fill: fillArea,
      },
    ],
  };

  if (!labels.length) return <div className="text-sm text-gray-500">Sin datos para mostrar.</div>;

  return (
    <div className={className ?? "h-full"}>
      <Line options={options} data={chartData} />
    </div>
  );
};

export default GraficoCantidadDeReservas;
