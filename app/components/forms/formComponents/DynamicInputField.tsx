"use client";

import React from "react";
import { FieldInputType, FormFieldInputOptionsConfig } from "@/models/types";
import InputForm from "./InputForm";
import SelectForm from "./SelectForm";
import InputDateForm from "./InputDateForm";

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
