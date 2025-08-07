import { FormFieldInputConfig } from "@/models/types";
import { useCallback, useMemo, useState } from "react";

export function useEditPopup<T extends { id: string }>(
  editableFields: FormFieldInputConfig[] = []
) {
  // Editar
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Agregar
  const [showAddPopup, setShowAddPopup] = useState(false);

  // ========== Edición ==========
  const handleEditClick = useCallback(
    (id: string, data: T[]) => {
      const item = data.find((d) => d.id === id);
      if (item) {
        setSelectedRow(item);
        const formatted = Object.fromEntries(
          editableFields.map((field) => [field.key, String(item[field.key] ?? "")])
        );
        setFormData(formatted);
        setShowEditPopup(true);
      }
    },
    [editableFields]
  );

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    }));
  }, [editableFields]);

  return {
    // Editar
    showEditPopup,
    setShowEditPopup,
    selectedRow,
    formData,
    handleEditClick,
    handleFormChange,
    getUpdatedRow,

    // Agregar
    showAddPopup,
    setShowAddPopup,

    // Inputs
    formInputs,
  };
}
