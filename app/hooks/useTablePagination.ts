import { useState, useMemo } from "react";

export function useTablePagination<T>(
  data: T[],
  options?: {
    currentPage?: number;
    pageSize?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    rowsPerPage?: number;
  }
) {
  const {
    currentPage,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    rowsPerPage = 10,
  } = options || {};

  const [internalPage, setInternalPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(rowsPerPage);

  const activePage = currentPage ?? internalPage;
  const activePageSize = pageSize ?? internalPageSize;
  const totalPages = Math.ceil((totalItems ?? data.length) / activePageSize);

  const paginatedData = useMemo(() => {
    if (currentPage !== undefined) return data;
    const startIndex = (activePage - 1) * activePageSize;
    return data.slice(startIndex, startIndex + activePageSize);
  }, [data, activePage, activePageSize, currentPage]);

  const handlePageChange = (page: number) => {
    if (onPageChange) onPageChange(page);
    else setInternalPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    if (onPageSizeChange) onPageSizeChange(size);
    else {
      setInternalPage(1);
      setInternalPageSize(size);
    }
  };

  return {
    paginatedData,
    activePage,
    activePageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  };
}
