export type FieldInputType = "text" | "number" | "select" | "date";

export interface FormFieldInputConfig {
  key: string;
  label?: string;
  type?: FieldInputType;
  options?: { value: string; label: string }[];
}