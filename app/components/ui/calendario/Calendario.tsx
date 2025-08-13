import React, { useRef, useState } from "react";
import Calendar, { TileClassNameFunc, TileContentFunc } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendario.css";

export interface Room {
  roomNumber: string;
  available: boolean;
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

const RoomCalendar: React.FC<RoomCalendarProps> = ({ calendarData }) => {
  const [availability] = useState<DayAvailability[]>(calendarData);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [roomsAvailable, setRoomsAvailable] = useState<Room[]>([]);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  const findDay = (date: Date): DayAvailability | undefined =>
    availability.find((d) => d.date === toYMD(date));

  const getRoomAvailability = (date: Date): Room[] =>
    findDay(date)?.rooms ?? [];

  const handleDateChange = (value: any) => {
    if (!value) return;
    const date = Array.isArray(value) ? value[0] : value;
    setStartDate(date);
    setRoomsAvailable(getRoomAvailability(date));
    setShowPopup(true);
  };

  const tileClassName: TileClassNameFunc = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    // hoy a las 00:00
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (date < todayStart) return "past-day";

    const day = findDay(date);
    return day?.anyAvailable ? "available" : "not-available";
  };

  const tileContent: TileContentFunc = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;
    return <span data-date={toYMD(date)} className="absolute inset-0 pointer-events-none" />;
  };

  const formatDate = (date: Date) => date.toLocaleDateString("es-AR");
  const closePopup = () => setShowPopup(false);

  const today = new Date();
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 12, 31);

  // ====== Derivados para el popup ======
  const selectedDay = startDate ? findDay(startDate) : undefined;
  const isAvailable = selectedDay?.anyAvailable ?? false;

  return (
    <div className="calendar-container" ref={calendarRef}>
      <div className="flex flex-col items-center">
        <Calendar
          onChange={handleDateChange}
          value={startDate || new Date()}
          tileClassName={tileClassName}
          tileContent={tileContent}
          minDate={today}
          maxDate={maxDate}
          className="room-calendar"
          locale="es-ES"
        />

        {/* Leyenda */}
        <div className="mt-6 mb-4 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
            <span>Sin disponibilidad</span>
          </div>
        </div>

        {/* Popup de disponibilidad */}
        {showPopup && startDate && (
          <div className="availability-popup">
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

            {/* Mensaje según disponibilidad */}
            <div className={`mt-2 text-sm ${isAvailable ? "text-green-600" : "text-red-600"}`}>
              {isAvailable ? "Hay habitaciones disponibles" : "No hay habitaciones disponibles"}
            </div>

            <ul className="rooms-list">{/* tu lista si querés reactivarla */}</ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCalendar;
