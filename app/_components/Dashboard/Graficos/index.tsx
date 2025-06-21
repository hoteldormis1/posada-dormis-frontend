"use client"

import { fuenteDeSubtitulo } from "@/_styles/global-styles";
import React from "react";
import TablaHabitaciones from "./Widgets/TablaReservas";
import GraficoCantidadDeReservas from "./Widgets/GraficoVertical/CantidadDeReservas";
import GraficoCantidadDeVentas from "./Widgets/GraficoVertical/CantidadDeVentas";

// Datos simulados
const graficosData = [
  {
    titulo: "Cantidad de reservas",
    grafico: <GraficoCantidadDeReservas/>,
    // contenido: "(acá va lista de cantidad de reservas)",
  },
  {
    titulo: "Ventas",
    // contenido: "(acá va gráfico de ventas)",
    grafico: <GraficoCantidadDeVentas/>,
  },
  {
    titulo: "Habitaciones hoy",
    // contenido: "(acá va lista del estado de habitaciones hoy)",
    grafico: <TablaHabitaciones/>,
  },
  {
    titulo: "Estado de habitaciones hoy",
    contenido: "(acá va un pie chart del estado de habitaciones hoy)",
  },
];

const Graficos = () => {
  return (
    <div className="pt-8 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {graficosData.map((grafico, index) => (
          <div
            key={index}
            className="flex flex-col p-6 border-1 border-gray-400 shadow-md rounded-xl min-h-[300px] max-h-[500px]"
          >
            <label className={fuenteDeSubtitulo}>{grafico.titulo}</label>
            <label className="text-sm text-gray-600">{grafico.contenido}</label>
            {grafico && grafico.grafico}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Graficos;
