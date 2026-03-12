"use client";

import React from "react";
import { FieldInputType, FormFieldInputOptionsConfig } from "@/models/types";
import InputForm from "./InputForm";
import SelectForm from "./SelectForm";
import InputDateForm from "./InputDateForm";
import PhoneInput from "./PhoneInput";

interface DynamicInputFieldProps {
  inputKey: string;
  inputType: FieldInputType;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: FormFieldInputOptionsConfig[]; // solo para select
  error?: string;
  disabled?: boolean;
}

const DynamicInputField: React.FC<DynamicInputFieldProps> = ({
  inputKey,
  inputType,
  label,
  placeholder,
  value,
  onChange,
  options = [],
  error,
  disabled = false,
}) => {
  if (inputType === "checkbox") {
    const checked = value === "true" || value === "1";
    return (
      <div className="w-full">
        <label htmlFor={inputKey} className="inline-flex items-center gap-3 text-sm text-admin-light font-medium cursor-pointer select-none">
          <input
            id={inputKey}
            name={inputKey}
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              const syntheticEvent = {
                target: {
                  name: inputKey,
                  value: String(e.target.checked),
                },
              } as React.ChangeEvent<HTMLInputElement>;
              onChange(syntheticEvent);
            }}
            disabled={disabled}
            className="sr-only peer"
          />
          <span
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/15 border border-white/20 transition-colors duration-200 peer-checked:bg-emerald-400/70 peer-checked:border-emerald-300/70 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300/40 disabled:opacity-60"
            aria-hidden="true"
          >
            <span className="inline-block h-4.5 w-4.5 translate-x-1 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5" />
          </span>
          <span className="text-sm text-admin-light/95">
            {label}
          </span>
        </label>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  if (inputType === "select") {
    return (
      <SelectForm
        inputKey={inputKey}
        label={label}
        value={value}
        onChange={onChange as React.ChangeEventHandler<HTMLSelectElement>}
        options={options}
        error={error}
        disabled={disabled}
        placeholderOption="Seleccionar..."
      />
    );
  }

  if (inputType === "phone") {
    return (
      <PhoneInput
        inputKey={inputKey}
        label={label}
        value={value}
        onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
        error={error}
        disabled={disabled}
      />
    );
  }

  if (inputType === "date") {
    return (
      <InputDateForm
        inputKey={inputKey}
        label={label}
        value={value} // esperado: "dd/MM/yyyy"
        onChange={onChange}
        error={error}
        disabled={disabled}
        placeholder="dd/mm/yyyy"
      />
    );
  }

  // Fallback para text/number/password/etc.
  return (
    <InputForm
      inputKey={inputKey}
      InputForm={inputType}
      placeholder={placeholder || label}
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
    >
      {label}
    </InputForm>
  );
};

export default DynamicInputField;
