import { useEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";

interface UseEntityTableParams<F> {
	fetchAction: any; // Redux thunk
	setPageAction: (page: number) => any;
	setPageSizeAction: (size: number) => any;
	selector: (state: any) => F;
	defaultSortField?: string;
	defaultSortOrder?: "ASC" | "DESC";
}

interface EntityFetchParams {
	page: number;
	size: number;
	search?: string;
	sortField?: string;
	sortOrder?: "ASC" | "DESC";
}

function dispatchEntityFetch(
	dispatch: any,
	fetchAction: any,
	params: EntityFetchParams
) {
	dispatch(
		fetchAction({
			page: params.page,
			size: params.size,
			search: params.search ?? "",
			sortField: params.sortField ?? "fecha",
			sortOrder: params.sortOrder ?? "DESC",
		})
	);
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

	// Fetch inicial y en cambios de orden/tamaño/página
	useEffect(() => {
		dispatchEntityFetch(dispatch, fetchAction, {
			page: state.page,
			size: state.pageSize,
			search,
			sortField,
			sortOrder,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, state.page, state.pageSize, sortField, sortOrder]);

	const handleSearch = useCallback(() => {
		dispatch(setPageAction(1));
		dispatchEntityFetch(dispatch, fetchAction, {
			page: 1,
			size: state.pageSize,
			search,
			sortField,
			sortOrder,
		});
	}, [dispatch, fetchAction, search, sortField, sortOrder, state.pageSize, setPageAction]);

	const handlePageChange = useCallback(
		(page: number) => {
			dispatch(setPageAction(page));
			dispatchEntityFetch(dispatch, fetchAction, {
				page,
				size: state.pageSize,
				search,
				sortField,
				sortOrder,
			});
		},
		[dispatch, fetchAction, search, sortField, sortOrder, state.pageSize, setPageAction]
	);

	const handlePageSizeChange = useCallback(
		(size: number) => {
			dispatch(setPageSizeAction(size));
			dispatchEntityFetch(dispatch, fetchAction, {
				page: 1,
				size,
				search,
				sortField,
				sortOrder,
			});
		},
		[dispatch, fetchAction, search, sortField, sortOrder, setPageSizeAction]
	);

	const handleSort = useCallback(
		(field: string) => {
			const newOrder = sortField === field && sortOrder === "ASC" ? "DESC" : "ASC";
			setSortField(field);
			setSortOrder(newOrder);
			dispatchEntityFetch(dispatch, fetchAction, {
				page: state.page,
				size: state.pageSize,
				search,
				sortField: field,
				sortOrder: newOrder,
			});
		},
		[dispatch, fetchAction, search, sortField, sortOrder, state.page, state.pageSize]
	);

	return {
		...state,
		search,
		setSearch,
		handleSearch,
		handlePageChange,
		handlePageSizeChange,
		handleSort,
		sortField,
		sortOrder,
	};
};
