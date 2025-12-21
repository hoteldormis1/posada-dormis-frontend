export type FieldInputType = "text" | "number" | "date" | "select" | "custom";

export type Option = { value: string | number; label: string };

export type FormFieldInputConfig = {
    key: string;
    type: FieldInputType;
    label: string;
    options?: Option[];
    editable?: boolean; // si false, renderizada pero deshabilitada
    visibleWhen?: (ctx: { mode: "add" | "edit"; formData: Record<string, any> }) => boolean; // condicional
};

export type CustomFieldRenderers = {
    [key: string]: (
        value: string,
        onChange: (next: string) => void,
        ctx: { formData: Record<string, any>; mode: "add" | "edit"; disabled?: boolean }
    ) => React.ReactNode;
};