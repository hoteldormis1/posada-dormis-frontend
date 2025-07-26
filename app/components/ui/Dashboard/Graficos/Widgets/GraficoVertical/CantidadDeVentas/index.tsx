"use client";

import React from "react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

const options = {
	responsive: true,
	plugins: {
		legend: {
			position: "top" as const,
		},
		title: {
			display: true,
			text: "",
		},
	},
};

const labels = ["Enero", "Febrero", "Marzo", "Abril", "Mayo"];
const dataset1 = [100000, 150000, 50000, 80000, 46000];

const data = {
	labels,
	datasets: [
		{
			label: "Cantidad de ventas",
			data: dataset1,
			backgroundColor: "#8ae08a",
		},
	],
};

const GraficoCantidadDeVentas = () => {
	return <Bar options={options} data={data} />;
};

export default GraficoCantidadDeVentas;
