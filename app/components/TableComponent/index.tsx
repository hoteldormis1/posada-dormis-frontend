"use client";

import React from "react";
import {
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { FaCheck, FaTimes, FaEdit, FaSearch } from "react-icons/fa";
import Paginator from "../Paginator";
import InputType from "../InputType";
import { fuenteDeTitulo } from "@/styles/global-styles";

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
}

const TableComponent = <T extends { id: string }>({
  columns,
  data,
  onEdit,
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
}: TableComponentProps<T>) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const tableColumns = React.useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((col) => ({
        accessorKey: col.key,
        header: col.header,
        cell: ({ getValue }) => {
          const value = getValue();
          if (typeof value === "boolean") {
            return value ? (
              <FaCheck className="text-green-600 text-xs mx-auto" />
            ) : (
              <FaTimes className="text-red-600 text-xs mx-auto" />
            );
          }
          return String(value ?? "—");
        },
      })),
    [columns]
  );

  if (showFormActions) {
    tableColumns.push({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <button
          onClick={() => onEdit && onEdit(row.original.id)}
          className="text-blue-500 hover:text-blue-700"
        >
          <FaEdit className="text-black text-xs" />
        </button>
      ),
    } as ColumnDef<T>);
  }

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((totalItems ?? data.length) / pageSize),
  });

  return (
    <div className="flex flex-col mx-auto w-full max-w-[1000px]">
      {/* Título y barra de búsqueda */}
      <div className="w-full flex justify-between items-center mb-2">
        {title && <h2 className={fuenteDeTitulo}>{title}</h2>}
        <div className="my-3 w-full sm:w-1/2 md:w-1/3 relative">
          <InputType
            inputType="search"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && onSearchSubmit && onSearchSubmit(e)
            }
          />
          <button
            type="button"
            onClick={onSearchSubmit}
            aria-label="Buscar"
            className="absolute right-3 top-7/12 -translate-y-1/2 text-gray-400 hover:text-main focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-1 rounded"
          >
            <FaSearch className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto h-80 border border-gray-200">
        <table className="min-w-full text-left text-xs bg-white">
          <thead className="bg-main text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="py-2 px-4 border-b cursor-pointer select-none"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getIsSorted() === "asc" && " 🔼"}
                    {header.column.getIsSorted() === "desc" && " 🔽"}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-100 text-fontSecondary h-[20px]"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 border-b text-center">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginador */}
      {showPagination && (
        <Paginator
          currentPage={currentPage}
          totalPages={Math.ceil((totalItems ?? data.length) / pageSize)}
          onPageChange={(p) => onPageChange && onPageChange(p)}
          pageSize={pageSize}
          onPageSizeChange={(s) => onPageSizeChange && onPageSizeChange(s)}
        />
      )}
    </div>
  );
};

export default TableComponent;
