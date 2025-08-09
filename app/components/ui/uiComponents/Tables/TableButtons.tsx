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

  // Agregado
  showAddPopup?: boolean;
  setShowAddPopup?: (show: boolean) => void;
  formDataAdd?: Record<string, string>;
  handleFormChangeAdd?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSaveAdd?: () => void;

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
  showAddPopup,
  setShowAddPopup,
  formDataAdd,
  handleFormChangeAdd,
  handleSaveAdd,
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
          onSave={() => {
            const updated = getUpdatedRow();
            if (updated) handleSaveEdit(updated);
          }}
          title={"Editar " + title}
        >
          {() => (
            <div className="space-y-4 pt-4 grid grid-cols-2 gap-x-4">
              {formInputs.map((input) => {
                const value = formData[input.key] || "";
                // ✅ usar renderer custom si type === "custom" y está definido
                if (
                  input.type === ("custom" as FieldInputType) &&
                  customFields?.[input.key]
                ) {
                  return (
                    <div key={`edit-${input.key}`}>
                      {customFields[input.key](value, makeSyntheticChange(input.key))}
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
          onSave={() => handleSaveAdd && handleSaveAdd()}
          title={"Agregar " + title}
          defaultData={selectedRow}
        >
          {() => (
            <div className="space-y-4 pt-4 grid grid-cols-2 gap-x-4">
              {formInputs.map((input) => {
                const value = formDataAdd?.[input.key] || "";
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
