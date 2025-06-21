import { fuenteDeSubtitulo } from "@/_styles/global-styles";
import React from "react";

// Datos simulados
const graficosData = [
  {
    titulo: "Cantidad de reservas",
    contenido: "(acá va lista de cantidad de reservas)",
  },
  {
    titulo: "Ventas",
    contenido: "(acá va gráfico de ventas)",
  },
  {
    titulo: "Habitaciones hoy",
    contenido: "(acá va lista del estado de habitaciones hoy)",
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
            className="flex flex-col p-6 border-1 border-gray-400 shadow-md rounded-xl min-h-[300px]"
          >
            <label className={fuenteDeSubtitulo}>{grafico.titulo}</label>
            <label className="text-sm text-gray-600">{grafico.contenido}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Graficos;
