"use client";

import React, { useMemo, useCallback, useState } from "react";
import EstadoReservaSelector from "./EstadoReservaSelector";

/**
 * Calendario – estilo "Gantt" por habitación
 * Componente reutilizable para mostrar reservas en formato timeline
 */

export type Room = {
  id: string | number;
  name: string;
  numero?: number;
};

export type Booking = {
  id: string | number;
  roomId: string | number;
  start: string | Date; // inclusive
  end: string | Date;   // exclusive
  guest?: string;
  price?: number;
  status?: string;
  idEstadoReserva?: number;
  rightTopLabel?: string;     // p.ej. "Llegado" / "Confirmado"
  rightBottomLabel?: string;  // p.ej. "No pagado"
};

// Tipo para el rango seleccionado
export type DateRange = {
  start: Date;
  end: Date;
  roomId: string | number;
};

// Props del componente
export interface Calendario {
  rooms: Room[];
  bookings: Booking[];
  startDate?: string | Date;
  days?: number;
  onRangeChange?: (start: Date, end: Date) => void;
  onBookingClick?: (id: string | number) => void;
  onDateRangeSelect?: (range: DateRange) => void;
  onEstadoChange?: (reservaId: string | number, nuevoEstado: string) => void;
  estadosReserva?: Array<{id: number; nombre: string; descripcion: string; prioridad: number}>;
  showSelection?: boolean; // Nueva prop para controlar si mostrar la selección
  className?: string;
}

// Utilidades de fecha
function parseD(d: string | Date): Date {
  const x = d instanceof Date ? d : new Date(d + (d.toString().length === 10 ? "T00:00:00" : ""));
  return new Date(x.getFullYear(), x.getMonth(), x.getDate());
}

const fmtDay = (d: Date) => d.toLocaleDateString("es-AR", { day: "numeric" });
const fmtDow = (d: Date) => d.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "");
const fmtLong = (d: Date) =>
  d.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const diffDays = (a: Date, b: Date) => Math.round((parseD(b).getTime() - parseD(a).getTime()) / 86400000);

// Estilos de estado
const statusStyles = {
  pendiente: "bg-yellow-500 text-white border border-yellow-600",
  confirmada: "bg-blue-600 text-white border border-blue-700",
  checkin: "bg-green-600 text-white border border-green-700",
  checkout: "bg-indigo-500 text-white border border-indigo-600",
  cancelada: "bg-red-500 text-white border border-red-600 line-through opacity-90",
  unconfirmed: "bg-yellow-500 text-white border border-yellow-600",
  confirmed: "bg-blue-600 text-white border border-blue-700",
  paid: "bg-green-600 text-white border border-green-700",
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function Calendario({
  rooms,
  bookings,
  startDate,
  days = 14,
  onRangeChange,
  onBookingClick,
  onDateRangeSelect,
  onEstadoChange,
  estadosReserva = [],
  showSelection = true,
  className = "",
}: Calendario) {
  // Estado para la selección de rango
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ date: Date; roomId: string | number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ date: Date; roomId: string | number } | null>(null);
  const [lastScrollTime, setLastScrollTime] = useState(0);

  // Fecha de anclaje para el rango visible
  const [anchor, setAnchor] = useState<Date>(
    startDate ? parseD(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  );

  // Calcular el rango visible
  const range = useMemo(() => {
    const start = parseD(anchor);
    const end = addDays(start, days);
    return { start, end, days };
  }, [anchor, days]);

  // Lista de días
  const dayList = useMemo(() =>
    Array.from({ length: range.days }, (_, i) => addDays(range.start, i)),
    [range]
  );

  // Layout
  const dayW = 64;
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${range.days}, ${dayW}px)`
  };

  // Calcular el layout de las reservas
  const layoutByRoom = useMemo(() => {
    const map = new Map<number, (Booking & { left: number; width: number; clipped?: boolean })[]>();

    for (const b of bookings) {
      const roomNum = Number(b.roomId);
      if (!Number.isFinite(roomNum)) continue; // ignora ids no numéricos

      const s = parseD(b.start);
      const e = parseD(b.end); // end exclusive
      const startIdx = clamp(diffDays(range.start, s), 0, range.days);
      const endIdx = clamp(diffDays(range.start, e), 0, range.days);
      const visibleDays = endIdx - startIdx;
      if (visibleDays <= 0) continue;

      const left = startIdx * dayW;
      const width = Math.max(28, visibleDays * dayW - 8);
      const clipped = s < range.start || e > range.end;

      const arr = map.get(roomNum) || [];
      arr.push({ ...b, left, width, clipped });
      map.set(roomNum, arr);
    }

    return map;
  }, [bookings, range.start, range.days, dayW]);

  // Función para verificar si una fecha específica está ocupada
  const isDateOccupied = useCallback((date: Date, roomId: string | number) => {
    const roomBookings = layoutByRoom.get(Number(roomId)) || [];
    const targetDate = parseD(date);
    
    return roomBookings.some(booking => {
      const bookingStart = parseD(booking.start);
      const bookingEnd = parseD(booking.end);
      return targetDate >= bookingStart && targetDate < bookingEnd;
    });
  }, [layoutByRoom]);

  // Función para verificar si un rango de fechas está ocupado
  const isRangeOccupied = useCallback((start: Date, end: Date, roomId: string | number) => {
    const roomBookings = layoutByRoom.get(Number(roomId)) || [];
    const rangeStart = parseD(start);
    const rangeEnd = parseD(end);
    
    return roomBookings.some(booking => {
      const bookingStart = parseD(booking.start);
      const bookingEnd = parseD(booking.end);
      // Verificar si hay solapamiento
      return bookingStart < rangeEnd && bookingEnd > rangeStart;
    });
  }, [layoutByRoom]);

  // Navegación
  const move = (delta: number) => {
    const next = addDays(range.start, delta);
    setAnchor(next);
    onRangeChange?.(next, addDays(next, days));
  };

  // Funciones para manejar la selección de rango
  const getDateFromMouseEvent = useCallback((e: React.MouseEvent, roomId: string | number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const dayIndex = Math.floor(x / dayW);
    const date = addDays(range.start, dayIndex);
    return { date, roomId };
  }, [range.start, dayW]);

  const handleMouseDown = useCallback((e: React.MouseEvent, roomId: string | number) => {
    if (!showSelection || !onDateRangeSelect) return;

    e.preventDefault();
    e.stopPropagation();

    const dateInfo = getDateFromMouseEvent(e, roomId);
    
    // Verificar si la fecha inicial está ocupada
    if (isDateOccupied(dateInfo.date, roomId)) {
      return; // No permitir selección si la fecha inicial está ocupada
    }
    
    setSelectionStart(dateInfo);
    setSelectionEnd(dateInfo);
    setIsSelecting(true);
  }, [showSelection, onDateRangeSelect, getDateFromMouseEvent, isDateOccupied]);

  const handleMouseMove = useCallback((e: React.MouseEvent, roomId: string | number) => {
    if (!isSelecting || !showSelection) return;

    e.preventDefault();
    e.stopPropagation();

    const dateInfo = getDateFromMouseEvent(e, roomId);
    setSelectionEnd(dateInfo);

    // Auto-scroll basado en fechas seleccionadas
    const now = Date.now();
    if (now - lastScrollTime > 500) { // Throttling de 500ms
      const currentStartDate = range.start;
      const currentEndDate = addDays(range.start, days - 1);
      const selectedDate = dateInfo.date;

      // Si la fecha seleccionada está después del final del rango visible
      if (selectedDate > currentEndDate) {
        console.log('Fecha seleccionada está después del rango visible, moviendo hacia adelante');
        // Calcular cuántos días necesitamos avanzar para incluir la fecha seleccionada
        const daysToAdvance = Math.ceil((selectedDate.getTime() - currentEndDate.getTime()) / (1000 * 60 * 60 * 24));
        move(daysToAdvance);
        setLastScrollTime(now);
      }
      // Si la fecha seleccionada está antes del inicio del rango visible
      else if (selectedDate < currentStartDate) {
        console.log('Fecha seleccionada está antes del rango visible, moviendo hacia atrás');
        // Calcular cuántos días necesitamos retroceder para incluir la fecha seleccionada
        const daysToRetreat = Math.ceil((currentStartDate.getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24));
        move(-daysToRetreat);
        setLastScrollTime(now);
      }
    }
  }, [isSelecting, showSelection, getDateFromMouseEvent, move, days, range.start, lastScrollTime]);

  const handleMouseUp = useCallback((e: React.MouseEvent, roomId: string | number) => {
    if (!isSelecting || !showSelection || !onDateRangeSelect) return;

    e.preventDefault();
    e.stopPropagation();
    setIsSelecting(false);

    if (selectionStart && selectionEnd) {
      const start = selectionStart.date < selectionEnd.date ? selectionStart.date : selectionEnd.date;
      const end = selectionStart.date < selectionEnd.date ? selectionEnd.date : selectionStart.date;

      // Solo llamar si hay al menos un día seleccionado
      if (start.getTime() !== end.getTime()) {
        onDateRangeSelect({
          start,
          end: addDays(end, 1), // Hacer end exclusive
          roomId: selectionStart.roomId
        });
      }
    }

    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isSelecting, showSelection, onDateRangeSelect, selectionStart, selectionEnd]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (isSelecting && showSelection) {
      e.preventDefault();
      e.stopPropagation();
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
    }
  }, [isSelecting, showSelection]);

  // Calcular el rango de selección visual
  const selectionRange = useMemo(() => {
    if (!selectionStart || !selectionEnd || !showSelection) return null;

    const start = selectionStart.date < selectionEnd.date ? selectionStart.date : selectionEnd.date;
    const end = selectionStart.date < selectionEnd.date ? selectionEnd.date : selectionStart.date;

    const startIdx = clamp(diffDays(range.start, start), 0, range.days);
    const endIdx = clamp(diffDays(range.start, end), 0, range.days);

    return {
      left: startIdx * dayW,
      width: Math.max(28, (endIdx - startIdx + 1) * dayW - 8),
      roomId: selectionStart.roomId
    };
  }, [selectionStart, selectionEnd, range, dayW, showSelection]);

  return (
    <div className={`w-full h-full overflow-hidden border border-gray-300 rounded-lg bg-[#f3f4f6] ${className}`}>
      {/* Header superior: mes centrado + navegación y HOY */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-[#f3f4f6] sticky top-0 z-10">
        <button
          onClick={() => move(-days)}
          className="px-2 py-1 rounded border hover:bg-gray-100 transition-colors"
        >
          ⟨
        </button>
        <div className="text-sm font-semibold text-gray-700 select-none">
          {range.start.toLocaleDateString("es-AR", { month: "short", year: "numeric" })}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAnchor(new Date())}
            className="px-2 py-1 rounded border hover:bg-gray-100 transition-colors"
          >
            HOY
          </button>
          <button
            onClick={() => move(days)}
            className="px-2 py-1 rounded border hover:bg-gray-100 transition-colors"
          >
            ⟩
          </button>
        </div>
      </div>

      <div className="flex h-[620px] overflow-auto">
        {/* Columna fija: Habitación */}
        <div className="min-w-[320px] flex-shrink-0 border-r bg-[#f3f4f6] sticky left-0 z-10">
          <div className="grid grid-cols-[1fr_64px_100px] h-10 border-b bg-gray-100 text-[12px] font-semibold text-gray-700">
            <div className="flex items-center pl-3">Habitación</div>
          </div>

          {rooms.map((r) => (
            <div key={String(r.id)} className="grid grid-cols-[1fr_64px_100px] h-12 border-b text-sm">
              <div className="flex items-center gap-2 pl-3">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-gray-800 truncate">{r.name}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Cabecera días + grilla */}
        <div className="relative flex-1">
          {/* Header days */}
          <div className="grid h-10 border-b text-[12px] text-gray-700 bg-[#f3f4f6]" style={gridStyle}>
            {dayList.map((d, i) => {
              const isWeekend = [0, 6].includes(d.getDay());
              const isToday = parseD(new Date()).getTime() === parseD(d).getTime();
              return (
                <div
                  key={i}
                  className={`relative flex flex-col items-center justify-center border-l first:border-l-0 ${isWeekend ? "bg-gray-50" : "bg-[#f3f4f6]"
                    }`}
                >
                  {isToday && <span className="absolute inset-0 bg-sky-100/70 pointer-events-none" />}
                  <div className="uppercase z-10">{fmtDow(d)}</div>
                  <div className="font-semibold z-10">{fmtDay(d)}</div>
                </div>
              );
            })}
          </div>

          {/* Body */}
          <div>
            {rooms.map((r) => (
              <div key={String(r.id)} className="relative h-12 border-b">
                {/* Grid de fondo */}
                <div className="absolute inset-0 grid" style={gridStyle}>
                  {dayList.map((d, i) => (
                    <div
                      key={i}
                      className={`border-l first:border-l-0 ${[0, 6].includes(d.getDay()) ? "bg-gray-50" : "bg-[#f3f4f6]"
                        }`}
                    />
                  ))}
                </div>

                {/* Reservas existentes */}
                <div className="absolute inset-0">
                  {(layoutByRoom.get(Number(r.id)) || []).map((b) => {
                    const s = parseD(b.start);
                    const e = addDays(parseD(b.end), -1);
                    const badgeClass =
                      (b.status && (statusStyles as any)[b.status]) || "bg-sky-400 text-white border border-sky-600";

                    return (
                      <div
                        key={String(b.id)}
                        className={`absolute top-1 h-10 px-2 rounded-sm flex flex-col justify-between overflow-hidden text-[11px] shadow hover:brightness-95 transition cursor-default ${badgeClass}`}
                        style={{ left: b.left, width: b.width }}
                        onClick={() => onBookingClick?.(b.id)}
                        title={`${b.guest ?? "Reserva"}
                      Check-in: ${fmtLong(s)}
                      Check-out: ${fmtLong(e)}
                      ${b.price ? `Precio: $${b.price}` : ""}
                      ${b.status ? `Estado: ${b.status}` : ""}`}
                      >
                        <div className="flex items-center justify-between leading-tight min-h-[14px]">
                          <span 
                            className="font-semibold truncate text-left flex-1 mr-1"
                          >
                            {b.guest ?? "Sin nombre"}
                          </span>
                          {onEstadoChange && estadosReserva.length > 0 && (
                            <div 
                              className="flex-shrink-0 z-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <EstadoReservaSelector
                                estadoActual={b.status || 'pendiente'}
                                estados={estadosReserva}
                                onEstadoChange={(nuevoEstado) => onEstadoChange(b.id, nuevoEstado)}
                                className="scale-75"
                              />
                            </div>
                          )}
                        </div>
                        <div className="text-[10px] leading-tight opacity-95 text-center mt-0.5">
                          {b.price ? `$${b.price}` : ""}
                        </div>
                      </div>
                    );
                  })}

                </div>

                {/* Indicador visual de selección */}
                {selectionRange && selectionRange.roomId === r.id && (
                  <div
                    className="absolute top-1 h-10 bg-blue-200 border-2 border-blue-500 opacity-70 pointer-events-none z-10 rounded-sm"
                    style={{
                      left: selectionRange.left,
                      width: selectionRange.width
                    }}
                  >
                    <div className="absolute inset-0 bg-blue-300/20 rounded-sm animate-pulse" />
                  </div>
                )}

                {/* Área de selección de rango */}
                {showSelection && (
                  <div
                    className="absolute inset-0 z-20 hover:bg-blue-50/30 transition-colors"
                    onMouseDown={(e) => handleMouseDown(e, r.id)}
                    onMouseMove={(e) => {
                      handleMouseMove(e, r.id);
                      // Cambiar cursor si está sobre una reserva
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const dayIndex = Math.floor(x / dayW);
                      const date = addDays(range.start, dayIndex);
                      if (isDateOccupied(date, r.id)) {
                        e.currentTarget.style.cursor = 'default';
                      } else {
                        e.currentTarget.style.cursor = 'crosshair';
                      }
                    }}
                    onMouseUp={(e) => handleMouseUp(e, r.id)}
                    onMouseLeave={handleMouseLeave}
                    title="Arrastra para seleccionar un rango de fechas y crear una reserva. El calendario se moverá automáticamente si seleccionas fechas fuera del rango visible."
                  />
                )}

                {/* Indicadores de auto-scroll basados en fechas */}
                {showSelection && isSelecting && selectionEnd && (
                  <>
                    {/* Indicador de scroll hacia atrás - solo si la fecha está antes del rango */}
                    {selectionEnd.date < range.start && (
                      <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-orange-400/70 to-transparent z-30 pointer-events-none animate-pulse" />
                    )}
                    {/* Indicador de scroll hacia adelante - solo si la fecha está después del rango */}
                    {selectionEnd.date > addDays(range.start, days - 1) && (
                      <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-orange-400/70 to-transparent z-30 pointer-events-none animate-pulse" />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
