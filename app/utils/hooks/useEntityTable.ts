import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";

interface UseEntityTableParams<F> {
  fetchAction: any; // thunk de Redux
  setPageAction: (page: number) => any;
  setPageSizeAction: (size: number) => any;
  selector: (state: any) => F;
  defaultSortField?: string;
  defaultSortOrder?: "ASC" | "DESC";
}

export const useEntityTable = <
  F extends {
    page: number;
    pageSize: number;
    total: number;
    datos: any[];
    loading: boolean;
    error: string | null;
  }
>({
  fetchAction,
  setPageAction,
  setPageSizeAction,
  selector,
  defaultSortField = "fecha",
  defaultSortOrder = "DESC",
}: UseEntityTableParams<F>) => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selector);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(defaultSortOrder);

  // Fetch inicial (sin `search` en dependencias)
  useEffect(() => {
    dispatch(
      fetchAction({
        page: state.page,
        size: state.pageSize,
        search,
        sortField,
        sortOrder,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, state.page, state.pageSize, sortField, sortOrder]);

  // Búsqueda manual
  const handleSearch = () => {
    dispatch(setPageAction(1));
    dispatch(
      fetchAction({
        page: 1,
        size: state.pageSize,
        search,
        sortField,
        sortOrder,
      })
    );
  };

  const handlePageChange = (page: number) => {
    dispatch(setPageAction(page));
    dispatch(
      fetchAction({
        page,
        size: state.pageSize,
        search,
        sortField,
        sortOrder,
      })
    );
  };

  const handlePageSizeChange = (size: number) => {
    dispatch(setPageSizeAction(size));
    dispatch(
      fetchAction({
        page: 1,
        size,
        search,
        sortField,
        sortOrder,
      })
    );
  };

  const handleSort = (field: string) => {
    const newOrder =
      sortField === field && sortOrder === "ASC" ? "DESC" : "ASC";
    setSortField(field);
    setSortOrder(newOrder);
    dispatch(
      fetchAction({
        page: state.page,
        size: state.pageSize,
        search,
        sortField: field,
        sortOrder: newOrder,
      })
    );
  };

  return {
    ...state, // Incluye loading, error, lista, page, pageSize, total
    search,
    setSearch,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    sortField,
    sortOrder,
    loading: state.loading,
    error: state.error,
  };
};
