"use client";

import api from '@/lib/store/axiosConfig';
import { useState, useCallback } from 'react';
import { useAppDispatch } from '@/lib/store/hooks';
import { AppDispatch } from '@/lib/store/store';

export interface EstadoReserva {
  id: number;
  nombre: string;
  descripcion: string;
  prioridad: number;
}

interface UseEstadoReservaProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export function useEstadoReserva({ onSuccess, onError }: UseEstadoReservaProps = {}) {
  const [estados, setEstados] = useState<EstadoReserva[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const dispatch: AppDispatch = useAppDispatch();

  // Función para cambiar el estado de una reserva
  const cambiarEstadoReserva = useCallback(async (reservaId: number, nuevoEstado: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Primero necesitamos obtener el ID del estado por su nombre
      const estadosResponse = await api.get('/estadoReserva');
      const estado = estadosResponse.data.find((e: EstadoReserva) => e.nombre === nuevoEstado);
      
      if (!estado) {
        throw new Error(`Estado '${nuevoEstado}' no encontrado`);
      }

      // Actualizar la reserva con el nuevo estado
      await api.put(`/reservas/${reservaId}`, {
        idEstadoReserva: estado.id
      });
      
      // No refrescar automáticamente los datos del calendario
      // El componente padre debe manejar la actualización de datos
      
      onSuccess?.();
    } catch (error) {
      console.error('Error al actualizar estado de reserva:', error);
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  // Función para obtener los estados disponibles
  const obtenerEstados = useCallback(async (): Promise<EstadoReserva[]> => {
    try {
      const response = await api.get('/estadoReserva');
      const estadosData = response.data;
      setEstados(estadosData);
      return estadosData;
    } catch (error) {
      console.error('Error al obtener estados de reserva:', error);
      setError(error);
      return [];
    }
  }, []);

  return {
    estados,
    cambiarEstadoReserva,
    obtenerEstados,
    isLoading,
    error
  };
}
