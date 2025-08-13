// Calendario.tsx
"use client";

import React, { useRef, useState, useMemo } from "react";
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
  rooms: Room[];
  anyAvailable: boolean;
}
export interface RoomCalendarProps {
  calendarData: DayAvailability[];
}

const toYMD = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const Calendario: React.FC<RoomCalendarProps> = ({ calendarData }) => {
  const dispatch: AppDispatch = useAppDispatch();
  const { availableByDate, availabilityStatusByDate, availabilityErrorByDate } =
    useAppSelector((s: RootState) => s.disponibilidad);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  // Indexamos calendarData por fecha para lookups O(1)
  const availabilityByDay = useMemo(() => {
    const map = new Map<string, DayAvailability>();
    for (const d of calendarData) map.set(d.date, d);
    return map;
  }, [calendarData]);

  const findDay = (date: Date): DayAvailability | undefined =>
    availabilityByDay.get(toYMD(date));

  const handleDateClick = async (value: Date) => {
    setStartDate(value);
    const dateKey = toYMD(value);

    const status = availabilityStatusByDate[dateKey] ?? StateStatus.idle;

    if (status === StateStatus.idle || status === StateStatus.failed) {
      // no esperes el resultado para abrir el popup; mostramos "Cargando..."
      dispatch(fetchHabitacionesDisponiblesPorDia(dateKey));
    }

    setShowPopup(true);
  };

  const tileClassName: TileClassNameFunc = ({ date, view }) => {
    if (view !== "month") return null;

    // hoy a las 00:00
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (date < todayStart) return "past-day";

    const day = findDay(date);
    return day?.anyAvailable ? "available" : "not-available";
  };

  const tileContent: TileContentFunc = ({ date, view }) => {
    if (view !== "month") return null;
    return <span data-date={toYMD(date)} className="absolute inset-0 pointer-events-none" />;
  };

  const formatDate = (date: Date) => date.toLocaleDateString("es-AR");
  const closePopup = () => setShowPopup(false);

  const today = new Date();
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 12, 31);

  // ====== Derivados para el popup ======
  const selectedDateKey = startDate ? toYMD(startDate) : "";
  const selectedDay = startDate ? findDay(startDate) : undefined;
  const isAvailable = selectedDay?.anyAvailable ?? false;

  const roomsForSelected = availableByDate[selectedDateKey] ?? [];
  const statusForSelected = availabilityStatusByDate[selectedDateKey] ?? StateStatus.idle;
  const errorForSelected = availabilityErrorByDate[selectedDateKey] ?? null;

  return (
    <div className="calendar-container" ref={calendarRef}>
      <div className="flex flex-col items-center">
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

        {/* Popup de disponibilidad */}
        {showPopup && startDate && (
          <div className="availability-popup ">
            <button onClick={closePopup} className="close-button" aria-label="Cerrar">
              ✕
            </button>

            <h2>{formatDate(startDate)}</h2>

            <div className="availability-legend">
              <span>
                <div className="legend-color available-color"></div>
                Disponible
              </span>
              <span>
                <div className="legend-color unavailable-color"></div>
                Sin disponibilidad
              </span>
            </div>

            {/* Mensajes / lista */}
            <div className="mt-2 text-sm">
              {statusForSelected === StateStatus.loading && "Cargando habitaciones…"}
              {statusForSelected === StateStatus.failed && (
                <span className="text-red-600">
                  {errorForSelected ?? "Error al obtener habitaciones."}
                </span>
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
    </div>
  );
};

export default Calendario;
