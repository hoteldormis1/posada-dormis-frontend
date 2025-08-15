"use client";

import { useState, forwardRef, ForwardedRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  labelBaseEstilos,
  inputBaseEstilos,
  inputErrorEstilos,
  mensajeErrorEstilos,
} from "@/styles/global-styles";

interface InputTypeProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputKey?: string;
  InputForm?: string; // "text" | "password" | "number" | etc.
  placeholder?: string;
  labelStyles?: string;
  children?: React.ReactNode;
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
}

const InputTypeComponent = (
  {
    inputKey = "",
    InputForm = "text",
    placeholder = "",
    labelStyles = "",
    children,
    error = null,
    disabled = false,
    required = false,
    ...rest
  }: InputTypeProps,
  ref: ForwardedRef<HTMLInputElement>
) => {
  const [show, setShow] = useState(false);
  const type = InputForm === "password" ? (show ? "text" : "password") : InputForm;

  const fieldClass = `
    ${inputBaseEstilos}
    ${error ? inputErrorEstilos : ""}
    ${disabled ? "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""}
    ${InputForm === "password" ? "pr-10" : ""}
  `;

  return (
    <div className="w-full">
      <label htmlFor={inputKey} className={`${labelBaseEstilos} ${labelStyles}`}>
        {children}
      </label>

      <div className="relative">
        <input
          id={inputKey}
          name={inputKey}
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={fieldClass}
          onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
          onPaste={(e) => {
            if (InputForm === "password") e.preventDefault();
          }}
          {...rest}
        />

        {InputForm === "password" && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-3 flex items-center justify-center top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)]"
            tabIndex={-1}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}</div>

      {error && <p className={mensajeErrorEstilos}>{error}</p>}
    </div>
  );
};

export default forwardRef<HTMLInputElement, InputTypeProps>(InputTypeComponent);
