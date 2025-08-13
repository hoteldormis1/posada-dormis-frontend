// src/components/FiltroFechas.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchDashboardSummary, setRange } from "@/lib/store/utils/index";
import { AppDispatch, RootState } from "@/lib/store/store";
import { ButtonForm } from "@/components";
import InputDateForm from "@/components/forms/formComponents/InputDateForm";
import { MdSearch, MdToday, MdDateRange } from "react-icons/md";
import { HiCalendarDays } from "react-icons/hi2";
import { TbTimelineEvent } from "react-icons/tb";

// === Helpers fecha UI (dd/MM/yyyy) <-> ISO (YYYY-MM-DD) ===
const isoToDDMMYYYY = (iso: string): string => {
  if (!iso || iso.length < 10) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};
const ddmmToISO = (ddmmyyyy: string): string => {
  if (!ddmmyyyy || ddmmyyyy.length !== 10) return "";
  const [d, m, y] = ddmmyyyy.split("/");
  return `${y}-${m}-${d}`;
};
const parseDDMMYYYY = (value: string): Date | null => {
  if (!value || value.length !== 10) return null;
  const [d, m, y] = value.split("/");
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return isNaN(date.getTime()) ? null : date;
};

// === Rango por presets ===
type Preset = "HOY" | "SEMANA" | "MES" | "ANIO" | "PERSONALIZADO";

const startOfWeekMonday = (d: Date) => {
  const day = d.getDay(); // 0=Dom, 1=Lun...
  const diff = (day === 0 ? -6 : 1 - day); // mover a Lunes
  const r = new Date(d);
  r.setDate(d.getDate() + diff);
  r.setHours(0, 0, 0, 0);
  return r;
};
const endOfWeekMonday = (d: Date) => {
  const start = startOfWeekMonday(d);
  const r = new Date(start);
  r.setDate(start.getDate() + 6);
  r.setHours(23, 59, 59, 999);
  return r;
};
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);
const endOfYear = (d: Date) => new Date(d.getFullYear(), 11, 31);

const toISODate = (d: Date) => d.toISOString().slice(0, 10);
const toDDMMYYYY = (d: Date) => isoToDDMMYYYY(toISODate(d));

const FiltroFechas = () => {
  const dispatch: AppDispatch = useAppDispatch();
  const { from: storeFrom, to: storeTo } = useAppSelector(
    (state: RootState) => state.dashboards
  );

  // Defaults (últimos 30 días) para cuando abras "Personalizado"
  const defaults = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 29);
    return {
      fromISO: storeFrom ?? toISODate(from),
      toISO: storeTo ?? toISODate(to),
    };
  }, [storeFrom, storeTo]);

  // Estado de pestaña activa
  const [preset, setPreset] = useState<Preset>("HOY"); // elegí el que quieras por defecto

  // Estado de inputs (solo visible en "PERSONALIZADO")
  const [fromUI, setFromUI] = useState<string>(isoToDDMMYYYY(defaults.fromISO));
  const [toUI, setToUI] = useState<string>(isoToDDMMYYYY(defaults.toISO));

  // Validación de personalizado
  const fromDate = parseDDMMYYYY(fromUI);
  const toDate = parseDDMMYYYY(toUI);
  const rangoInvalido = !!(fromDate && toDate && fromDate > toDate);

  // Aplica rango (envía a store + fetch)
  const applyRange = (fromISO: string, toISO: string) => {
    dispatch(setRange({ from: fromISO, to: toISO }));
    dispatch(fetchDashboardSummary({ from: fromISO, to: toISO }));
  };

  // Cálculo y aplicación al tocar un preset
  const handlePreset = (p: Preset) => {
    setPreset(p);
    const now = new Date();

    if (p === "HOY") {
      const s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const e = s;
      applyRange(toISODate(s), toISODate(e));
      setFromUI(toDDMMYYYY(s));
      setToUI(toDDMMYYYY(e));
      return;
    }
    if (p === "SEMANA") {
      const s = startOfWeekMonday(now);
      const e = endOfWeekMonday(now);
      applyRange(toISODate(s), toISODate(e));
      setFromUI(toDDMMYYYY(s));
      setToUI(toDDMMYYYY(e));
      return;
    }
    if (p === "MES") {
      const s = startOfMonth(now);
      const e = endOfMonth(now);
      applyRange(toISODate(s), toISODate(e));
      setFromUI(toDDMMYYYY(s));
      setToUI(toDDMMYYYY(e));
      return;
    }
    if (p === "ANIO") {
      const s = startOfYear(now);
      const e = endOfYear(now);
      applyRange(toISODate(s), toISODate(e));
      setFromUI(toDDMMYYYY(s));
      setToUI(toDDMMYYYY(e));
      return;
    }
    // PERSONALIZADO: no dispara aún; espera submit
  };

  // Si venís con valores del store (navegación/refresh), sincroniza UI
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
    applyRange(ddmmToISO(fromUI), ddmmToISO(toUI));
  };

  // Estilos de tabs (pills)
  const tabBase =
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition";
  const tabActive = "bg-main text-white border-main shadow";
  const tabIdle =
    "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400";

  return (
    <div className="pt-2 w-full space-y-3">
      {/* Tabs presets */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handlePreset("HOY")}
          className={`${tabBase} ${preset === "HOY" ? tabActive : tabIdle}`}
          title="Rango: Hoy"
        >
          <MdToday size={18} />
          Hoy
        </button>
        <button
          type="button"
          onClick={() => handlePreset("SEMANA")}
          className={`${tabBase} ${preset === "SEMANA" ? tabActive : tabIdle}`}
          title="Rango: Semana actual (lunes a domingo)"
        >
          <MdDateRange size={18} />
          Esta semana
        </button>
        <button
          type="button"
          onClick={() => handlePreset("MES")}
          className={`${tabBase} ${preset === "MES" ? tabActive : tabIdle}`}
          title="Rango: Mes actual"
        >
          <HiCalendarDays size={18} />
          Este mes
        </button>
        <button
          type="button"
          onClick={() => handlePreset("ANIO")}
          className={`${tabBase} ${preset === "ANIO" ? tabActive : tabIdle}`}
          title="Rango: Año calendario"
        >
          <TbTimelineEvent size={18} />
          Este año
        </button>
        <button
          type="button"
          onClick={() => setPreset("PERSONALIZADO")}
          className={`${tabBase} ${preset === "PERSONALIZADO" ? tabActive : tabIdle}`}
          title="Elegí fechas"
        >
          <MdSearch size={18} />
          Personalizado
        </button>
      </div>

      {/* Contenido: personalizado (form) o nada (presets ya aplican) */}
      {preset === "PERSONALIZADO" && (
        <form
          onSubmit={handleSubmitCustom}
          className="flex flex-col lg:flex-row gap-4 w-full rounded-xl shadow-md p-4 border border-gray-300 bg-white/70"
        >
          {/* Fecha Desde */}
          <div className="w-full lg:w-1/2">
            <InputDateForm
              inputKey="from"
              label="Fecha desde"
              value={fromUI}
              onChange={handleInputChange}
              placeholder="dd/mm/yyyy"
              // maxDate={toDate ?? undefined}
            />
          </div>

          {/* Fecha Hasta */}
          <div className="w-full lg:w-1/2">
            <InputDateForm
              inputKey="to"
              label="Fecha hasta"
              value={toUI}
              onChange={handleInputChange}
              placeholder="dd/mm/yyyy"
              // minDate={fromDate ?? undefined}
            />
          </div>

          {/* Botón aplicar */}
          <div className="flex items-end">
            <ButtonForm
              type="submit"
              disabled={rangoInvalido}
              title={
                rangoInvalido
                  ? "El rango es inválido (desde > hasta)"
                  : "Aplicar filtro"
              }
              icon={<MdSearch size={18} />}
              className={
                rangoInvalido
                  ? "bg-gray-200 text-gray-500 border-gray-300"
                  : "bg-main text-white"
              }
            >
              Aplicar
            </ButtonForm>
          </div>
        </form>
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
