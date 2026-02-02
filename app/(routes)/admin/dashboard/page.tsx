"use client";

import React, { useEffect } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  fuenteDeTitulo,
  pantallaPrincipalEstilos,
} from "@/styles/global-styles";
import { FiltroFechas, HotelEstadisticas, GraficosContent } from "@/components";
import { fetchDashboardSummary } from "@/lib/store/utils";
import { AppDispatch } from "@/lib/store/store";
import { toYMDLocal } from "@/utils/helpers/date";

const Dashboard = () => {
  const dispatch: AppDispatch = useAppDispatch();

  // Primer fetch con rango por defecto (últimos 30 días)
  useEffect(() => {
    const hoy = toYMDLocal(new Date()); // "YYYY-MM-DD" en TU zona horaria
    dispatch(fetchDashboardSummary({
      from: hoy,
      to:   hoy,
      agruparPor: "day",
    }));
  }, [dispatch]);

  return (
    <div className={pantallaPrincipalEstilos + " pb-40 px-12"}>
      <label className={fuenteDeTitulo}>Dashboards</label>
      <div className="mt-4 space-y-6">
        <FiltroFechas />
        <HotelEstadisticas />
        <GraficosContent />
      </div>
    </div>
  );
};

export default Dashboard;