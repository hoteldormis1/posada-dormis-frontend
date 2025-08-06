"use client";

import React from "react";
import {
	ColumnDef,
	useReactTable,
	getCoreRowModel,
	flexRender,
} from "@tanstack/react-table";
import { FaCheck, FaTimes, FaEdit, FaSearch, FaPlus } from "react-icons/fa";
import { fuenteDeTitulo } from "@/styles/global-styles";
import { SortOrder } from "@/models/types";
import InputForm from "@/components/forms/formComponents/InputForm";
import {
	Paginator,
	PopupFormEditar,
	DynamicInputField,
} from "@/components/index";
import { useEditPopup } from "@/hooks/useEditPopup";

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
	defaultNewItem: T;
	onCreate?: (item: T) => void;
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
	onCreate,
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
	} = useEditPopup<T>([
		{ key: "nombre", type: "text", label: "Nombre" },
		{
			key: "estado",
			type: "select",
			label: "Estado de habitación",
			options: [{value: "test1", label: "test1"}],
		},
		{
			key: "tipo",
			type: "select",
			label: "Tipo de habitación",
			options: [{value: "test1", label: "test1"}],
		},
	]);

	// const {
	//   showAddPopup,
	//   setShowAddPopup,
	//   formData: addFormData,
	//   handleFormChange: handleAddChange,
	//   getNewItem,
	//   formInputs: addFormInputs,
	//   resetForm,
	// } = useAddPopup<T>([]);

	const handleSaveEdit = (updated: T) => {
		console.log("Guardar cambios:", updated);
	};

	// const handleCreate = (item: T) => {
	//   if (onCreate) onCreate(item);
	//   resetForm();
	// };

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
				cell: (cell) => (
					<button
						onClick={() => handleEditClick(cell.row.original.id, data)}
						className="text-blue-500 hover:text-blue-700"
					>
						<FaEdit className="text-black text-xs" />
					</button>
				),
			});
		}
		return baseCols;
	}, [columns, showFormActions, , data, handleEditClick]);

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
			<div className="w-full flex flex-col sm:flex-row justify-between items-center mb-2 ">
				{title && <h2 className={fuenteDeTitulo}>{title}</h2>}
				<div className="flex gap-2 items-center">
					<div className="mb-3 w-full sm:w-64 relative">
						<InputForm
							InputForm="search"
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
							className="absolute right-3 top-5/8 -translate-y-1/2 text-gray-400 hover:text-main focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-1 rounded"
						>
							<FaSearch className="w-4 h-4" />
						</button>
					</div>
					{/* <button
            onClick={() => setShowAddPopup(true)}
            className="flex gap-2 items-center px-4 py-2 bg-main text-white rounded hover:bg-green-700"
          >
            <FaPlus /> Agregar
          </button> */}
				</div>
			</div>

			<div className="overflow-x-auto h-80 md:h-114 border border-gray-200 bg-gray-200">
				<table className="min-w-full text-left text-xs bg-white">
					<thead className="bg-main text-white">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									const colKey = header.column.id;
									const isActive = sortField === colKey;
									return (
										<th
											key={header.id}
											onClick={() => handleHeaderClick(colKey)}
											className="py-2 px-4 border-b cursor-pointer select-none text-center"
										>
											{flexRender(header.column.columnDef.header, header.getContext())}
											{isActive && (sortOrder === "ASC" ? " 🔼" : " 🔽")}
										</th>
									);
								})}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									className="hover:bg-gray-100 text-fontSecondary h-[20px]"
								>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="px-4 py-2 border-b text-center">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={columns.length + (showFormActions ? 1 : 0)}
									className="px-4 py-4 text-center text-gray-500 italic border-b"
								>
									No hay resultados para mostrar
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{showPagination && (
				<Paginator
					currentPage={currentPage}
					totalPages={Math.ceil((totalItems ?? data.length) / pageSize)}
					onPageChange={(p) => onPageChange && onPageChange(p)}
					pageSize={pageSize}
					onPageSizeChange={(s) => onPageSizeChange && onPageSizeChange(s)}
				/>
			)}

			{showEditPopup && selectedRow && (
				<PopupFormEditar
					isOpen={showEditPopup}
					initialData={selectedRow}
					onClose={() => setShowEditPopup(false)}
					onSave={() => {
						const updated = getUpdatedRow();
						if (updated) handleSaveEdit(updated);
					}}
					title="Editar habitación"
				>
					{() => (
						<div className="space-y-4 pt-4">
							{formInputs.map((input) => (
								<DynamicInputField
									key={input.key}
									inputKey={input.key}
									InputForm={input.type}
									label={input.label}
									placeholder={input.label}
									value={formData[input.key] || ""}
									onChange={(e) => handleFormChange(e)}
									options={
										input.type === "select"
											? input.options
											: undefined
									}
								/>
							))}
						</div>
					)}
				</PopupFormEditar>
			)}

			{/* {showAddPopup && (
        <PopupFormAgregar
          isOpen={showAddPopup}
          defaultData={selectedRow}
          onClose={() => setShowAddPopup(false)}
          onSave={() => {
            const newItem = getNewItem();
            handleCreate(newItem);
            setShowAddPopup(false);
          }}
          title="Agregar habitación"
        >
          {() => (
            <div className="space-y-4 pt-4">
              {addFormInputs.map((input) => (
                <InputForm
                  key={input.key}
                  inputKey={input.key}
                  InputForm={input.type}
                  placeholder={input.label}
                  value={addFormData[input.key] || ""}
                  onChange={handleAddChange}
                >
                  {input.label}
                </InputForm>
              ))}
            </div>
          )}
        </PopupFormAgregar>
      )} */}
		</div>
	);
};

export default TableComponent;
