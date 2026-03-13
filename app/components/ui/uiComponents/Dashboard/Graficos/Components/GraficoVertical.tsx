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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

type Dataset = {
  label: string;
  data: number[];
  color?: string;          // color principal de la línea/punto
  fill?: boolean;          // fill del área bajo la línea (multi)
  backgroundColor?: string;
};

type Props = {
  labels: string[];
  datasets: Dataset[];     // si hay varios, se dibujan varias líneas
  title?: string;
  className?: string;
  yType?: "number" | "money";
  currency?: string;
};

const formatMoney = (v: number, currency = "ARS", locale = "es-AR") =>
  new Intl.NumberFormat(locale, { style: "currency", currency }).format(v);

const GraficoLinea: React.FC<Props> = ({
  labels,
  datasets,
  title = "",
  className,
  yType = "number",
  currency = "ARS",
}) => {
  const labelColor = "rgba(236, 253, 245, 0.85)";
  const mutedLabelColor = "rgba(236, 253, 245, 0.65)";
  const gridColor = "rgba(255, 255, 255, 0.08)";
  const tooltipBg = "rgba(7, 27, 18, 0.95)";

  const { isSingle, yMax } = useMemo(() => {
    const isSingle = labels.length === 1;
    const allValues = datasets.flatMap((d) => d.data ?? []);
    const yMax = allValues.length ? Math.max(...allValues) : 0;
    return { isSingle, yMax };
  }, [labels, datasets]);

  const yTitle = yType === "money" ? `Monto (${currency})` : "Cantidad";

  // ————————————————————————————————————————————————
  // 1 SOLO LABEL → línea horizontal + punto centrado
  // ————————————————————————————————————————————————
  if (isSingle) {
    // Tomo el 1er dataset y su valor
    const color = datasets[0]?.color ?? "#3b82f6";
    const value = datasets[0]?.data?.[0] ?? 0;

    // Dataset 1: línea horizontal (para poder mostrar fill si querés)
    const areaDataset = {
      label: "",                            // sin leyenda
      data: [
        { x: -0.5, y: value },
        { x:  0.5, y: value },
      ],
      type: "line" as const,
      borderColor: color,
      borderWidth: 2,
      backgroundColor: color + "33",       // 20% alpha
      tension: 0,
      fill: true,
      pointRadius: 0,
      pointHoverRadius: 0,
    };

    // Dataset 2: punto grande en el centro
    const pointDataset = {
      label: datasets[0]?.label || "Valor",
      data: [{ x: 0, y: value }],
      type: "line" as const,
      showLine: false,
      pointRadius: 10,
      pointHoverRadius: 12,
      pointBackgroundColor: color,
      pointBorderColor: "#fff",
      pointBorderWidth: 3,
    };

    const data = { datasets: [areaDataset as any, pointDataset as any] };

    const options: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            boxWidth: 10,
            color: labelColor,
            font: { size: 10, family: "Poppins, Segoe UI, sans-serif", weight: "bold" },
            // solo mostrar el dataset del punto si tiene label
            filter: (item, chartData) => {
              const ds = chartData.datasets?.[item.datasetIndex || 0] as any;
              return !!ds?.label;
            },
          },
        },
        title: {
          display: !!title,
          text: title,
          color: labelColor,
          font: { size: 12, family: "Poppins, Segoe UI, sans-serif", weight: "bold" },
        },
        tooltip: {
          titleColor: labelColor,
          bodyColor: labelColor,
          backgroundColor: tooltipBg,
          borderColor: "rgba(255, 255, 255, 0.16)",
          borderWidth: 1,
          bodyFont: { size: 10, family: "Poppins, Segoe UI, sans-serif" },
          titleFont: { size: 10, family: "Poppins, Segoe UI, sans-serif", weight: "bold" },
          callbacks: {
            title: () => labels[0] || "Fecha",
            label: (ctx) => {
              const v = Number(ctx.parsed.y ?? 0);
              const lbl = ctx.dataset.label || "Valor";
              return yType === "money"
                ? ` ${lbl}: ${formatMoney(v, currency)}`
                : ` ${lbl}: ${v}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          min: -0.5,
          max:  0.5,
          grid: { display: false },
          ticks: { display: false },
        },
        y: {
          beginAtZero: true,
          suggestedMax: yMax * 1.3,
          grid: { color: gridColor },
          ticks: {
            color: mutedLabelColor,
            font: { size: 10, family: "Poppins, Segoe UI, sans-serif" },
            callback: (val) =>
              yType === "money" ? formatMoney(Number(val), currency) : String(val),
          },
          title: {
            display: true,
            text: yTitle,
            color: labelColor,
            font: { size: 11, family: "Poppins, Segoe UI, sans-serif", weight: "bold" },
          },
        },
      },
    };

    return (
      <div className={className ?? "h-full"}>
        <Line options={options} data={data as any} />
      </div>
    );
  }

  // ————————————————————————————————————————————————
  // VARIOS LABELS → línea normal con categorías
  // ————————————————————————————————————————————————
  const lineData = {
    labels,
    datasets: datasets.map((ds) => {
      const color = ds.color ?? "#3b82f6";
      return {
        label: ds.label,
        data: ds.data,
        borderColor: color,
        backgroundColor: color + "33",
        tension: 0.3,
        fill: ds.fill ?? true,
  
        // 👇 puntos sólidos
        pointStyle: "circle",
        pointRadius: 6,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
        pointBorderColor: color,
        pointBorderWidth: 0, // sin borde → círculo sólido
      };
    }),
  };

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 10,
          color: labelColor,
          font: { size: 10, family: "Poppins, Segoe UI, sans-serif", weight: "bold" },
        },
      },
      title: {
        display: !!title,
        text: title,
        color: labelColor,
        font: { size: 12, family: "Poppins, Segoe UI, sans-serif", weight: "bold" },
      },
      tooltip: {
        titleColor: labelColor,
        bodyColor: labelColor,
        backgroundColor: tooltipBg,
        borderColor: "rgba(255, 255, 255, 0.16)",
        borderWidth: 1,
        bodyFont: { size: 10, family: "Poppins, Segoe UI, sans-serif" },
        titleFont: { size: 10, family: "Poppins, Segoe UI, sans-serif", weight: "bold" },
        callbacks: yType === "money"
          ? {
              label: (ctx) => {
                const v = Number(ctx.parsed.y ?? 0);
                const lbl = ctx.dataset.label || "";
                return ` ${lbl}: ${formatMoney(v, currency)}`;
              },
            }
          : undefined,
      },
    },
    scales: {
      x: {
        ticks: {
          color: mutedLabelColor,
          font: { size: 10, family: "Poppins, Segoe UI, sans-serif" },
          maxRotation: 0,
          autoSkip: true,
        },
        grid: { color: gridColor },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: {
          color: mutedLabelColor,
          font: { size: 10, family: "Poppins, Segoe UI, sans-serif" },
          callback: (val) =>
            yType === "money" ? formatMoney(Number(val), currency) : String(val),
        },
        title: {
          display: true,
          text: yTitle,
          color: labelColor,
          font: { size: 11, family: "Poppins, Segoe UI, sans-serif", weight: "bold" },
        },
      },
    },
  };

  return (
    <div className={className ?? "h-full"}>
      <Line options={lineOptions} data={lineData} />
    </div>
  );
};

export default GraficoLinea;
