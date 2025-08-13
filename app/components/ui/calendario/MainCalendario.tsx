"use client";

import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchReservasCalendar } from "@/lib/store/utils/reservas/reservasSlice";
import { StateStatus } from "@/models/types";
import RoomCalendar, { DayAvailability } from "./Calendario";

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
    (s: RootState) => s.reservas
  );

  useEffect(() => {
    if (calendarStatus === StateStatus.idle) {
      dispatch(fetchReservasCalendar());
    }
  }, [dispatch, calendarStatus]);

  const today = new Date();
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, 31);

  const calendarData: DayAvailability[] = useMemo(() => {
    const full = new Set(calendarFullyBooked);
    return datesBetween(today, maxDate).map((date) => {
      const key = toYMD(date);
      return {
        date: key,
        anyAvailable: !full.has(key),
        rooms: [], // si luego traés rooms por día desde la API, completás acá
      };
    });
  }, [calendarFullyBooked]);

  if (calendarStatus === StateStatus.loading) {
    return <p className="mt-2 text-sm opacity-70">Cargando calendario…</p>;
  }
  if (calendarStatus === StateStatus.failed) {
    return <p className="mt-2 text-sm text-red-600">{calendarError}</p>;
  }

  return <RoomCalendar calendarData={calendarData} />;
};

export default MainCalendario;