"use client";

import React from "react";
import {
  Paginator,
  PopupFormEditar,
  PopupFormAgregar,
  DynamicInputField,
} from "@/components";
import { FieldInputType, FormFieldInputOptionsConfig } from "@/models/types";

interface TableButtonsProps<T> {
  title: string | undefined;
  showPagination: boolean;
  currentPage: number;
  pageSize: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  // Edición
  showEditPopup: boolean;
  selectedRow: T | null;
  formInputs: Array<{
    key: string;
    type: FieldInputType; // ← debe soportar "custom"
    label: string;
    options?: FormFieldInputOptionsConfig[];
  }>;
  formData: Record<string, string>;
  handleFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  getUpdatedRow: () => T | null;
  handleSaveEdit: (updated: T) => void;
  setShowEditPopup: (show: boolean) => void;
  errors?: Record<string, string>; // Nuevo: errores de validación
  validateForm?: () => boolean; // Nuevo: función de validación

  // Agregado
  showAddPopup?: boolean;
  setShowAddPopup?: (show: boolean) => void;
  formDataAdd?: Record<string, string>;
  handleFormChangeAdd?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSaveAdd?: () => void;
  errorsAdd?: Record<string, string>; // Nuevo: errores de validación para agregar
  validateFormAdd?: () => boolean; // Nuevo: función de validación para agregar

  // ✅ Nuevo: renderers para campos personalizados (ej: ReactFlagsSelect)
  customFields?: {
    [key: string]: (
      value: string,
      onChange: (nextValue: string) => void
    ) => React.ReactNode;
  };
}

const TableButtons = <T extends { id: string }>({
  title,
  showPagination,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  showEditPopup,
  selectedRow,
  formInputs,
  formData,
  handleFormChange,
  getUpdatedRow,
  handleSaveEdit,
  setShowEditPopup,
  errors = {}, // Nuevo
  validateForm, // Nuevo
  showAddPopup,
  setShowAddPopup,
  formDataAdd,
  handleFormChangeAdd,
  handleSaveAdd,
  errorsAdd = {}, // Nuevo
  validateFormAdd, // Nuevo
  customFields, // ✅
}: TableButtonsProps<T>) => {
  // puente para onChange de componentes custom → tus handlers existentes
  const makeSyntheticChange =
    (key: string, isAdd = false) =>
    (nextValue: string) => {
      const evt = {
        target: { name: key, value: nextValue },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      if (isAdd) {
        handleFormChangeAdd?.(evt);
      } else {
        handleFormChange(evt);
      }
    };

  const handleSaveEditWithValidation = () => {
    if (validateForm && !validateForm()) {
      return; // No continuar si la validación falla
    }
    const updated = getUpdatedRow();
    if (updated) handleSaveEdit(updated);
  };

  const handleSaveAddWithValidation = () => {
    if (validateFormAdd && !validateFormAdd()) {
      return; // No continuar si la validación falla
    }
    if(handleSaveAdd){
      handleSaveAdd();
    }
  };

  // Verificar si hay errores
  const hasErrors = Object.keys(errors).length > 0;
  const hasErrorsAdd = Object.keys(errorsAdd).length > 0;

  return (
    <>
      {showPagination && (
        <Paginator
          currentPage={currentPage}
          totalPages={Math.ceil((totalItems ?? 0) / pageSize)}
          onPageChange={(p) => onPageChange && onPageChange(p)}
          pageSize={pageSize}
          onPageSizeChange={(s) => onPageSizeChange && onPageSizeChange(s)}
        />
      )}

      {/* Popup para editar */}
      {showEditPopup && selectedRow && (
        <PopupFormEditar
          isOpen={showEditPopup}
          initialData={selectedRow}
          onClose={() => setShowEditPopup(false)}
          onSave={handleSaveEditWithValidation}
          title={"Editar " + title}
          validateForm={validateForm}
          hasErrors={hasErrors}
        >
          {() => (
            <div className="space-y-4 pt-4 grid grid-cols-2 gap-x-4">
              {formInputs.map((input) => {
                const value = formData[input.key] || "";
                const error = errors[input.key]; // Nuevo
                // ✅ usar renderer custom si type === "custom" y está definido
                if (
                  input.type === ("custom" as FieldInputType) &&
                  customFields?.[input.key]
                ) {
                  return (
                    <div key={`edit-${input.key}`}>
                      {customFields[input.key](value, makeSyntheticChange(input.key))}
                      {error && (
                        <p className="text-red-500 text-xs mt-1">{error}</p>
                      )}
                    </div>
                  );
                }
                // default: input normal
                return (
                  <DynamicInputField
                    key={`edit-${input.key}`}
                    inputKey={input.key}
                    inputType={input.type}
                    label={input.label}
                    placeholder={input.label}
                    value={value}
                    onChange={(e) => handleFormChange(e)}
                    options={input.type === "select" ? input.options : undefined}
                    error={error} // Nuevo
                  />
                );
              })}
            </div>
          )}
        </PopupFormEditar>
      )}

      {/* Popup para agregar */}
      {showAddPopup && (
        <PopupFormAgregar
          isOpen={showAddPopup}
          onClose={() => setShowAddPopup && setShowAddPopup(false)}
          onSave={handleSaveAddWithValidation}
          title={"Agregar " + title}
          defaultData={selectedRow}
          validateForm={validateFormAdd}
          hasErrors={hasErrorsAdd}
        >
          {() => (
            <div className="space-y-4 pt-4 grid grid-cols-2 gap-x-4">
              {formInputs.map((input) => {
                const value = formDataAdd?.[input.key] || "";
                const error = errorsAdd[input.key]; // Nuevo
                if (
                  input.type === ("custom" as FieldInputType) &&
                  customFields?.[input.key]
                ) {
                  return (
                    <div key={`add-${input.key}`}>
                      {customFields[input.key](
                        value,
                        makeSyntheticChange(input.key, true)
                      )}
                      {error && (
                        <p className="text-red-500 text-xs mt-1">{error}</p>
                      )}
                    </div>
                  );
                }
                return (
                  <DynamicInputField
                    key={`add-${input.key}`}
                    inputKey={input.key}
                    inputType={input.type}
                    label={input.label}
                    placeholder={input.label}
                    value={value}
                    onChange={(e) => handleFormChangeAdd && handleFormChangeAdd(e)}
                    options={input.type === "select" ? input.options : undefined}
                    error={error} // Nuevo
                  />
                );
              })}
            </div>
          )}
        </PopupFormAgregar>
      )}
    </>
  );
};

export default TableButtons;
