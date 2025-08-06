"use client";

import React from "react";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
} from "@tanstack/react-table";
import { FaCheck, FaTimes, FaEdit } from "react-icons/fa";
import { FormFieldInputConfig, SortOrder } from "@/models/types";
import { useEditPopup } from "@/hooks/useEditPopup";
import { TableBody, TableHeader, TableButtons } from "../../../index";

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
	onCreate?: (item: T) => void;
	inputOptions?: FormFieldInputConfig[];
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
	onSort,
	sortField,
	sortOrder,
	inputOptions, //para definir lons inputs del formulario. importante y viene de haber llamado tableComponent
}: TableComponentProps<T>) => {
	const {
		showEditPopup,
		setShowEditPopup,
		selectedRow,
		formData,
		handleEditClick,
		handleFormChange,
		getUpdatedRow,
		formInputs,
	} = useEditPopup<T>(inputOptions);

	const handleSaveEdit = (updated: T) => {
		console.log("Guardar cambios:", updated);
	};

	const tableColumns = React.useMemo<ColumnDef<T>[]>(() => {
		const baseCols = columns.map((col) => ({
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
		}));
		if (showFormActions) {
			baseCols.push({
				accessorKey: "actions",
				header: "Acciones",
				cell: ({ row }) => (
					<button
						onClick={() => handleEditClick(row.original.id, data)}
						className="text-blue-500 hover:text-blue-700"
					>
						<FaEdit className="text-black text-xs" />
					</button>
				),
			});
		}
		return baseCols;
	}, [columns, showFormActions, data, handleEditClick]);

	const table = useReactTable({
		data,
		columns: tableColumns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		pageCount: Math.ceil((totalItems ?? data.length) / pageSize),
	});

	const handleHeaderClick = (key: string) => {
		if (!onSort) return;
		const newOrder = sortField === key && sortOrder === "ASC" ? "DESC" : "ASC";
		onSort(key, newOrder);
	};

	return (
		<div className="flex flex-col mx-auto w-full max-w-[1000px]">
			<TableHeader
				title={title}
				search={search}
				onSearchChange={onSearchChange}
				onSearchSubmit={onSearchSubmit}
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
				showPagination={showPagination}
				currentPage={currentPage}
				pageSize={pageSize}
				totalItems={totalItems}
				onPageChange={onPageChange}
				onPageSizeChange={onPageSizeChange}
				showEditPopup={showEditPopup}
				selectedRow={selectedRow}
				formInputs={formInputs}
				formData={formData}
				handleFormChange={handleFormChange}
				getUpdatedRow={getUpdatedRow}
				handleSaveEdit={handleSaveEdit}
				setShowEditPopup={setShowEditPopup}
			/>
		</div>
	);
};

export default TableComponent;
