"use client";

import React from "react";
import type { GroupBy } from "@/utils/helpers/date";

type Props = {
  value: GroupBy;
  onChange: (g: GroupBy) => void;
  options?: GroupBy[]; // ← nuevas opciones permitidas
};

const base =
  "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium border transition";
const active = "bg-indigo-600 text-white border-indigo-600 shadow";
const idle =
  "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400";

const labels: Record<GroupBy, string> = {
  day: "Día",
  month: "Mes",
  year: "Año",
};

const GroupByButtons: React.FC<Props> = ({ value, onChange, options = ["day", "month", "year"] }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-600">Agrupar por:</span>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`${base} ${value === opt ? active : idle}`}
          aria-pressed={value === opt}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
};

export default GroupByButtons;
