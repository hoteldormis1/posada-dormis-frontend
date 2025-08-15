"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  inputBaseEstilos,
  inputErrorEstilos,
  labelBaseEstilos,
  mensajeErrorEstilos,
} from "@/styles/global-styles";

interface InputDateFormProps {
  inputKey: string;
  label: string;
  value: string; // esperado: "dd/MM/yyyy"
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // mantiene compatibilidad con tus handlers
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

const parseDDMMYYYY = (dateString?: string): Date | null => {
  if (!dateString || dateString.length !== 10) return null;
  const [day, month, year] = dateString.split("/");
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return isNaN(d.getTime()) ? null : d;
};

const formatDDMMYYYY = (date: Date | null): string => {
  if (!date) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const InputDateForm: React.FC<InputDateFormProps> = ({
  inputKey,
  label,
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "dd/mm/yyyy",
  minDate,
  maxDate,
}) => {
  const baseClass = `${inputBaseEstilos} ${error ? inputErrorEstilos : ""} ${
    disabled ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""
  }`;

  const selectedDate = parseDDMMYYYY(value);

  const handleDateChange = (date: Date | null) => {
    const syntheticEvent = {
      target: {
        name: inputKey,
        value: formatDDMMYYYY(date),
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputKey} className={labelBaseEstilos}>
        {label}
      </label>
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        className={baseClass}
        wrapperClassName="w-full"
        showYearDropdown
        scrollableYearDropdown
        dropdownMode="select"
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
      />
      {error && <p className={mensajeErrorEstilos}>{error}</p>}
    </div>
  );
};

export default InputDateForm;
