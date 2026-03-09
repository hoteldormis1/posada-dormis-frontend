"use client";

import React from 'react';
import {
  Chart as ChartJS,
  type ChartOptions,
  type FontSpec,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

type GraficoPieProps = {
  labels: string[];
  data: number[];
  title?: string;
  backgroundColors?: string[];
  height?: number;
};

export default function GraficoPie({
  labels,
  data,
  title = 'Chart.js Pie Chart',
  backgroundColors,
}: GraficoPieProps) {
  const labelColor = "rgba(236, 253, 245, 0.85)";
  const borderColor = "rgba(255, 255, 255, 0.16)";
  const legendFont: Partial<FontSpec> = {
    size: 11,
    family: "Poppins, Segoe UI, sans-serif",
    weight: "bold",
  };
  const titleFont: Partial<FontSpec> = {
    size: 12,
    family: "Poppins, Segoe UI, sans-serif",
    weight: "bold",
  };
  const tooltipTitleFont: Partial<FontSpec> = {
    size: 11,
    family: "Poppins, Segoe UI, sans-serif",
    weight: "bold",
  };

  const pieData = {
    labels,
    datasets: [
      {
        label: 'Cantidad',
        data,
        backgroundColor: backgroundColors || [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: labelColor,
          boxWidth: 10,
          boxHeight: 10,
          font: legendFont,
        },
      },
      title: {
        display: true,
        text: title,
        color: labelColor,
        font: titleFont,
      },
      tooltip: {
        titleColor: labelColor,
        bodyColor: labelColor,
        backgroundColor: "rgba(7, 27, 18, 0.95)",
        borderColor,
        borderWidth: 1,
        bodyFont: {
          size: 11,
          family: "Poppins, Segoe UI, sans-serif",
        },
        titleFont: {
          ...tooltipTitleFont,
        },
      },
    },
    elements: {
      arc: {
        borderColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
      },
    },
  };

  return <Pie data={pieData} options={options} />;
}
