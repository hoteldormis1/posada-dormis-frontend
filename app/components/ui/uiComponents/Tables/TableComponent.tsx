"use client";

import React, { useMemo } from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FormFieldInputConfig, Habitacion, SortOrder } from "@/models/types";
import { useEditPopup } from "@/hooks/useEditPopup";
import { useAddPopup } from "@/hooks/useAddPopup"; // ✅ import correcto
import { TableBody, TableHeader, TableButtons } from "../../../index";
import { z } from "zod";

interface TableComponentProps<T> {
  columns: { header: string; key: string }[];
  data: T[];
  onEdit?: (id: string) => void;
  title?: string;
  showFormActions?: boolean;
  showPagination?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (e?: React.FormEvent | React.KeyboardEvent) => void;
  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (field: string, order: SortOrder) => void;
  sortField?: string;
  sortOrder?: SortOrder;
  defaultNewItem?: T;
  onSaveEdit: (formData: Record<string, unknown>, selectedRow: Habitacion | T | null) => void;
  onSaveAdd: (formData: Record<string, unknown>) => void;
  onSaveDelete: (id: string) => void;
  inputOptions?: FormFieldInputConfig[];
  // ⭐ Nuevo: renderers para campos custom (ej: ReactFlagsSelect en "origen")
  customFields?: {
    [key: string]: (
      value: string,
      onChange: (nextValue: string) => void,
      ctx?: { formData?: Record<string, any>; mode?: "add" | "edit"; row?: any; disabled?: boolean }
    ) => React.ReactNode;
  };
  validationSchemaEdit?: z.ZodSchema<Record<string, unknown>>;
  validationSchemaAdd?: z.ZodSchema<Record<string, unknown>>;
  // Función para mapear datos de la fila al formulario de edición
  mapRowToFormData?: (row: T) => Record<string, string>;
}

const TableComponent = <T extends { id: string }>({
  columns,
  data,
  title,
  showFormActions = false,
  showPagination = false,
  search = "",
  onSearchChange,
  onSearchSubmit,
  currentPage = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onSaveEdit,
  onSaveAdd,
  onSaveDelete,
  onSort,
  sortField,
  sortOrder,
  inputOptions = [],
  customFields, // ⭐
  validationSchemaEdit, 
  validationSchemaAdd, 
  mapRowToFormData, 
}: TableComponentProps<T>) => {
  // === Editar ===
  const {
    showEditPopup,
    setShowEditPopup,
    selectedRow,
    formData,
    handleEditClick,
    handleFormChange,
    getUpdatedRow,
    formInputs, // seguirá funcionando para inputs estándar
    errors, 
    validateForm, 
  } = useEditPopup<T>(inputOptions, validationSchemaEdit, mapRowToFormData);

  // === Agregar ===
  const initialValues = useMemo(() => {
    const emptyObj: Partial<T> = {};
    inputOptions.forEach((field) => {
      emptyObj[field.key as keyof T] = "" as unknown as T[keyof T];
    });
    return emptyObj;
  }, [inputOptions]);

  const numericFields = inputOptions
    .filter((f) => f.type === "number")
    .map((f) => f.key);

  const {
    showAddPopup,
    setShowAddPopup,
    formData: formDataAdd,
    handleFormChange: handleFormChangeAdd,
    getNewItem,
    resetForm,
    errors: errorsAdd, 
    validateForm: validateFormAdd,
    huespedLogic, // Extraer la lógica de huésped
  } = useAddPopup<T>(initialValues, numericFields, validationSchemaAdd);

  // === Acciones ===
  const handleSaveEdit = (updated: T) => {
    onSaveEdit(updated, selectedRow);
    setShowEditPopup(false);
  };

  const handleSaveAdd = () => {
    const newItem = getNewItem();
    onSaveAdd(newItem);
    setShowAddPopup(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    onSaveDelete(id);
  };

  // === Columnas de la tabla ===
  const tableColumns = useMemo((): ColumnDef<T>[] => {
    const baseCols: ColumnDef<T>[] = columns.map((col) => ({
      accessorKey: col.key,
      header: col.header,
    }));

    if (showFormActions) {
      baseCols.push({
        accessorKey: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          return (
            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(row.original.id, data)}
                className="text-blue-500 hover:text-blue-700"
                aria-label="Editar"
              >
                <FaEdit className="text-black text-xs cursor-pointer" />
              </button>
              <button
                onClick={() => handleDelete?.(row.original.id)}
                className="text-red-500 hover:text-red-700"
                aria-label="Eliminar"
              >
                <FaTrash className="text-black text-xs cursor-pointer" />
              </button>
            </div>
          );
        },
      });
    }
    return baseCols;
  }, [columns, showFormActions, data, handleEditClick, onSaveDelete]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((totalItems ?? data.length) / pageSize),
  });

  const handleHeaderClick = (key: string) => {
    if (!onSort) return;
    const newOrder =
      sortField === key && sortOrder === SortOrder.asc
        ? SortOrder.desc
        : SortOrder.asc;
    onSort(key, newOrder);
  };

  return (
    <div className="flex flex-col mx-auto w-full max-w-[1000px]">
      <TableHeader
        title={title}
        search={search}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        setShowAddPopup={setShowAddPopup}
        showFormActions={showFormActions}
      />

      <TableBody
        table={table}
        columnsLength={columns.length}
        showFormActions={showFormActions}
        sortField={sortField}
        sortOrder={sortOrder}
        handleHeaderClick={handleHeaderClick}
      />

      <TableButtons
        title={title}
        showPagination={showPagination}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        showEditPopup={showEditPopup}
        setShowEditPopup={setShowEditPopup}
        selectedRow={selectedRow}
        formInputs={formInputs}
        formData={formData}
        handleFormChange={handleFormChange}
        getUpdatedRow={getUpdatedRow}
        handleSaveEdit={handleSaveEdit}
        errors={errors} 
        validateForm={validateForm} 
        showAddPopup={showAddPopup}
        setShowAddPopup={setShowAddPopup}
        formDataAdd={formDataAdd}
        handleFormChangeAdd={handleFormChangeAdd}
        handleSaveAdd={handleSaveAdd}
        errorsAdd={errorsAdd} 
        validateFormAdd={validateFormAdd} 
        // ⭐ Nuevo: pasamos renderers custom para inputs (ej: ReactFlagsSelect)
        customFields={customFields}
        // ⭐ Nuevo: pasamos la lógica de huésped
        huespedLogic={huespedLogic}
      />
    </div>
  );
};

export default TableComponent;
