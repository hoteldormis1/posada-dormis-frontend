"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import { StateStatus } from "@/models/types";
import { fetchReservasCalendar } from "@/lib/store/utils";
import Calendario, { DayAvailability } from "./Calendario";
import SidebarFiltros, { RoomOption } from "./SidebarFiltros";
import { fuenteDeTitulo } from "@/styles/global-styles";
import { fetchHabitaciones } from "@/lib/store/utils/habitaciones/habitacionesSlice";

// helpers
const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

const datesBetween = (start: Date, end: Date): Date[] => {
  const out: Date[] = [];
  let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cur <= last) {
    out.push(new Date(cur));
    cur = addDays(cur, 1);
  }
  return out;
};

const MainCalendario: React.FC = () => {
  const dispatch: AppDispatch = useAppDispatch();
  const { calendarFullyBooked, calendarStatus, calendarError } = useAppSelector(
    (s: RootState) => s.calendario
  );

  // Sidebar visible/oculto
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Filtros
  const [showAvailable, setShowAvailable] = useState(true);
  const [showUnavailable, setShowUnavailable] = useState(true);

  // Habitaciones desde store
  const habitaciones = useAppSelector((state: RootState) => state.habitaciones.datos);

  // Estado local con "enabled" por habitación
  const [habitacionesDatos, setHabitacionesDatos] = useState<RoomOption[]>([]);

  // Traer habitaciones (montaje)
  useEffect(() => {
    dispatch(fetchHabitaciones({}));
  }, [dispatch]);

  // Cuando cambian las habitaciones del store → inicializar/actualizar el estado local
  useEffect(() => {
    if (habitaciones?.length) {
      setHabitacionesDatos(
        habitaciones.map(h => ({
          idHabitacion: h.idHabitacion,
          nombre: `Habitación ${h.numero}`,
          enabled: true,
        }))
      );
    } else {
      setHabitacionesDatos([]);
    }
  }, [habitaciones]); // ✅ depende de habitaciones, no de habitacionesDatos

  const onToggleRoom = (idHabitacion: number, enabled: boolean) => {
    setHabitacionesDatos(prev =>
      prev.map(r => (r.idHabitacion === idHabitacion ? { ...r, enabled } : r))
    );
  };
  const onEnableAll = () =>
    setHabitacionesDatos(prev => prev.map(r => ({ ...r, enabled: true })));
  const onDisableAll = () =>
    setHabitacionesDatos(prev => prev.map(r => ({ ...r, enabled: false })));

  // Traer calendario
  useEffect(() => {
    if (calendarStatus === StateStatus.idle) {
      dispatch(fetchReservasCalendar());
    }
  }, [dispatch, calendarStatus]);

  const today = new Date();
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, 31);

  const calendarData: DayAvailability[] = useMemo(() => {
    const full = new Set(calendarFullyBooked);
    return datesBetween(today, maxDate).map(date => {
      const key = toYMD(date);
      return {
        date: key,
        anyAvailable: !full.has(key),
        habitacionesDatos: [], // mantiene la forma del tipo DayAvailability
      };
    });
  }, [calendarFullyBooked]);

  if (calendarStatus === StateStatus.loading) {
    return <p className="mt-2 text-sm opacity-70">Cargando calendario…</p>;
  }
  if (calendarStatus === StateStatus.failed) {
    return <p className="mt-2 text-sm text-red-600">{calendarError}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-4 items-start">
      {sidebarVisible ? (
        <SidebarFiltros
          habitacionesDatos={habitacionesDatos}
          onToggleRoom={onToggleRoom}
          onEnableAll={onEnableAll}
          onDisableAll={onDisableAll}
          showAvailable={showAvailable}
          showUnavailable={showUnavailable}
          onToggleAvailable={setShowAvailable}
          onToggleUnavailable={setShowUnavailable}
          onClose={() => setSidebarVisible(false)}
        />
      ) : (
        <div className="hidden md:block" />
      )}

      <div className="min-h-[520px]">
        {!sidebarVisible && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setSidebarVisible(true)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Mostrar filtros
            </button>
          </div>
        )}

        <h2 className={`text-center text-xl pt-8 pb-4 font-semibold mb-2 ${fuenteDeTitulo}`}>
          Calendario de reservas
        </h2>

        <Calendario
          calendarData={calendarData}
          filters={{ showAvailable, showUnavailable }}
        />
      </div>
    </div>
  );
};

export default MainCalendario;
