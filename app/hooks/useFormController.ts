import { useCallback, useMemo, useState } from "react";

export function useFormController<T extends Record<string, any>>(
  initial: T,
  validate?: (data: T) => Record<string, string> // devuelve errores
) {
  const [formData, setFormData] = useState<T>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setField = useCallback((key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const validateForm = useCallback(() => {
    if (!validate) return true;
    const errs = validate(formData);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formData, validate]);

  const resetForm = useCallback(() => {
    setFormData(initial);
    setErrors({});
  }, [initial]);

  return { formData, setField, handleFormChange, errors, validateForm, resetForm };
}