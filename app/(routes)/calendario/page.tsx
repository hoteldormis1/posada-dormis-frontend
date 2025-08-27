"use client";

import React, { useEffect, useMemo, useCallback } from "react";
import { pantallaPrincipalEstilos } from "@/styles/global-styles";
import { fetchHabitaciones } from "@/lib/store/utils/habitaciones/habitacionesSlice";
import { AppDispatch } from "@/lib/store/store";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import TimelineWithSidebarStore from "@/components/ui/calendario/index";
import { Booking, Room } from "@/components/ui/calendario/Calendario";

export default function CalendarioPage() {
  const dispatch: AppDispatch = useAppDispatch();

  // Cargar habitaciones una vez
  useEffect(() => {
    dispatch(fetchHabitaciones({}));
  }, [dispatch]);

  // 🔎 Traer habitaciones del store
  const { items: habitaciones = [], loading: loadingHabitaciones } =
    useAppSelector((s: any) => s.habitaciones ?? {});

  // 🧭 Mapear backend → Room (memo para identidad estable)
  const rooms: Room[] = useMemo(
    () =>
      (habitaciones as any[]).map((h) => ({
        id: h.idHabitacion ?? h.id ?? h.ID ?? String(h.nombre ?? h.name),
        name: h.nombre ?? h.name ?? "Habitación",
      })),
    [habitaciones]
  );

  // 📦 Fallback rooms (memoizado para que no cambie la referencia cada render)
  const fallbackRooms: Room[] = useMemo(
    () => [
      { id: 1, name: "Habitación 1" },
      { id: 2, name: "Habitación 2" },
      { id: 3, name: "Habitación 3" },
    ],
    []
  );

  // 📅 Bookings de ejemplo (memo estable)
  const bookings: Booking[] = useMemo(
    () => [
      { id: 1, roomId: 101, start: "2025-08-25", end: "2025-08-28", guest: "Lorena Aida", price: 630, status: "confirmed" },
      { id: 2, roomId: 201, start: "2025-08-26", end: "2025-09-03", guest: "Miguel Perez", price: 1355, status: "paid" },
      { id: 3, roomId: 102, start: "2025-08-30", end: "2025-09-02", guest: "Berta Aizperro", price: 270, status: "checkin" },
    ],
    []
  );

  // 🖱️ Handler memoizado (no cambia identidad en cada render)
  const handleBookingClick = useCallback((id: string | number) => {
    console.log("click booking", id);
    // abrir modal/drawer si querés
  }, []);

  return <div className={"bg-background content-shell " + pantallaPrincipalEstilos}>
      {loadingHabitaciones && rooms.length === 0 ? (
        <div className="p-4 text-sm text-gray-600">Cargando habitaciones…</div>
      ) : (
        <TimelineWithSidebarStore
          days={14}
          onBookingClick={handleBookingClick}
        />
      )}
    </div>
}
