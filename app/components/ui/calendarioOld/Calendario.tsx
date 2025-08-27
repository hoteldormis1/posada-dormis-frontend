// Calendario.tsx
"use client";

import React, { useRef, useState, useMemo, useLayoutEffect, useCallback } from "react";
import Calendar, { TileClassNameFunc, TileContentFunc } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendario.css";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import { StateStatus } from "@/models/types";
import { fetchHabitacionesDisponiblesPorDia } from "@/lib/store/utils/index";

export interface Room {
  idHabitacion: number;
  numero: string | number;
}
export interface DayAvailability {
  date: string;      // YYYY-MM-DD
  habitacionesDatos: Room[];
  anyAvailable: boolean;
}
export type CalendarFilters = {
  showAvailable: boolean;
  showUnavailable: boolean;
  /** por ahora informativo; lo podés usar cuando el backend devuelva disponibilidad por habitación */
  roomsEnabled?: Record<number, boolean>;
};
export interface RoomCalendarProps {
  calendarData: DayAvailability[];
  filters?: CalendarFilters;
}

const toYMD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const Calendario: React.FC<RoomCalendarProps> = ({ calendarData, filters }) => {
  const dispatch: AppDispatch = useAppDispatch();
  const { availableByDate, availabilityStatusByDate, availabilityErrorByDate } =
    useAppSelector((s: RootState) => s.disponibilidad);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);

  // Indexamos calendarData por fecha
  const availabilityByDay = useMemo(() => {
    const map = new Map<string, DayAvailability>();
    for (const d of calendarData) map.set(d.date, d);
    return map;
  }, [calendarData]);

  const findDay = (date: Date): DayAvailability | undefined =>
    availabilityByDay.get(toYMD(date));

  const getTileElement = useCallback((dateKey: string) => {
    const container = stageRef.current || document;
    const marker = container.querySelector<HTMLElement>(`[data-date="${dateKey}"]`);
    return marker ? marker.closest<HTMLButtonElement>(".react-calendar__tile") : null;
  }, []);

  const computePopupPosition = useCallback((dateKey: string) => {
    const tile = getTileElement(dateKey);
    const stage = stageRef.current;
    if (!tile || !stage) return null;

    const tileRect = tile.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    const tileCenterX = tileRect.left - stageRect.left + tileRect.width / 2;
    const belowTileY = tileRect.top - stageRect.top + tileRect.height + 8;

    return { top: belowTileY, left: tileCenterX };
  }, [getTileElement]);

  const handleDateClick = async (value: Date) => {
    setStartDate(value);
    const dateKey = toYMD(value);

    const status = availabilityStatusByDate[dateKey] ?? StateStatus.idle;
    if (status === StateStatus.idle || status === StateStatus.failed) {
      dispatch(fetchHabitacionesDisponiblesPorDia(dateKey));
    }

    requestAnimationFrame(() => {
      const pos = computePopupPosition(dateKey);
      if (pos) setPopupPos(pos);
      setShowPopup(true);
    });
  };

  useLayoutEffect(() => {
    if (!showPopup || !startDate) return;
    const dateKey = toYMD(startDate);

    const onRecalc = () => {
      const pos = computePopupPosition(dateKey);
      if (pos) setPopupPos(pos);
    };

    window.addEventListener("resize", onRecalc, { passive: true });
    window.addEventListener("scroll", onRecalc, { passive: true });
    const stage = stageRef.current;
    stage?.addEventListener("scroll", onRecalc, { passive: true });

    onRecalc();

    return () => {
      window.removeEventListener("resize", onRecalc);
      window.removeEventListener("scroll", onRecalc);
      stage?.removeEventListener("scroll", onRecalc);
    };
  }, [showPopup, startDate, computePopupPosition]);

  const tileClassName: TileClassNameFunc = ({ date, view }) => {
    if (view !== "month") return null;

    // hoy a las 00:00
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (date < todayStart) return "past-day";

    const day = findDay(date);
    const isAvail = day?.anyAvailable ?? false;

    // Filtros de estado
    const showAvail = filters?.showAvailable ?? true;
    const showUnavail = filters?.showUnavailable ?? true;

    const blockedByFilters =
      (isAvail && !showAvail) || (!isAvail && !showUnavail);

    if (blockedByFilters) {
      return "hidden-day";
    }
    return isAvail ? "available" : "not-available";
  };

  const tileContent: TileContentFunc = ({ date, view }) => {
    if (view !== "month") return null;
    return <span data-date={toYMD(date)} className="absolute inset-0 pointer-events-none" />;
  };

  const formatDate = (date: Date) => date.toLocaleDateString("es-AR");
  const closePopup = () => setShowPopup(false);

  const today = new Date();
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 12, 31);

  const selectedDateKey = startDate ? toYMD(startDate) : "";
  const selectedDay = startDate ? findDay(startDate) : undefined;
  const isAvailable = selectedDay?.anyAvailable ?? false;

  const roomsForSelected = availableByDate[selectedDateKey] ?? [];
  const statusForSelected = availabilityStatusByDate[selectedDateKey] ?? StateStatus.idle;
  const errorForSelected = availabilityErrorByDate[selectedDateKey] ?? null;

  return (
    <div className="px-6 calendar-stage" ref={stageRef}>
      <div className="room-calendar">
        <Calendar
          onClickDay={handleDateClick}
          value={startDate || new Date()}
          tileClassName={tileClassName}
          tileContent={tileContent}
          minDate={today}
          maxDate={maxDate}
          className="room-calendar"
          locale="es-ES"
        />
      </div>

      {showPopup && startDate && popupPos && (
        <div className="availability-popup" style={{ top: popupPos.top, left: popupPos.left }}>
          <button onClick={closePopup} className="close-button" aria-label="Cerrar">✕</button>
          <h2>{formatDate(startDate)}</h2>

          <div className="availability-legend">
            <span><div className="legend-color available-color"></div>Disponible</span>
            <span><div className="legend-color unavailable-color"></div>No disponible</span>
          </div>

          <div className="mt-2 text-sm">
            {statusForSelected === StateStatus.loading && "Cargando habitaciones…"}
            {statusForSelected === StateStatus.failed && (
              <span className="text-red-600">{errorForSelected ?? "Error al obtener habitaciones."}</span>
            )}
            {statusForSelected === StateStatus.succeeded && (
              <>
                {isAvailable ? "Hay habitaciones disponibles:" : "No hay habitaciones disponibles"}
                {roomsForSelected.length > 0 && (
                  <ul className="rooms-list mt-2">
                    {roomsForSelected.map((r: any) => (
                      <li key={r.idHabitacion} className="py-1 border-b last:border-none">
                        Habitación {r.numero}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
            {statusForSelected === StateStatus.idle && (
              <>{isAvailable ? "Hay habitaciones disponibles" : "No hay habitaciones disponibles"}</>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendario;
