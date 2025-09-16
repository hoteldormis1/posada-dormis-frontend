"use client";


import React, { useState } from 'react';

export interface EstadoReserva {
  id: number;
  nombre: string;
  descripcion: string;
  prioridad: number;
}

interface EstadoReservaSelectorProps {
  estadoActual: string;
  estados: EstadoReserva[];
  onEstadoChange: (nuevoEstado: string) => void;
  disabled?: boolean;
  className?: string;
}

// Estados predefinidos en orden de flujo
const ESTADOS_FLUJO = ['pendiente', 'confirmada', 'checkin', 'checkout'];

export default function EstadoReservaSelector({
  estadoActual,
  estados,
  onEstadoChange,
  disabled = false,
  className = ''
}: EstadoReservaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Encontrar el estado actual en la lista de estados
  const estadoActualObj = estados.find(e => e.nombre === estadoActual);
  
  // Encontrar el siguiente estado en el flujo
  const indiceActual = ESTADOS_FLUJO.indexOf(estadoActual);
  const siguienteEstado = indiceActual >= 0 && indiceActual < ESTADOS_FLUJO.length - 1 
    ? ESTADOS_FLUJO[indiceActual + 1] 
    : null;

  const handleSiguienteEstado = () => {
    if (siguienteEstado && !disabled) {
      onEstadoChange(siguienteEstado);
    }
  };

  const handleEstadoSeleccionado = (estado: string) => {
    onEstadoChange(estado);
    setIsOpen(false);
  };

  // Estilos de estado
  const getEstadoStyle = (nombre: string) => {
    const styles = {
      pendiente: "bg-yellow-500 text-white border border-yellow-600",
      confirmada: "bg-blue-600 text-white border border-blue-700", 
      checkin: "bg-green-600 text-white border border-green-700",
      checkout: "bg-indigo-500 text-white border border-indigo-600",
      cancelada: "bg-red-500 text-white border border-red-600",
    };
    return styles[nombre as keyof typeof styles] || "bg-gray-500 text-white border border-gray-600";
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Solo flecha para siguiente estado */}
      {siguienteEstado && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSiguienteEstado();
          }}
          className="p-1 rounded bg-white/90 hover:bg-white transition-all text-gray-700 hover:text-gray-900 hover:scale-110 active:scale-95 shadow-sm border border-gray-200"
          title={`Cambiar de ${estadoActual} a ${siguienteEstado}`}
        >
          <svg 
            className="w-3 h-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={3} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </button>
      )}

      {/* Dropdown de estados */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-xl z-50 min-w-[120px] max-h-48 overflow-y-auto">
          {estados.map((estado) => (
            <button
              key={estado.id}
              onClick={(e) => {
                e.stopPropagation();
                handleEstadoSeleccionado(estado.nombre);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 ${getEstadoStyle(estado.nombre)} ${
                estado.nombre === estadoActual ? 'font-semibold ring-2 ring-blue-300' : ''
              }`}
              title={estado.descripcion}
            >
              {estado.nombre.charAt(0).toUpperCase() + estado.nombre.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
