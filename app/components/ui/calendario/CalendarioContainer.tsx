"use client";


import React, { useEffect } from 'react';
import Calendario, { Room, Booking } from './Calendario';
import { useEstadoReserva } from '../../../hooks/useEstadoReserva';

interface CalendarioContainerProps {
  rooms: Room[];
  bookings: Booking[];
  startDate?: string | Date;
  days?: number;
  onRangeChange?: (start: Date, end: Date) => void;
  onBookingClick?: (id: string | number) => void;
  onDateRangeSelect?: (range: { start: Date; end: Date; roomId: string | number }) => void;
  onRefreshCalendar?: () => void;
  className?: string;
  showSelection?: boolean;
}

export default function CalendarioContainer({
  rooms,
  bookings,
  startDate,
  days,
  onRangeChange,
  onBookingClick,
  onDateRangeSelect,
  onRefreshCalendar,
  className,
  showSelection = true,
}: CalendarioContainerProps) {
  const { estados, cambiarEstadoReserva, obtenerEstados } = useEstadoReserva({
    onSuccess: () => {
      console.log('Estado de reserva actualizado exitosamente');
      // Refrescar los datos del calendario después de actualizar el estado
      if (onRefreshCalendar) {
        onRefreshCalendar();
      }
    },
    onError: (error) => {
      console.error('Error al actualizar estado de reserva:', error);
      // Aquí podrías mostrar un toast de error
    }
  });

  // Cargar estados al montar el componente
  useEffect(() => {
    obtenerEstados();
  }, [obtenerEstados]);

  const handleEstadoChange = (reservaId: string | number, nuevoEstado: string) => {
    cambiarEstadoReserva(Number(reservaId), nuevoEstado);
  };

  return (
    <Calendario
      rooms={rooms}
      bookings={bookings}
      startDate={startDate}
      days={days}
      onRangeChange={onRangeChange}
      onBookingClick={onBookingClick}
      onDateRangeSelect={onDateRangeSelect}
      onEstadoChange={handleEstadoChange}
      estadosReserva={estados}
      showSelection={showSelection}
      className={className}
    />
  );
}