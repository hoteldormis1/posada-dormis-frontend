import React from "react";
import ReactFlagsSelect from "react-flags-select";

type Props = {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  labelClass?: string;
  label?: string;
};

const OrigenField: React.FC<Props> = ({ value, onChange, disabled, labelClass = "", label = "Origen" }) => {
  const selected = value || "AR";
  return (
    <div className="flex flex-col gap-1">
      <label className={labelClass}>{label}</label>
      <ReactFlagsSelect
        selected={selected}
        onSelect={(code) => onChange(code)}
        searchable
        placeholder="Seleccioná un país"
        className={disabled ? "opacity-60 cursor-not-allowed" : ""}
        disabled={disabled}
      />
    </div>
  );
};

export default OrigenField;