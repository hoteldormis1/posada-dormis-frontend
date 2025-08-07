"use client";

import React, { useMemo } from "react";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
} from "@tanstack/react-table";
import { FaCheck, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
import { FormFieldInputConfig, SortOrder } from "@/models/types";
import { useEditPopup } from "@/hooks/useEditPopup";
import { useAddPopup } from "@/hooks/useAddPopup"; // ✅ import correcto
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
	onSaveEdit: (formData: Record<string, unknown>, selectedRow: T | null) => void;
	onSaveAdd: (formData: Record<string, unknown>) => void;
	onSaveDelete: (id: string) => void;
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
	onSaveEdit,
	onSaveAdd,
	onSaveDelete,
	onSort,
	sortField,
	sortOrder,
	inputOptions = [],
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
		formInputs,
	} = useEditPopup<T>(inputOptions);

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
		// formInputs: formInputsAdd,
		resetForm,
	} = useAddPopup<T>(initialValues, numericFields);

	const handleSaveEdit = () => {
		onSaveEdit(formData, selectedRow);
	};

	const handleSaveAdd = () => {
		const newItem = getNewItem();
		onSaveAdd(newItem);
		resetForm();
		setShowAddPopup(false);
	};

	// === Columnas tabla ===
	const tableColumns = useMemo<ColumnDef<T>[]>(() => {
		const baseCols: ColumnDef<T>[] = columns.map(
			(col): ColumnDef<T> => ({
				accessorKey: col.key,
				header: col.header,
				cell: (cell) => {
					const value = cell.getValue();
					if (typeof value === "boolean") {
						return value ? (
							<FaCheck className="text-green-600 text-xs mx-auto" />
						) : (
							<FaTimes className="text-red-600 text-xs mx-auto" />
						);
					}
					return String(value ?? "—");
				},
			})
		);

		const handleDelete = (id: string) => {
			onSaveDelete(id);
		};
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
				showAddPopup={showAddPopup}
				setShowAddPopup={setShowAddPopup}
				formDataAdd={formDataAdd}
				handleFormChangeAdd={handleFormChangeAdd}
				handleSaveAdd={handleSaveAdd}
			/>
		</div>
	);
};

export default TableComponent;
