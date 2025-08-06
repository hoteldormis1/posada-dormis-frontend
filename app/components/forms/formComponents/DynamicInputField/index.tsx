import React from "react";
import InputForm from "../InputForm";
import { FieldInputType } from "@/models/types";

interface DynamicInputFieldProps {
  inputKey: string;
  inputType: FieldInputType;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: { value: string; label: string }[]; // solo para select
}

const DynamicInputField: React.FC<DynamicInputFieldProps> = ({
  inputKey,
  inputType,
  label,
  placeholder,
  value,
  onChange,
  options = [],
}) => {
  if (inputType === "select") {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputKey} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <select
          id={inputKey}
          name={inputKey}
          value={value}
          onChange={onChange}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">Seleccionar...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <InputForm
      inputKey={inputKey}
      type={inputType}
      placeholder={placeholder || label}
      value={value}
      onChange={onChange}
    >
      {label}
    </InputForm>
  );
};

export default DynamicInputField;
