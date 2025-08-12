export type FieldInputType = "text" | "number" | "select" | "date" | "custom";

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
}