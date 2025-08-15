"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchDashboardSummary, setRange } from "@/lib/store/utils/index";
import { AppDispatch, RootState } from "@/lib/store/store";
import PresetTabs from "./PresetTabs";
import GroupByButtons from "./GroupByButtons";
import CustomRangeForm from "./CustomRangeForm";

import {
  isoToDDMMYYYY,
  ddmmToISO,
  parseDDMMYYYY,
  Preset,
  GroupBy,
  startOfWeekMonday,
  endOfWeekMonday,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  toDDMMYYYY,
  toYMDLocal,
} from "@/utils/helpers/date";

const allowedByPreset: Record<Preset, GroupBy[]> = {
  HOY: ["day"],
  SEMANA: ["day"],
  MES: ["day", "month"],
  ANIO: ["month", "year"],
  PERSONALIZADO: ["day", "month", "year"],
};

const FiltroFechas: React.FC = () => {
  const dispatch: AppDispatch = useAppDispatch();
  const { from: storeFrom, to: storeTo } = useAppSelector(
    (state: RootState) => state.dashboards
  );

  // Defaults (últimos 30 días) para abrir "Personalizado"
  const defaults = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 29);
    return {
      fromISO: storeFrom ?? toYMDLocal(from),
      toISO:   storeTo   ?? toYMDLocal(to),
    };
  }, [storeFrom, storeTo]);

  // Estado de pestaña activa (rango) y agrupación de telemetría
  const [preset, setPreset] = useState<Preset>("HOY");
  const [groupBy, setGroupBy] = useState<GroupBy>("day");

  // Inputs de personalizado
  const [fromUI, setFromUI] = useState<string>(isoToDDMMYYYY(defaults.fromISO));
  const [toUI, setToUI] = useState<string>(isoToDDMMYYYY(defaults.toISO));

  // Validaciones
  const fromDate = parseDDMMYYYY(fromUI);
  const toDate = parseDDMMYYYY(toUI);
  const rangoInvalido = !!(fromDate && toDate && fromDate > toDate);

  // Aplica rango (envía a store + fetch)
  const applyRange = (fromISO: string, toISO: string, agruparPor: GroupBy = groupBy) => {
    dispatch(setRange({ from: fromISO, to: toISO }));
    dispatch(fetchDashboardSummary({ from: fromISO, to: toISO, agruparPor }));
  };

  // Cambio de agrupación → refetch con el rango actual
  const applyGroupBy = (g: GroupBy) => {
    const allowed = allowedByPreset[preset];
    const chosen = allowed.includes(g) ? g : allowed[0];
    setGroupBy(chosen);
    const fromISO = storeFrom ?? defaults.fromISO;
    const toISO   = storeTo   ?? defaults.toISO;
    dispatch(fetchDashboardSummary({ from: fromISO, to: toISO, agruparPor: chosen }));
  };

  // Presets
  const handlePreset = (p: Preset) => {
    setPreset(p);
    const now = new Date();

    let s: Date | undefined;
    let e: Date | undefined;

    if (p === "HOY") {
      s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      e = s;
    } else if (p === "SEMANA") {
      s = startOfWeekMonday(now);
      e = endOfWeekMonday(now);
    } else if (p === "MES") {
      s = startOfMonth(now);
      e = endOfMonth(now);
    } else if (p === "ANIO") {
      s = startOfYear(now);
      e = endOfYear(now);
    } else if (p === "PERSONALIZADO") {
      // No aplicamos rango todavía; queda para el form
      return;
    }

    // Ajustar granularidad según el preset
    const allowed = allowedByPreset[p];
    const newGroupBy = allowed.includes(groupBy) ? groupBy : allowed[0];
    setGroupBy(newGroupBy);

    // actualizar UI de inputs (por si luego abre "Personalizado")
    setFromUI(toDDMMYYYY(s!));
    setToUI(toDDMMYYYY(e!));

    // Actualiza store + fetch con la granularidad válida
    applyRange(toYMDLocal(s!), toYMDLocal(e!), newGroupBy);
  };

  // Sincroniza UI si viene del store (refresh/navegación)
  useEffect(() => {
    if (storeFrom && storeTo) {
      setFromUI(isoToDDMMYYYY(storeFrom));
      setToUI(isoToDDMMYYYY(storeTo));
    }
  }, [storeFrom, storeTo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // "from" | "to"
    if (name === "from") setFromUI(value);
    if (name === "to") setToUI(value);
  };

  const handleSubmitCustom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rangoInvalido) return;
    // En personalizado respetamos el groupBy elegido (puede ser day|month|year)
    applyRange(ddmmToISO(fromUI), ddmmToISO(toUI), groupBy);
  };

  // Opciones permitidas por preset actual
  const allowedForCurrent = allowedByPreset[preset];
  const showGroupBy = allowedForCurrent.length > 1; // ocultar si solo hay una opción

  return (
    <div className="pt-2 w-full space-y-3">
      <PresetTabs preset={preset} onSelect={handlePreset} />

      {showGroupBy && (
        <GroupByButtons
          value={groupBy}
          onChange={applyGroupBy}
          options={allowedForCurrent}
        />
      )}

      {preset === "PERSONALIZADO" && (
        <CustomRangeForm
          fromUI={fromUI}
          toUI={toUI}
          onChange={handleInputChange}
          onSubmit={handleSubmitCustom}
          rangoInvalido={rangoInvalido}
        />
      )}

      {preset === "PERSONALIZADO" && rangoInvalido && (
        <div className="text-red-600 text-sm">
          El rango es inválido: “Fecha desde” no puede ser mayor que “Fecha hasta”.
        </div>
      )}
    </div>
  );
};

export default FiltroFechas;
