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
	showActions?: { create: boolean; delete: boolean; edit: boolean };
}

const TableBody = <T,>({
	table,
	columnsLength,
	showFormActions,
	sortField,
	sortOrder,
	handleHeaderClick
}: TableBodyProps<T>) => {
	return (
		<div className="overflow-x-auto h-80 md:h-114 border border-white/12 bg-white/3 rounded-2xl">
			<table className="min-w-full text-left text-xs bg-transparent">
				<thead className="bg-black/20 text-emerald-100/75">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								const colKey = header.column.id;
								const isActive = sortField === colKey;
								return (
									<th
										key={header.id}
										onClick={() => handleHeaderClick(colKey)}
										className="py-3 px-4 border-b border-white/10 cursor-pointer select-none text-center text-[11px] uppercase tracking-[0.05em] font-semibold"
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
							<tr key={row.id} className="hover:bg-white/6 text-white/80 h-[20px] border-b border-white/6">
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="px-4 py-2 text-center">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))
					) : (
						<tr>
							<td
								colSpan={columnsLength + (showFormActions ? 1 : 0)}
								className="px-4 py-4 text-center text-emerald-100/55 italic"
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