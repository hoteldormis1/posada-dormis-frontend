"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import { FaEdit, FaTrash } from "react-icons/fa";
import { FormFieldInputConfig, Habitacion, SortOrder } from "@/models/types";
import { useEditPopup } from "@/hooks/useEditPopup";
import { useAddPopup } from "@/hooks/useAddPopup";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { TableBody, TableHeader, TableButtons } from "../../../index";
import { z } from "zod";

const actionIconButtonBase =
  "cursor-pointer h-7 w-7 rounded-md border transition-colors inline-flex items-center justify-center";
const actionIconButtonEdit =
  `${actionIconButtonBase} border-white/15 bg-white/6 text-emerald-300 hover:bg-white/12 hover:text-emerald-200`;
const actionIconButtonDelete =
  `${actionIconButtonBase} border-white/15 bg-white/6 text-red-300 hover:bg-red-500/20 hover:text-red-200 hover:border-red-400/30`;

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
  /** Opcional: eliminar múltiples registros. Si no se pasa, se llama onSaveDelete por cada id. */
  onSaveDeleteMany?: (ids: string[]) => Promise<void>;
  inputOptions?: FormFieldInputConfig[];
  customFields?: {
    [key: string]: (
      value: string,
      onChange: (nextValue: string) => void,
      ctx?: { formData?: Record<string, any>; mode?: "add" | "edit"; row?: any; disabled?: boolean }
    ) => React.ReactNode;
  };
  validationSchemaEdit?: z.ZodSchema<Record<string, unknown>>;
  validationSchemaAdd?: z.ZodSchema<Record<string, unknown>>;
  mapRowToFormData?: (row: T) => Record<string, string>;
  showActions?: { create: boolean; delete: boolean; edit: boolean };
  /** Per-row guard: return false to hide the delete button for that row */
  canDeleteRow?: (row: T) => boolean;
  addPopupDescription?: string;
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
  onSaveDeleteMany,
  onSort,
  sortField,
  sortOrder,
  inputOptions = [],
  customFields,
  validationSchemaEdit,
  validationSchemaAdd,
  mapRowToFormData,
  showActions,
  canDeleteRow,
  addPopupDescription,
}: TableComponentProps<T>) => {
  const { confirm } = useSweetAlert();
  // ── Paginación ──────────────────────────────────────────────────────────────
  const isControlledPagination = Boolean(onPageChange && onPageSizeChange);
  const [internalCurrentPage, setInternalCurrentPage] = useState(currentPage);
  const [internalPageSize, setInternalPageSize] = useState(pageSize);

  useEffect(() => {
    if (!isControlledPagination) return;
    setInternalCurrentPage(currentPage);
    setInternalPageSize(pageSize);
  }, [isControlledPagination, currentPage, pageSize]);

  const effectiveCurrentPage = isControlledPagination ? currentPage : internalCurrentPage;
  const effectivePageSize = isControlledPagination ? pageSize : internalPageSize;
  const effectiveTotalItems = totalItems ?? data.length;
  const effectiveTotalPages = Math.max(
    1,
    Math.ceil((effectiveTotalItems || data.length) / Math.max(1, effectivePageSize))
  );

  useEffect(() => {
    if (isControlledPagination || !showPagination) return;
    if (internalCurrentPage > effectiveTotalPages) {
      setInternalCurrentPage(effectiveTotalPages);
    }
  }, [isControlledPagination, showPagination, internalCurrentPage, effectiveTotalPages]);

  const paginatedData =
    showPagination && !isControlledPagination
      ? data.slice((effectiveCurrentPage - 1) * effectivePageSize, effectiveCurrentPage * effectivePageSize)
      : data;

  // ── Selección múltiple ──────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingMany, setDeletingMany] = useState(false);

  // Al cambiar de página, limpiar selección
  useEffect(() => {
    setSelectedIds(new Set());
  }, [effectiveCurrentPage, effectivePageSize]);

  const isRowSelectable = useCallback(
    (row: T) => (canDeleteRow ? canDeleteRow(row) : true),
    [canDeleteRow]
  );

  const visibleSelectableIds = useMemo(
    () => paginatedData.filter((r) => isRowSelectable(r)).map((r) => r.id),
    [paginatedData, isRowSelectable]
  );
  const allSelected =
    visibleSelectableIds.length > 0 &&
    visibleSelectableIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  const toggleRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleSelectableIds));
    }
  }, [allSelected, visibleSelectableIds]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const allowed = new Set(data.filter((r) => isRowSelectable(r)).map((r) => r.id));
      const next = new Set(Array.from(prev).filter((id) => allowed.has(id)));
      return next;
    });
  }, [data, isRowSelectable]);

  const handleDeleteMany = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;

    const firstConfirm = await confirm("¿Deseás borrar los registros seleccionados?");
    if (!firstConfirm) return;
    const secondConfirm = await confirm(
      "Esta acción es irreversible. Si hay registros relacionados en otras tablas, no se podrán borrar. ¿Querés continuar?"
    );
    if (!secondConfirm) return;

    setDeletingMany(true);
    try {
      if (onSaveDeleteMany) {
        await onSaveDeleteMany(ids);
      } else {
        for (const id of ids) {
          await Promise.resolve(onSaveDelete(id));
        }
      }
      setSelectedIds(new Set());
    } finally {
      setDeletingMany(false);
    }
  }, [selectedIds, onSaveDeleteMany, onSaveDelete, confirm]);

  // ── Editar ──────────────────────────────────────────────────────────────────
  const {
    showEditPopup,
    setShowEditPopup,
    selectedRow,
    formData,
    handleEditClick,
    handleFormChange,
    getUpdatedRow,
    formInputs,
    errors,
    validateForm,
  } = useEditPopup<T>(inputOptions, validationSchemaEdit, mapRowToFormData);

  // ── Agregar ─────────────────────────────────────────────────────────────────
  const initialValues = useMemo(() => {
    const emptyObj: Partial<T> = {};
    inputOptions.forEach((field) => {
      emptyObj[field.key as keyof T] = "" as unknown as T[keyof T];
    });
    return emptyObj;
  }, [inputOptions]);

  const numericFields = inputOptions.filter((f) => f.type === "number").map((f) => f.key);

  const {
    showAddPopup,
    setShowAddPopup,
    formData: formDataAdd,
    handleFormChange: handleFormChangeAdd,
    getNewItem,
    resetForm,
    errors: errorsAdd,
    validateForm: validateFormAdd,
    huespedLogic,
  } = useAddPopup<T>(initialValues, numericFields, validationSchemaAdd);

  // ── Acciones fila ───────────────────────────────────────────────────────────
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

  // ── Columnas ────────────────────────────────────────────────────────────────
  const tableColumns = useMemo((): ColumnDef<T>[] => {
    const cols: ColumnDef<T>[] = [];

    // Columna checkbox (solo si delete está habilitado)
    if (showFormActions && showActions?.delete) {
      cols.push({
        id: "__select__",
        enableSorting: false,
        header: () => (
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="accent-emerald-400 w-4 h-4 cursor-pointer rounded"
            title="Seleccionar todo"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.has(row.original.id)}
            disabled={!isRowSelectable(row.original)}
            onChange={() => isRowSelectable(row.original) && toggleRow(row.original.id)}
            onClick={(e) => e.stopPropagation()}
            className="accent-emerald-400 w-4 h-4 cursor-pointer rounded disabled:opacity-35 disabled:cursor-not-allowed"
            title={
              isRowSelectable(row.original)
                ? "Seleccionar fila"
                : "Este registro no se puede eliminar"
            }
          />
        ),
      });
    }

    cols.push(
      ...columns.map((col) => ({
        accessorKey: col.key,
        header: col.header,
      }))
    );

    const hasRowActions = showActions?.edit || showActions?.delete;
    if (showFormActions && hasRowActions) {
      cols.push({
        accessorKey: "actions",
        enableSorting: false,
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex gap-2 justify-center">
            {showActions?.edit && (
              <button
                onClick={() => handleEditClick(row.original.id, data)}
                className={actionIconButtonEdit}
                aria-label="Editar"
              >
                <FaEdit className="text-xs cursor-pointer" />
              </button>
            )}
            {showActions?.delete && (!canDeleteRow || canDeleteRow(row.original)) && (
              <button
                onClick={() => handleDelete(row.original.id)}
                className={actionIconButtonDelete}
                aria-label="Eliminar"
              >
                <FaTrash className="text-xs cursor-pointer" />
              </button>
            )}
          </div>
        ),
      });
    }

    return cols;
  }, [columns, showFormActions, showActions, canDeleteRow, data, handleEditClick, allSelected, selectedIds, toggleAll, toggleRow, isRowSelectable]);

  const table = useReactTable({
    data: paginatedData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((effectiveTotalItems ?? data.length) / effectivePageSize),
  });

  const handleHeaderClick = (key: string) => {
    if (!onSort) return;
    const newOrder =
      sortField === key && sortOrder === SortOrder.asc ? SortOrder.desc : SortOrder.asc;
    onSort(key, newOrder);
  };

  return (
    <div className="flex flex-col mx-auto w-full max-w-[1400px]">
      <TableHeader
        title={title}
        search={search}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        setShowAddPopup={setShowAddPopup}
        showFormActions={showFormActions}
        showActions={showActions}
        selectedCount={selectedIds.size}
        onDeleteSelected={showActions?.delete ? handleDeleteMany : undefined}
        deletingMany={deletingMany}
      />

      <TableBody
        table={table}
        columnsLength={columns.length}
        showFormActions={showFormActions}
        sortField={sortField}
        sortOrder={sortOrder}
        handleHeaderClick={handleHeaderClick}
        showActions={showActions}
      />

      <TableButtons
        title={title}
        showPagination={showPagination}
        currentPage={effectiveCurrentPage}
        pageSize={effectivePageSize}
        totalItems={effectiveTotalItems}
        onPageChange={(page) => {
          if (isControlledPagination) {
            onPageChange?.(page);
            return;
          }
          const nextPage = Math.min(Math.max(1, page), effectiveTotalPages);
          setInternalCurrentPage(nextPage);
        }}
        onPageSizeChange={(size) => {
          if (isControlledPagination) {
            onPageSizeChange?.(size);
            return;
          }
          setInternalPageSize(size);
          setInternalCurrentPage(1);
        }}
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
        addPopupDescription={addPopupDescription}
        customFields={customFields}
        huespedLogic={huespedLogic}
      />
    </div>
  );
};

export default TableComponent;
