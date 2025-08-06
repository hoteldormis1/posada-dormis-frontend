"use client"

import { fuenteDeSubtitulo } from "@/styles/global-styles";
import React from "react";
import TablaHabitaciones from "./Widgets/TablaReservas";
import {GraficoCantidadDeReservas, GraficoCantidadDeVentas, GraficoPieEstadoHabitaciones} from "@/components/index";

// Datos simulados
const graficosData = [
  {
    titulo: "Cantidad de reservas",
    grafico: <GraficoCantidadDeReservas/>,
  },
  {
    titulo: "Ventas",
    grafico: <GraficoCantidadDeVentas/>,
  },
  {
    titulo: "Habitaciones hoy",
    grafico: <TablaHabitaciones/>,
  },
  {
    titulo: "Estado de habitaciones hoy",
    grafico: <GraficoPieEstadoHabitaciones/>
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
            {/* {grafico?.contenido && <label className="text-sm text-gray-600">{grafico?.contenido}</label>} */}
            {grafico && grafico.grafico}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Graficos;
