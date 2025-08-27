"use client";

import React from "react";
import { Paginator, PopupFormEditar, PopupFormAgregar } from "@/components";
import { CustomFieldRenderers, FormFieldInputConfig } from "@/components/reservas/types";
import FormRenderer from "@/components/reservas/FormRenderer";

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

  // ✅ ahora usamos el esquema de campos reutilizable
  formInputs: FormFieldInputConfig[];

  formData: Record<string, any>;
  handleFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  getUpdatedRow: () => T | null;
  handleSaveEdit: (updated: T) => void;
  setShowEditPopup: (show: boolean) => void;
  errors?: Record<string, string>;
  validateForm?: () => boolean;

  // Agregado
  showAddPopup?: boolean;
  setShowAddPopup?: (show: boolean) => void;
  formDataAdd?: Record<string, any>;
  handleFormChangeAdd?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  handleSaveAdd?: () => void;
  errorsAdd?: Record<string, string>;
  validateFormAdd?: () => boolean;

  // ✅ renderers custom (Origen, MontoPagado, etc.)
  customFields?: CustomFieldRenderers;

  // (Opcional) lógica de huésped previa; ya no es necesaria con FormRenderer,
  // pero la dejamos para no romper firmas donde se siga pasando.
  huespedLogic?: {
    huespedMode: string;
    handleModeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleHuespedChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    isFieldEditable: (field: string) => boolean;
    huespedes: any[];
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

  // edit
  showEditPopup,
  selectedRow,
  formInputs,
  formData,
  handleFormChange,
  getUpdatedRow,
  handleSaveEdit,
  setShowEditPopup,
  errors = {},
  validateForm,

  // add
  showAddPopup,
  setShowAddPopup,
  formDataAdd,
  handleFormChangeAdd,
  handleSaveAdd,
  errorsAdd = {},
  validateFormAdd,

  // custom renderers
  customFields = {},
}: TableButtonsProps<T>) => {
  const handleSaveEditWithValidation = () => {
    if (validateForm && !validateForm()) return;
    const updated = getUpdatedRow();
    if (updated) handleSaveEdit(updated);
  };

  const handleSaveAddWithValidation = () => {
    if (validateFormAdd && !validateFormAdd()) return;
    if (handleSaveAdd) handleSaveAdd();
  };

  const hasErrors = Object.keys(errors).length > 0;
  const hasErrorsAdd = Object.keys(errorsAdd).length > 0;

  // ✅ adaptamos customFields para inyectar "row" cuando estamos en edit
  const customFieldsWithRowEdit: CustomFieldRenderers = Object.fromEntries(
    Object.entries(customFields).map(([k, render]) => [
      k,
      (value: string, onChange: (next: string) => void, ctx: any) =>
        render(value, onChange, { ...ctx, row: selectedRow }),
    ])
  );

  // ✅ para add no hay row
  const customFieldsAdd: CustomFieldRenderers = customFields;

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
            <FormRenderer
              fields={formInputs}
              formData={formData}
              onChange={handleFormChange}
              errors={errors}
              mode="edit"
              customFields={customFieldsWithRowEdit}
            />
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
          defaultData={formDataAdd}
          validateForm={validateFormAdd}
          hasErrors={hasErrorsAdd}
        >
          {() => (
            <FormRenderer
              fields={formInputs}
              formData={formDataAdd ?? {}}
              onChange={handleFormChangeAdd as any}
              errors={errorsAdd}
              mode="add"
              customFields={customFieldsAdd}
            />
          )}
        </PopupFormAgregar>
      )}
    </>
  );
};

export default TableButtons;