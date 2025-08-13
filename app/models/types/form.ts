export type FieldInputType = "text" | "number" | "select" | "date" | "custom" | "range";

export interface FormFieldInputOptionsConfig{
  value: string | number;
  label: string;
}

export interface FormFieldInputConfig {
  key: string;
  label?: string;
  type?: FieldInputType;
  options?: FormFieldInputOptionsConfig[];
  placeholder?: string;
  editable?: boolean; // Nuevo: indica si el campo es editable en modo edición
}