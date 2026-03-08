"use client";

import React, { useEffect, useRef } from "react";
import PhoneInputLib, { parsePhoneNumber, isValidPhoneNumber } from "react-phone-number-input";
import { labelBaseEstilos, mensajeErrorEstilos } from "@/styles/global-styles";
import "react-phone-number-input/style.css";

// Inyecta los overrides de estilo una sola vez
const injectPhoneStyles = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("phone-input-styles")) return;

  const style = document.createElement("style");
  style.id = "phone-input-styles";
  style.innerHTML = `
    /* ── Contenedor principal ── */
    .PhoneInput {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    /* ── Selector de país ── */
    .PhoneInputCountry {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      padding: 0 10px;
      height: 42px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.05);
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
      position: relative;
    }
    .PhoneInputCountry:focus-within {
      border-color: rgba(52, 211, 153, 0.5);
      background: rgba(255,255,255,0.08);
    }

    .PhoneInputCountryFlag {
      width: 22px;
      height: 16px;
      border-radius: 3px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .PhoneInputCountryFlag img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Flecha del selector */
    .PhoneInputCountrySelectArrow {
      width: 6px;
      height: 6px;
      border-right: 1.5px solid rgba(255,255,255,0.4);
      border-bottom: 1.5px solid rgba(255,255,255,0.4);
      transform: rotate(45deg) translateY(-2px);
      margin-left: 2px;
      transition: border-color 0.15s;
    }
    .PhoneInputCountry:focus-within .PhoneInputCountrySelectArrow {
      border-color: rgba(52, 211, 153, 0.7);
    }

    /* Select nativo oculto (accesibilidad) */
    .PhoneInputCountrySelect {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
      font-size: 16px; /* evita zoom en iOS */
      color: #111827; /* mejora legibilidad del dropdown nativo */
      background: #ffffff;
    }
    .PhoneInputCountrySelect option {
      color: #111827;
      background: #ffffff;
    }

    .PhoneInputCountryCallingCode {
      color: #e8e8ed;
    }

    /* ── Campo de número ── */
    .PhoneInputInput {
      flex: 1;
      height: 42px;
      padding: 0 14px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.05);
      color: #e8e8ed;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
      outline: none;
      -webkit-appearance: none;
    }
    .PhoneInputInput::placeholder {
      color: rgba(255,255,255,0.25);
    }
    .PhoneInputInput:focus {
      border-color: rgba(52, 211, 153, 0.5);
      background: rgba(255,255,255,0.07);
      box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.08);
    }
    .PhoneInputInput:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ── Estado error ── */
    .PhoneInput--error .PhoneInputCountry,
    .PhoneInput--error .PhoneInputInput {
      border-color: rgba(248, 113, 113, 0.55);
    }
    .PhoneInput--error .PhoneInputInput:focus {
      border-color: rgba(248, 113, 113, 0.7);
      box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.1);
    }

    /* ── Estado válido ── */
    .PhoneInput--valid .PhoneInputCountry,
    .PhoneInput--valid .PhoneInputInput {
      border-color: rgba(52, 211, 153, 0.4);
    }
  `;
  document.head.appendChild(style);
};

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
  injectPhoneStyles();

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
    "PhoneInput",
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
        countrySelectProps={{ style: { colorScheme: "dark", backgroundColor: "#0d271b", color: "#ffffff" } }}
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
        <p className="mt-1 text-[12px] text-emerald-100/45 flex items-center gap-1">
          <span className="text-emerald-400/60">✓</span>
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
