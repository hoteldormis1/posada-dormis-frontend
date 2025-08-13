"use client";

import React from "react";
import { FormFieldInputOptionsConfig } from "@/models/types";
import {
  inputBaseEstilos,
  inputErrorEstilos,
  labelBaseEstilos,
  mensajeErrorEstilos,
} from "@/styles/global-styles";

interface SelectFormProps {
  inputKey: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: FormFieldInputOptionsConfig[];
  error?: string;
  disabled?: boolean;
  placeholderOption?: string; // texto de la opción vacía
}

const SelectForm: React.FC<SelectFormProps> = ({
  inputKey,
  label,
  value,
  onChange,
  options,
  error,
  disabled = false,
  placeholderOption = "Seleccionar...",
}) => {
  const baseClass = `${inputBaseEstilos} ${error ? inputErrorEstilos : ""} ${
    disabled ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""
  }`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputKey} className={labelBaseEstilos}>
        {label}
      </label>
      <select
        id={inputKey}
        name={inputKey}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={baseClass}
      >
        <option value="">{placeholderOption}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className={mensajeErrorEstilos}>{error}</p>}
    </div>
  );
};

export default SelectForm;
