import { FormFieldInputConfig } from "@/models/types";
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";

export function useEditPopup<T extends { id: string }>(
  editableFields: FormFieldInputConfig[] = [],
  schema?: z.ZodSchema<Record<string, unknown>>,
  mapRowToFormData?: (row: T) => Record<string, string>
) {
  // Editar
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Agregar
  const [showAddPopup, setShowAddPopup] = useState(false);

  // ========== Edición ==========
  const handleEditClick = useCallback(
    (id: string, data: T[]) => {
      const item = data.find((d) => d.id === id);
      if (item) {
        setSelectedRow(item);
        
        // Usar función de mapeo personalizada si está disponible, sino usar mapeo por defecto
        const formatted = mapRowToFormData 
          ? mapRowToFormData(item)
          : Object.fromEntries(
              editableFields.map((field) => [field.key, String(item[field.key] ?? "")])
            );
        
        setFormData(formatted);
        setErrors({});
        setTouchedFields(new Set());
        setShowEditPopup(true);
      }
    },
    [editableFields, mapRowToFormData]
  );

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // Marcar el campo como tocado
    setTouchedFields((prev) => new Set(prev).add(name));
    
    // Validación en tiempo real solo para campos tocados
    if (schema) {
      try {
        schema.parse(newFormData);
        // Si la validación pasa, limpiar todos los errores
        setErrors({});
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMap: Record<string, string> = {};
          error.issues.forEach((err) => {
            const field = err.path.join(".");
            // Solo agregar error si el campo fue tocado
            if (touchedFields.has(field) || field === name) {
              errorMap[field] = err.message;
            }
          });
          setErrors(errorMap);
        }
      }
    } else {
      // Si no hay schema, solo limpiar el error del campo actual
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    if (!schema) return true;

    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMap: Record<string, string> = {};
        error.issues.forEach((err) => {
          const field = err.path.join(".");
          errorMap[field] = err.message;
          // Marcar todos los campos con error como tocados
          setTouchedFields((prev) => new Set(prev).add(field));
        });
        setErrors(errorMap);
      }
      return false;
    }
  };

  const getUpdatedRow = useCallback(() => {
    if (!selectedRow) return null;
    return {
      ...selectedRow,
      ...Object.fromEntries(
        editableFields.map((field) => {
          const value = formData[field.key];
          return [field.key, field.type === "number" ? Number(value) : value];
        })
      ),
    };
  }, [formData, selectedRow, editableFields]);

  // ========== Campos ==========
  const formInputs = useMemo(() => {
    return editableFields.map((field) => ({
      key: field.key,
      label: field.label || field.key[0].toUpperCase() + field.key.slice(1),
      type: field.type || "text",
      options: field.options || [],
      editable: field.editable || false
    }));
  }, [editableFields]);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    // Editar
    showEditPopup,
    setShowEditPopup,
    selectedRow,
    formData,
    handleEditClick,
    handleFormChange,
    getUpdatedRow,
    errors,
    validateForm,
    hasErrors,

    // Agregar
    showAddPopup,
    setShowAddPopup,

    // Inputs
    formInputs,
  };
}
