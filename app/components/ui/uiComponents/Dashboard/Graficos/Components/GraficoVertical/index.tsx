import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Opciones del gráfico
const defaultOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Chart.js Bar Chart',
    },
  },
};

// Tipado de props (opcional pero recomendable si usás TypeScript)
type Dataset = {
  label: string;
  data: number[];
  backgroundColor?: string;
};

type GraficoVerticalProps = {
  labels: string[];
  datasets: Dataset[];
  title?: string;
};

export default function GraficoVertical({
  labels,
  datasets,
  title = 'Chart.js Bar Chart',
}: GraficoVerticalProps) {
  const data = {
    labels,
    datasets,
  };

  const options = {
    ...defaultOptions,
    plugins: {
      ...defaultOptions.plugins,
      title: {
        ...defaultOptions.plugins.title,
        text: title,
      },
    },
  };

  return <Bar options={options} data={data} />;
}
