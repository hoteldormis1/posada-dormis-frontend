"use client";

import React, { useEffect, useState } from "react";
import { PopupContainer } from "@/components";
import { Booking } from "./Calendario";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  editReserva,
} from "@/lib/store/utils/reservas/reservasSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import EstadoSlider from "./EstadoSlider";
import { getEstadoReservaLabel, getEstadoReservaTheme } from "@/utils/helpers/reservaEstado";

const parseD = (d: string | Date): Date => {
  const x = d instanceof Date ? d : new Date(d + (d.toString().length === 10 ? "T00:00:00" : ""));
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
};

const fmtLong = (d: Date) =>
  d.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });

const diffNoches = (start: Date, end: Date): number => {
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

interface DetallesReservaPopupProps {
  booking: Booking | null;
  roomName?: string;
  onClose: () => void;
  onStatusChange?: () => void;
}

export default function DetallesReservaPopup({ booking, roomName, onClose, onStatusChange }: DetallesReservaPopupProps) {
  const dispatch: AppDispatch = useAppDispatch();
  const estadosDeReserva = useAppSelector((s: RootState) => (s.habitaciones as any).estadosDeReserva ?? []);
  const [estadoLocal, setEstadoLocal] = useState<string>("");
  const [estadoLoading, setEstadoLoading] = useState(false);
  const [estadoError, setEstadoError] = useState<string | null>(null);
  const [estadoSuccess, setEstadoSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!booking) return;
    setEstadoLocal(booking.status?.toLowerCase() || "");
  }, [booking?.id, booking?.status]);

  // Estado para editar pago
  const [showEditPago, setShowEditPago] = useState(false);
  const [montoPagadoEdit, setMontoPagadoEdit] = useState<number>(0);
  const [montoPagadoLocal, setMontoPagadoLocal] = useState<number>(0);
  const [pagoLoading, setPagoLoading] = useState(false);
  const [pagoError, setPagoError] = useState<string | null>(null);
  const [pagoSuccess, setPagoSuccess] = useState<string | null>(null);

  // Sincronizar monto pagado cada vez que cambia el booking
  useEffect(() => {
    if (!booking) return;
    setMontoPagadoLocal(Number(booking.montoPagado ?? 0));
  }, [booking?.id, booking?.montoPagado]);

  if (!booking) return null;

  const montoTotal = booking.price ?? 0;
  const montoPagadoActual = montoPagadoLocal;

  const handleOpenEditPago = () => {
    setMontoPagadoEdit(montoPagadoActual);
    setPagoError(null);
    setPagoSuccess(null);
    setShowEditPago(true);
  };

  const handleSavePago = async () => {
    setPagoLoading(true);
    setPagoError(null);
    setPagoSuccess(null);
    try {
      await dispatch(editReserva({ id: String(booking.id), montoPagado: montoPagadoEdit })).unwrap();
      setMontoPagadoLocal(montoPagadoEdit);
      setPagoSuccess("Pago actualizado correctamente.");
      onStatusChange?.();
      setTimeout(() => setShowEditPago(false), 1200);
    } catch (err: any) {
      setPagoError(typeof err === "string" ? err : "Error al actualizar el pago.");
    } finally {
      setPagoLoading(false);
    }
  };

  const startDate = parseD(booking.start);
  const endDate = parseD(booking.end);
  const noches = diffNoches(startDate, endDate);

  const handleSetEstado = async (nuevoEstado: string) => {
    if (nuevoEstado === estadoLocal || estadoLoading) return;
    setEstadoLoading(true);
    setEstadoError(null);
    setEstadoSuccess(null);
    try {
      const estadoDestino = (estadosDeReserva as any[]).find(
        (e) => String(e?.nombre || "").toLowerCase() === nuevoEstado.toLowerCase()
      );
      if (!estadoDestino?.idEstadoReserva) {
        throw new Error("No se encontró el estado destino en la API.");
      }
      await dispatch(
        editReserva({
          id: String(booking.id),
          idEstadoReserva: Number(estadoDestino.idEstadoReserva),
        })
      ).unwrap();
      setEstadoLocal(nuevoEstado);
      setEstadoSuccess(`Estado cambiado a "${nuevoEstado}"`);
      onStatusChange?.();
      setTimeout(() => setEstadoSuccess(null), 2000);
    } catch (err: any) {
      setEstadoError(typeof err === "string" ? err : "Error al cambiar el estado.");
    } finally {
      setEstadoLoading(false);
    }
  };

  return (
    <PopupContainer onClose={onClose} title="Detalles de la Reserva">
      <div className="pt-6 space-y-6">
        {/* Info principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Huésped</h3>
            <p className="text-lg font-medium text-gray-900">{booking.guest || "Sin nombre"}</p>
          </div>
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

        {/* Info adicional */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Estado</h3>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${getEstadoReservaTheme(estadoLocal).tw.dot}`}></span>
              <p className="text-lg font-medium text-gray-900">{getEstadoReservaLabel(estadoLocal)}</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Noches</h3>
            <p className="text-lg font-medium text-gray-900">{noches} {noches === 1 ? "noche" : "noches"}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">Precio Total</h3>
            <p className="text-lg font-medium text-gray-900">
              {booking.price ? `$${booking.price.toLocaleString("es-AR")}` : "No especificado"}
            </p>
          </div>
        </div>

        {/* Pago */}
        <div className="bg-gray-50 border border-none p-4 rounded-lg">
          <div className="flex items-center justify-between">
            {!showEditPago && (
              <div>
                <h3 className="text-sm font-semibold text-black uppercase mb-1">Monto Pagado</h3>
                <p className="text-lg font-medium text-black">
                  ${montoPagadoActual.toLocaleString("es-AR")}
                  {montoTotal > 0 && (
                    <span className="text-sm text-black ml-2">
                      / ${montoTotal.toLocaleString("es-AR")}
                    </span>
                  )}
                </p>
              </div>
            )}
            {!showEditPago && (
              <button
                onClick={handleOpenEditPago}
                className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                Confirmar Pago
              </button>
            )}
          </div>

          {/* Panel inline de edición */}
          {showEditPago && (
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-xs text-green-700 font-medium">
                <span>Pagado: ${montoPagadoEdit.toLocaleString("es-AR")}</span>
                {montoTotal > 0 && <span>Total: ${montoTotal.toLocaleString("es-AR")}</span>}
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(montoTotal, 1)}
                step={Math.max(Math.round(Math.max(montoTotal, 1) / 100), 1)}
                value={montoPagadoEdit}
                onChange={(e) => setMontoPagadoEdit(Number(e.target.value))}
                className="w-full accent-green-600"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={Math.max(montoTotal, 1)}
                  step={1}
                  value={montoPagadoEdit}
                  onChange={(e) => {
                    const v = Math.min(Math.max(Number(e.target.value || 0), 0), Math.max(montoTotal, 1));
                    setMontoPagadoEdit(v);
                  }}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Monto pagado"
                />
                {montoTotal > 0 && (
                  <button
                    type="button"
                    onClick={() => setMontoPagadoEdit(montoTotal)}
                    className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                    title="Marcar como pagado completo"
                  >
                    Auto
                  </button>
                )}
              </div>
              {pagoError && (
                <p className="text-xs text-red-600">{pagoError}</p>
              )}
              {pagoSuccess && (
                <p className="text-xs text-green-700">{pagoSuccess}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditPago(false)}
                  disabled={pagoLoading}
                  className="flex-1 px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePago}
                  disabled={pagoLoading}
                  className="flex-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {pagoLoading ? "Guardando..." : "Guardar Pago"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ID de Reserva */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-600 uppercase mb-2">ID de Reserva</h3>
          <p className="text-sm text-gray-600">#{booking.id}</p>
        </div>

        {/* Slider de estado */}
        <div className="border-t pt-4">
          <EstadoSlider
            estadoActual={estadoLocal}
            estados={estadosDeReserva}
            onChange={handleSetEstado}
            loading={estadoLoading}
            error={estadoError}
            success={estadoSuccess}
          />
        </div>
      </div>
    </PopupContainer>
  );
}
