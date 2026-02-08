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
  editable?: boolean | ((ctx: { mode: "add" | "edit"; formData: Record<string, any> }) => boolean);
  visibleWhen?: (ctx: { mode: "add" | "edit"; formData: Record<string, any> }) => boolean;
}