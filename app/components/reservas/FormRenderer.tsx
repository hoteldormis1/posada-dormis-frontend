"use client";
import React, { useMemo } from "react";
import DynamicInputField from "@/components/forms/formComponents/DynamicInputField";
import SelectForm from "@/components/forms/formComponents/SelectForm";
import { CustomFieldRenderers, FormFieldInputConfig } from "./types";

type Props = {
  fields: FormFieldInputConfig[];
  formData: Record<string, any>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors?: Record<string, string>;
  mode: "add" | "edit";
  customFields?: CustomFieldRenderers;
};

export default function FormRenderer({
  fields,
  formData,
  onChange,
  errors = {},
  mode,
  customFields = {},
}: Props) {
  const visibleFields = useMemo(
    () =>
      fields.filter((f) => !f.visibleWhen || f.visibleWhen({ mode, formData })),
    [fields, formData, mode]
  );

  return (
    <div className="space-y-4 pt-4 grid grid-cols-2 gap-x-4">
      {visibleFields.map((input) => {
        const value = formData?.[input.key] ?? "";
        const error = errors[input.key];
        const disabled = input.editable === false;

        if (input.type === "select") {
          return (
            <SelectForm
              key={input.key}
              inputKey={input.key}
              label={input.label}
              value={value}
              onChange={onChange as any}
              options={input.options ?? []}
              placeholderOption="Seleccionar..."
              error={error}
              disabled={disabled}
            />
          );
        }

        if (input.type === "custom" && customFields[input.key]) {
          return (
            <div key={input.key}>
              {customFields[input.key](String(value), (next) => {
                const evt = {
                  target: { name: input.key, value: next },
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                onChange(evt);
              }, { formData, mode, disabled })}
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
          );
        }

        // text / number / date
        return (
          <DynamicInputField
            key={input.key}
            inputKey={input.key}
            inputType={input.type as any}
            label={input.label}
            placeholder={input.label}
            value={String(value)}
            onChange={onChange}
            options={undefined}
            error={error}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}