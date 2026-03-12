// src/components/HotelEstadisticas.tsx
"use client";

import React from "react";
import { useAppSelector } from "@/lib/store/hooks";
import {
  selectDashboardStatus,
  selectDashboardSummary,
} from "@/lib/store/utils/index"; // o desde dashboardSelectors
import { StateStatus } from "@/models/types";
import { HiUserGroup } from "react-icons/hi";
import { MdArticle, MdFreeCancellation, MdLocalAtm } from "react-icons/md";

type DashboardDatos = {
  range: { from: string; to: string };
  totals: {
    reservas?: number;
    huespedes?: number;
    nochesPromedioEstadia?: number;
    ventas?: number;
    montoPagado?: number;
    montoTotal?: number;
    habitacionesOcupadas?: number;
    totalHabitaciones?: number;
    taseDeOcupacion?: number;
    taseDeOcupacionPct?: number;
    // si luego agregás más campos, sumalos acá
  };
};

const formatCurrency = (n?: number | null) =>
  typeof n === "number"
    ? n.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      })
    : "-";

const SkeletonCard = () => (
  <div className="bg-tertiary animate-pulse flex gap-8 items-center justify-center px-2 py-6 rounded-xl">
    <div className="w-8 h-8 bg-gray-300 rounded-md" />
    <div className="flex flex-col items-center justify-center gap-1">
      <div className="w-32 h-4 bg-gray-300 rounded" />
      <div className="w-16 h-4 bg-gray-300 rounded" />
    </div>
  </div>
);

const HotelEstadisticas = () => {
  const status = useAppSelector(selectDashboardStatus);
  const datos = useAppSelector(selectDashboardSummary) as DashboardDatos | null;

  const reservas =
    typeof datos?.totals?.reservas === "number"
      ? datos!.totals.reservas.toLocaleString("es-AR")
      : "-";

  const huespedes =
    typeof datos?.totals?.huespedes === "number"
      ? datos!.totals.huespedes.toLocaleString("es-AR")
      : "-";

  const nochesPromedioEstadia =
    typeof datos?.totals?.nochesPromedioEstadia === "number"
      ? `${Number(datos.totals.nochesPromedioEstadia).toFixed(2)} noches`
      : "-";

  const ventas =
    typeof datos?.totals?.ventas === "number"
      ? datos!.totals.ventas.toLocaleString("es-AR")
      : "-";

    const montoPagado = formatCurrency(datos?.totals?.montoPagado);
    const montoTotal = formatCurrency(datos?.totals?.montoTotal);
    const habitacionesOcupadas = datos?.totals?.habitacionesOcupadas;
    const totalHabitaciones = datos?.totals?.totalHabitaciones;
    const taseDeOcupacion = datos?.totals?.taseDeOcupacion;
    const taseDeOcupacionPct = datos?.totals?.taseDeOcupacionPct;

  const cards = [
    { titulo: "Reservas / Estadía prom.", valor: `${reservas} / ${nochesPromedioEstadia}`, icon: <MdArticle size={24} className="text-main" /> },
    { titulo: "Huéspedes", valor: huespedes, icon: <HiUserGroup size={24} className="text-main" /> },
    //{ titulo: "Ventas", valor: ventas, icon: <HiUserGroup size={24} className="text-main" /> },
    { titulo: "Ingresos ($)", valor: `${montoPagado} / ${montoTotal}`, icon: <MdLocalAtm size={24} className="text-main" /> },
    { titulo: "Habitaciones actualmente ocupadas", valor: `${habitacionesOcupadas}/${totalHabitaciones}`, icon: <MdFreeCancellation size={24} className="text-main" /> },
    //{ titulo: "Tasa de ocupación (%)", valor: taseDeOcupacionPct, icon: <MdFreeCancellation size={24} className="text-main" /> },
  ];

  return (
    <div className="pt-2 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full rounded-xl p-6 border border-gray-300 shadow-md bg-white/70">
        {status === StateStatus.loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((item, index) => (
              <div
                key={index}
                className="bg-tertiary flex gap-6 items-center justify-center px-4 py-2 rounded-xl"
              >
                {item.icon}
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {item.titulo}
                  </span>
                  <span className="text-sm font-bold text-primary mt-1">
                    {item.valor}
                  </span>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default HotelEstadisticas;
