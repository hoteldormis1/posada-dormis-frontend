"use client";

import React from "react";
import PhoneInputLib, { parsePhoneNumber, isValidPhoneNumber } from "react-phone-number-input";
import { labelBaseEstilos, mensajeErrorEstilos } from "@/styles/global-styles";
import "react-phone-number-input/style.css";

interface PhoneInputProps {
  inputKey: string;
  label: string;
  value: string;           // valor completo en formato E.164: "+5491155667788"
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

export default function PhoneInput({
  inputKey,
  label,
  value,
  onChange,
  error,
  disabled = false,
}: PhoneInputProps) {
  // react-phone-number-input espera undefined en lugar de ""
  const phoneValue = value || undefined;

  // Determinar si el número es válido para mostrar el estado visual
  const isValid = phoneValue ? isValidPhoneNumber(phoneValue) : undefined;

  const handleChange = (newValue: string | undefined) => {
    const syntheticEvent = {
      target: { name: inputKey, value: newValue ?? "" },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(syntheticEvent);
  };

  // Extraer info del número para mostrar bajo el campo
  let fullDisplay = "";
  if (phoneValue && isValid) {
    try {
      const parsed = parsePhoneNumber(phoneValue);
      if (parsed) {
        const countryName = new Intl.DisplayNames(["es"], { type: "region" }).of(
          parsed.country ?? ""
        );
        fullDisplay = `${countryName ?? ""} · ${parsed.formatInternational()}`;
      }
    } catch (_) {
      // silencioso
    }
  }

  const containerClass = [
    "phone-input-shell",
    error ? "PhoneInput--error" : "",
    !error && isValid ? "PhoneInput--valid" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-full">
      <label htmlFor={inputKey} className={labelBaseEstilos}>
        {label}
      </label>

      <PhoneInputLib
        id={inputKey}
        name={inputKey}
        value={phoneValue}
        onChange={handleChange}
        disabled={disabled}
        defaultCountry="AR"
        international
        countryCallingCodeEditable={false}
        placeholder="Ej: 351 678 9012"
        className={containerClass}
        // Pasa el id al input interno para que el label lo vincule
        numberInputProps={{ id: inputKey, name: inputKey }}
      />

      {/* Número formateado cuando es válido */}
      {fullDisplay && !error && (
        <p className="mt-1 text-[12px] text-admin-dim flex items-center gap-1">
          <span className="text-admin-accent">✓</span>
          {fullDisplay}
        </p>
      )}

      {error && <p className={mensajeErrorEstilos}>{error}</p>}
    </div>
  );
}

// Re-exportar utilidades útiles para el resto de la app
export { isValidPhoneNumber, parsePhoneNumber };
export type { PhoneInputProps };
