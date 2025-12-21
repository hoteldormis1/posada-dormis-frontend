"use client";

import React from "react";
import { PopupContainer } from "@/components";
import { Booking } from "./Calendario";

// Función helper para formatear fechas
const parseD = (d: string | Date): Date => {
  const x = d instanceof Date ? d : new Date(d + (d.toString().length === 10 ? "T00:00:00" : ""));
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
};

const fmtLong = (d: Date) =>
  d.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });

const diffNoches = (start: Date, end: Date): number => {
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

interface DetallesReservaPopupProps {
  booking: Booking | null;
  roomName?: string;
  onClose: () => void;
}

export default function DetallesReservaPopup({ booking, roomName, onClose }: DetallesReservaPopupProps) {
  if (!booking) return null;

  const startDate = parseD(booking.start);
  const endDate = parseD(booking.end);
  const noches = diffNoches(startDate, endDate);

  // Estilos de estado
  const statusStyles: Record<string, { label: string; color: string }> = {
    pendiente: { label: "Pendiente", color: "bg-yellow-500" },
    confirmada: { label: "Confirmada", color: "bg-blue-600" },
    checkin: { label: "Check-in", color: "bg-green-600" },
    checkout: { label: "Check-out", color: "bg-indigo-500" },
    cancelada: { label: "Cancelada", color: "bg-red-500" },
    unconfirmed: { label: "Sin confirmar", color: "bg-yellow-500" },
    confirmed: { label: "Confirmada", color: "bg-blue-600" },
    paid: { label: "Pagada", color: "bg-green-600" },
  };

  const statusInfo = statusStyles[booking.status?.toLowerCase() || ""] || {
    label: booking.status || "Sin estado",
    color: "bg-gray-500",
  };

  return (
    <PopupContainer onClose={onClose} title="Detalles de la Reserva">
      <div className="pt-6 space-y-6">
        {/* Información principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Huésped */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Huésped</h3>
            <p className="text-lg font-medium text-gray-900">{booking.guest || "Sin nombre"}</p>
          </div>

          {/* Habitación */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Habitación</h3>
            <p className="text-lg font-medium text-gray-900">{roomName || `Habitación ${booking.roomId}`}</p>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-700 uppercase mb-2">Check-in</h3>
            <p className="text-lg font-medium text-blue-900">{fmtLong(startDate)}</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-sm font-semibold text-red-700 uppercase mb-2">Check-out</h3>
            <p className="text-lg font-medium text-red-900">{fmtLong(endDate)}</p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Estado */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Estado</h3>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${statusInfo.color}`}></span>
              <p className="text-lg font-medium text-gray-900">{statusInfo.label}</p>
            </div>
          </div>

          {/* Noches */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Noches</h3>
            <p className="text-lg font-medium text-gray-900">{noches} {noches === 1 ? "noche" : "noches"}</p>
          </div>

          {/* Precio */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Precio Total</h3>
            <p className="text-lg font-medium text-gray-900">
              {booking.price ? `$${booking.price.toLocaleString("es-AR")}` : "No especificado"}
            </p>
          </div>
        </div>

        {/* ID de Reserva */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">ID de Reserva</h3>
          <p className="text-sm text-gray-600">#{booking.id}</p>
        </div>
      </div>
    </PopupContainer>
  );
}
