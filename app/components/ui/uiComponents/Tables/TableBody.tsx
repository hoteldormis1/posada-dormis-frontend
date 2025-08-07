"use client";

import React from "react";
import { flexRender, Table } from "@tanstack/react-table";
import { SortOrder } from "@/models/types";

interface TableBodyProps<T> {
	table: Table<T>;
	columnsLength: number;
	showFormActions: boolean;
	sortField?: string;
	sortOrder?: SortOrder;
	handleHeaderClick: (key: string) => void;
}

const TableBody = <T,>({
	table,
	columnsLength,
	showFormActions,
	sortField,
	sortOrder,
	handleHeaderClick,
}: TableBodyProps<T>) => {
	return (
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
										{isActive && (sortOrder === SortOrder.asc ? " 🔼" : " 🔽")}
									</th>
								);
							})}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.length > 0 ? (
						table.getRowModel().rows.map((row) => (
							<tr key={row.id} className="hover:bg-gray-100 text-fontSecondary h-[20px]">
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
								colSpan={columnsLength + (showFormActions ? 1 : 0)}
								className="px-4 py-4 text-center text-gray-500 italic border-b"
							>
								No hay resultados para mostrar
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};

export default TableBody;