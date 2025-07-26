"use client";

import React from "react";
import Button from "../Button";
import Paginator from "../Paginator";
import { useTablePagination } from "@/utils/hooks/useTablePagination";
import TableHeader from "./Subcomponents/TableHeader";
import TableRow from "./Subcomponents/TableRow";

type TableColumn = { header: string; key: string };

interface TableComponentProps<T> {
  columns: TableColumn[];
  data: T[];
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  title?: string;
  showFormActions?: boolean;
  showPagination?: boolean;

  currentPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  rowsPerPage?: number;
}

const TableComponent = <T extends { id: string }>({
  columns,
  data,
  onEdit,
  // onAdd,
  title,
  showFormActions = false,
  showPagination = false,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  rowsPerPage = 10,
}: TableComponentProps<T>) => {
  const {
    paginatedData,
    activePage,
    activePageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  } = useTablePagination(data, {
    currentPage,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    rowsPerPage,
  });

  return (
    <div className="flex flex-col mx-auto max-w-[1000px]">
      {showFormActions && (
        <div className="flex justify-end py-2">
          <Button
            onClick={()=>null}
            className="text-white bg-main hover:bg-tertiary text-fontSecondary"
          >
            Agregar Nuevo
          </Button>
        </div>
      )}

      {title && <h2 className="py-2">{title}</h2>}

      <div
        className={`flex-grow overflow-auto h-80 border border-gray-200 ${
          showPagination && totalPages > 1 ? "bg-white" : "bg-white"
        }`}
      >
        <table className="min-w-full bg-white">
          <TableHeader columns={columns} showFormActions={showFormActions} />
          <tbody>
            {paginatedData.map((item) => (
              <TableRow
                key={item.id}
                item={item}
                columns={columns}
                showFormActions={showFormActions}
                onEdit={onEdit}
              />
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <Paginator
          currentPage={activePage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageSize={activePageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default TableComponent;
