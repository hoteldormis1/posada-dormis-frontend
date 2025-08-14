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

const Dashboard = () => {
  const dispatch: AppDispatch = useAppDispatch();

  // Primer fetch con rango por defecto (últimos 30 días)
  useEffect(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 29);
    const toStr = to.toISOString().slice(0, 10);
    const fromStr = from.toISOString().slice(0, 10);
    dispatch(fetchDashboardSummary({ from: fromStr, to: toStr }));
  }, [dispatch]);

  return (
    <div className={pantallaPrincipalEstilos + " pb-40 px-12"}>
      <label className={fuenteDeTitulo}>Dashboards</label>
      <div className="mt-4 space-y-8">
        <FiltroFechas />
        <HotelEstadisticas />
        <GraficosContent />
      </div>
    </div>
  );
};

export default Dashboard;