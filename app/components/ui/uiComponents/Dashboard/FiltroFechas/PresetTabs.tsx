"use client";

import React from "react";
import { MdSearch, MdToday, MdDateRange } from "react-icons/md";
import { HiCalendarDays } from "react-icons/hi2";
import { TbTimelineEvent } from "react-icons/tb";
import type { Preset } from "@/utils/helpers/date";

type Props = {
  preset: Preset;
  onSelect: (p: Preset) => void;
};

const tabBase =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition";
const tabActive = "bg-main text-white border-main shadow";
const tabIdle =
  "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400";

const PresetTabs: React.FC<Props> = ({ preset, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onSelect("HOY")}
        className={`${tabBase} ${preset === "HOY" ? tabActive : tabIdle}`} title="Rango: Hoy">
        <MdToday size={18} /> Hoy
      </button>
      <button type="button" onClick={() => onSelect("SEMANA")}
        className={`${tabBase} ${preset === "SEMANA" ? tabActive : tabIdle}`}
        title="Rango: Semana actual (lunes a domingo)">
        <MdDateRange size={18} /> Esta semana
      </button>
      <button type="button" onClick={() => onSelect("MES")}
        className={`${tabBase} ${preset === "MES" ? tabActive : tabIdle}`} title="Rango: Mes actual">
        <HiCalendarDays size={18} /> Este mes
      </button>
      <button type="button" onClick={() => onSelect("ANIO")}
        className={`${tabBase} ${preset === "ANIO" ? tabActive : tabIdle}`} title="Rango: Año calendario">
        <TbTimelineEvent size={18} /> Este año
      </button>
      <button type="button" onClick={() => onSelect("PERSONALIZADO")}
        className={`${tabBase} ${preset === "PERSONALIZADO" ? tabActive : tabIdle}`} title="Elegí fechas">
        <MdSearch size={18} /> Personalizado
      </button>
    </div>
  );
};

export default PresetTabs;
