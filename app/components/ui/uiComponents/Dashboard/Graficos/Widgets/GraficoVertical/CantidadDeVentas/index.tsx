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

interface GraficoCantidadDeVentasProps {
  data: Serie[];            // [{ label: "20/8", value: 90000 }]
  title?: string;
  className?: string;       // ej: "h-44"
  lineColor?: string;       // ej: "#7aa3ff"
  fillArea?: boolean;       // true para área rellena
  currency?: string;        // "ARS" por defecto
}

const formatMoney = (v: number, currency = "ARS", locale = "es-AR") =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(v);

const GraficoCantidadDeVentas: React.FC<GraficoCantidadDeVentasProps> = ({
  data,
  title = "",
  className,
  lineColor = "#7aa3ff",
  fillArea = true,
  currency = "ARS",
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
      tooltip: {
        bodyFont: { size: 10 },
        callbacks: {
          label: (ctx) => {
            const v = Number(ctx.parsed.y ?? 0);
            const lbl = ctx.dataset.label || "";
            return ` ${lbl}: ${formatMoney(v, currency)}`;
          },
        },
      },
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
        // sin offset si hay 1 punto → evita márgenes laterales extra
        offset: !isSingle ? true : false,
        ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        // un poco de aire arriba si solo hay un valor
        suggestedMax: isSingle ? yMax * 1.3 : undefined,
        ticks: { font: { size: 10 }, callback: (v) => formatMoney(Number(v), currency) },
        title: { display: true, text: `Monto (${currency})` },
      },
    },
    layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: "Ingresos ($)",
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

export default GraficoCantidadDeVentas;
