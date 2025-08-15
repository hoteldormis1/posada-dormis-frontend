"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import type { RootState } from "@/lib/store/store";
import type { UnknownAction } from "@reduxjs/toolkit";
import { SortOrder } from "@/models/types";

interface EntityFetchParams {
	page: number;
	size: number;
	search?: string;
	sortField?: string;
	sortOrder?: SortOrder.asc | SortOrder.desc;
}

interface UseEntityTableParams<F> {
	fetchAction: (params: EntityFetchParams) => unknown; // thunk
	setPageAction: (page: number) => UnknownAction;
	setPageSizeAction: (size: number) => UnknownAction;
	selector: (state: RootState) => F;
	defaultSortField?: string;
	defaultSortOrder?: SortOrder.asc | SortOrder.desc;
}

export const useEntityTable = <
	F extends {
		page: number;
		pageSize: number;
		total: number;
		datos: unknown[];
		loading: boolean;
		error: string | null;
	}
>({
	fetchAction,
	setPageAction,
	setPageSizeAction,
	selector,
	defaultSortField = "fecha",
	defaultSortOrder = SortOrder.desc,
}: UseEntityTableParams<F>) => {
	const dispatch = useAppDispatch();
	const state = useAppSelector(selector);

	const [search, setSearch] = useState("");
	const [sortField, setSortField] = useState(defaultSortField);
	const [sortOrder, setSortOrder] = useState<SortOrder.asc | SortOrder.desc>(defaultSortOrder);

	const fetchData = useCallback(
		(params: Partial<EntityFetchParams> = {}) => {
			dispatch(
				fetchAction({
					page: params.page ?? state.page,
					size: params.size ?? state.pageSize,
					search: params.search ?? search,
					sortField: params.sortField ?? sortField,
					sortOrder: params.sortOrder ?? sortOrder,
				}) as UnknownAction
			);
		},
		[
			dispatch,
			fetchAction,
			search,
			sortField,
			sortOrder,
			state.page,
			state.pageSize,
		]
	);

	//fetchData adentro hace que cada cambio en el search se ejecute fetchData, evitar
	useEffect(() => {
		fetchData();
	}, []);

	const handleSearch = useCallback(() => {
		dispatch(setPageAction(1));
		fetchData({ page: 1 });
	}, [dispatch, setPageAction, fetchData]);

	const handlePageChange = useCallback(
		(page: number) => {
			dispatch(setPageAction(page));
			fetchData({ page });
		},
		[dispatch, setPageAction, fetchData]
	);

	const handlePageSizeChange = useCallback(
		(size: number) => {
			dispatch(setPageSizeAction(size));
			dispatch(setPageAction(1));
			fetchData({ size, page: 1 });
		},
		[dispatch, setPageSizeAction, setPageAction, fetchData]
	);

	const handleSort = useCallback(
		(field: string) => {
			const newOrder = field === sortField && sortOrder === SortOrder.asc? SortOrder.desc : SortOrder.asc ;
			setSortField(field);
			setSortOrder(newOrder);
			dispatch(setPageAction(1));
			fetchData({ sortField: field, sortOrder: newOrder, page: 1 });
		},
		[dispatch, fetchData, setPageAction, sortField, sortOrder]
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
		fetchData
	};
};
