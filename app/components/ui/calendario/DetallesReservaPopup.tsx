"use client";

import React, { useEffect, useState } from "react";
import { PopupContainer } from "@/components";
import { Booking } from "./Calendario";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { editReserva } from "@/lib/store/utils/reservas/reservasSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import EstadoSlider from "./EstadoSlider";
import { getEstadoReservaLabel, getEstadoReservaTheme } from "@/utils/helpers/reservaEstado";

const parseD = (d: string | Date): Date => {
  const x = d instanceof Date ? d : new Date(d + (d.toString().length === 10 ? "T00:00:00" : ""));
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
};

const fmtLong = (d: Date) =>
  d.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });

const diffNoches = (start: Date, end: Date): number =>
  Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

interface DetallesReservaPopupProps {
  booking: Booking | null;
  roomName?: string;
  onClose: () => void;
  onStatusChange?: () => void;
}

/* ── small helper for info cards ───────────────────────────────────────────── */
function InfoCard({
  label,
  children,
  accent,
}: {
  label: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: accent ? `${accent}10` : "rgba(255,255,255,0.05)",
        border: `1px solid ${accent ? `${accent}25` : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <h3
        className="text-[12px] font-semibold uppercase tracking-widest mb-1.5 text-emerald-100/65"
      >
        {label}
      </h3>
      {children}
    </div>
  );
}

export default function DetallesReservaPopup({
  booking,
  roomName,
  onClose,
  onStatusChange,
}: DetallesReservaPopupProps) {
  const dispatch: AppDispatch = useAppDispatch();
  const estadosDeReserva = useAppSelector(
    (s: RootState) => (s.habitaciones as any).estadosDeReserva ?? []
  );

  const [estadoLocal, setEstadoLocal] = useState<string>("");
  const [estadoLoading, setEstadoLoading] = useState(false);
  const [estadoError, setEstadoError] = useState<string | null>(null);
  const [estadoSuccess, setEstadoSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!booking) return;
    setEstadoLocal(booking.status?.toLowerCase() || "");
  }, [booking?.id, booking?.status]);

  const [showEditPago, setShowEditPago] = useState(false);
  const [montoPagadoEdit, setMontoPagadoEdit] = useState<number>(0);
  const [montoPagadoLocal, setMontoPagadoLocal] = useState<number>(0);
  const [pagoLoading, setPagoLoading] = useState(false);
  const [pagoError, setPagoError] = useState<string | null>(null);
  const [pagoSuccess, setPagoSuccess] = useState<string | null>(null);

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

    const origen = String(estadoLocal || "").toLowerCase();
    const destino = String(nuevoEstado || "").toLowerCase();
    const origenBloqueado = ["confirmada", "checkin", "checkout"].includes(origen);
    const destinoBloqueado = ["pendiente"].includes(destino);
    if (origenBloqueado && destinoBloqueado) {
      setEstadoError(
        "No se puede volver a pendiente si la reserva ya fue confirmada."
      );
      setEstadoSuccess(null);
      return;
    }

    setEstadoLoading(true);
    setEstadoError(null);
    setEstadoSuccess(null);
    try {
      const estadoDestino = (estadosDeReserva as any[]).find(
        (e) => String(e?.nombre || "").toLowerCase() === nuevoEstado.toLowerCase()
      );
      if (!estadoDestino?.idEstadoReserva) throw new Error("No se encontró el estado destino.");
      await dispatch(
        editReserva({ id: String(booking.id), idEstadoReserva: Number(estadoDestino.idEstadoReserva) })
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

  const statusTheme = getEstadoReservaTheme(estadoLocal).hex;

  return (
    <PopupContainer onClose={onClose} title="Detalles de la Reserva">
      <div className="pt-5 space-y-4">

        {/* Huésped + Habitación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoCard label="Huésped">
            <p className="text-base font-semibold text-white">{booking.guest || "Sin nombre"}</p>
          </InfoCard>
          <InfoCard label="Habitación">
            <p className="text-base font-semibold text-white">{roomName || `Habitación ${booking.roomId}`}</p>
          </InfoCard>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <InfoCard label="Check-in" accent="#38bdf8">
            <p className="text-base font-semibold text-white capitalize">{fmtLong(startDate)}</p>
          </InfoCard>
          <InfoCard label="Check-out" accent="#fb7185">
            <p className="text-base font-semibold text-white capitalize">{fmtLong(endDate)}</p>
          </InfoCard>
        </div>

        {/* Estado / Noches / Total */}
        <div className="grid grid-cols-3 gap-3">
          <InfoCard label="Estado" accent={statusTheme.color}>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: statusTheme.color }}
              />
              <p className="text-sm font-semibold text-white">{getEstadoReservaLabel(estadoLocal)}</p>
            </div>
          </InfoCard>
          <InfoCard label="Noches">
            <p className="text-base font-semibold text-white">
              {noches}{" "}
              <span className="text-xs text-white/55 font-normal">
                {noches === 1 ? "noche" : "noches"}
              </span>
            </p>
          </InfoCard>
          <InfoCard label="Total">
            <p className="text-base font-semibold text-emerald-300">
              {booking.price ? `$${booking.price.toLocaleString("es-AR")}` : "—"}
            </p>
          </InfoCard>
        </div>

        {/* Pago */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "rgba(52,211,153,0.06)",
            border: "1px solid rgba(52,211,153,0.18)",
          }}
        >
          {!showEditPago ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400/70 mb-1">
                  Monto Pagado
                </p>
                <p className="text-base font-semibold text-white">
                  ${montoPagadoActual.toLocaleString("es-AR")}
                  {montoTotal > 0 && (
                    <span className="text-sm text-white/35 font-normal ml-1.5">
                      / ${montoTotal.toLocaleString("es-AR")}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={handleOpenEditPago}
                className="cursor-pointer px-4 py-2 text-sm font-semibold bg-emerald-400/15 hover:bg-emerald-400/25 border border-emerald-400/30 text-emerald-300 rounded-lg transition-all"
              >
                Registrar Pago
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-semibold text-emerald-400/80">
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
                className="w-full accent-emerald-400"
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
                    const v = Math.min(
                      Math.max(Number(e.target.value || 0), 0),
                      Math.max(montoTotal, 1)
                    );
                    setMontoPagadoEdit(v);
                  }}
                  className="flex-1 bg-white/8 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50"
                  placeholder="Monto pagado"
                />
                {montoTotal > 0 && (
                  <button
                    type="button"
                    onClick={() => setMontoPagadoEdit(montoTotal)}
                    className="cursor-pointer px-3 py-1.5 text-sm font-semibold bg-emerald-400/15 hover:bg-emerald-400/25 border border-emerald-400/30 text-emerald-300 rounded-lg transition-all"
                    title="Completar el monto total"
                  >
                    Completar
                  </button>
                )}
              </div>
              {pagoError && <p className="text-xs text-red-400">{pagoError}</p>}
              {pagoSuccess && <p className="text-xs text-emerald-400">{pagoSuccess}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowEditPago(false)}
                  disabled={pagoLoading}
                  className="cursor-pointer flex-1 px-3 py-1.5 text-sm font-medium bg-white/6 hover:bg-white/10 border border-white/12 text-white/70 rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePago}
                  disabled={pagoLoading}
                  className="cursor-pointer flex-1 px-3 py-1.5 text-sm font-semibold bg-emerald-400/20 hover:bg-emerald-400/30 border border-emerald-400/35 text-emerald-300 rounded-lg transition-all disabled:opacity-50"
                >
                  {pagoLoading ? "Guardando…" : "Guardar Pago"}
                </button>
              </div>
            </div>
          )}
        </div>

        
        {/* Slider de estado */}
        <div className="pt-1">
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
