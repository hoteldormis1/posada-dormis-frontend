import React from 'react';
import {
  Chart as ChartJS,
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
};

export default function GraficoPie({
  labels,
  data,
  title = 'Chart.js Pie Chart',
  backgroundColors,
}: GraficoPieProps) {
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

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return <Pie data={pieData} options={options} />;
}
