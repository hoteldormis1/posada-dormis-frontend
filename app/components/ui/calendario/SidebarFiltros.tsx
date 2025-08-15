"use client";

import React from "react";
import { useAppSelector } from "@/lib/store/hooks";

export type RoomOption = { idHabitacion: number; nombre: string; enabled: boolean };

type Props = {
  onToggleRoom: (idHabitacion: number, enabled: boolean) => void;
  onEnableAll: () => void;
  onDisableAll: () => void;

  showAvailable: boolean;
  showUnavailable: boolean;
  onToggleAvailable: (v: boolean) => void;
  onToggleUnavailable: (v: boolean) => void;
  habitacionesDatos: any;
  onClose?: () => void;          // botón de cerrar (opcional)
  className?: string;
};

const SidebarFiltros: React.FC<Props> = ({
  onToggleRoom,
  onEnableAll,
  onDisableAll,
  //showAvailable,
  //showUnavailable,
  //onToggleAvailable,
  //onToggleUnavailable,
  onClose,
  habitacionesDatos,
  className = "",
}) => {

  return (
    <aside
      className={[
        "sticky self-start",
        "h-screen overflow-auto",
        "w-full bg-white p-4 shadow-sm",
        className,
      ].join(" ")}
      aria-label="Barra lateral de filtros"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Filtros</h3>

        {/* 
        onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
            aria-label="Cerrar filtros"
            title="Cerrar"
          >
            ×
          </button>
        )
        */}
      </div>

      <div className="mt-2">
        <p className="text-xs font-medium text-gray-500 mb-2">Acciones</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEnableAll}
            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
          >
            Habilitar todos
          </button>
          <button
            type="button"
            onClick={onDisableAll}
            className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50"
          >
            Deshabilitar todos
          </button>
        </div>
      </div>

      <details open className="mt-4">
        <summary className="cursor-pointer select-none text-xs font-medium text-gray-500">
          Habitaciones
        </summary>
        <ul className="mt-2 space-y-1.5">
          {habitacionesDatos.map((r) => (
            <li key={r.idHabitacion} className="flex items-center gap-2">
              <input
                id={`room-${r.idHabitacion}`}
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={r.enabled}
                onChange={(e) => onToggleRoom(r.idHabitacion, e.target.checked)}
              />
              <label htmlFor={`room-${r.idHabitacion}`} className="text-sm">
                {r.nombre}
              </label>
            </li>
          ))}
          {habitacionesDatos.length === 0 && (
            <li className="text-xs text-gray-500">No hay habitaciones para listar.</li>
          )}
        </ul>
      </details>
    </aside>
  );
};

export default SidebarFiltros;
