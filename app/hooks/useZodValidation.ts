import { useState, useCallback } from "react";
import { z } from "zod";

interface ValidationError {
  field: string;
  message: string;
}

export function useZodValidation<T extends Record<string, unknown>>(
  schema: z.ZodSchema<T>
) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(
    (data: Record<string, unknown>): { isValid: boolean; errors: ValidationError[] } => {
      try {
        schema.parse(data);
        setErrors({});
        return { isValid: true, errors: [] };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationErrors: ValidationError[] = error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));

          const errorMap: Record<string, string> = {};
          validationErrors.forEach((err) => {
            errorMap[err.field] = err.message;
          });

          setErrors(errorMap);
          return { isValid: false, errors: validationErrors };
        }
        return { isValid: false, errors: [{ field: "general", message: "Error de validación" }] };
      }
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validate,
    clearErrors,
    setFieldError,
    clearFieldError,
  };
}
