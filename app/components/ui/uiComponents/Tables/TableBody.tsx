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
			<table className="min-w-full text-left text-sm bg-transparent text-admin-primary">
				<thead className="bg-black/20 text-admin-muted">
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								const colKey = header.column.id;
								const isActive = sortField === colKey;
								const canSort = header.column.getCanSort();
								return (
									<th
										key={header.id}
										onClick={() => canSort && handleHeaderClick(colKey)}
									className={`py-3.5 px-4 border-b border-white/10 select-none text-center text-[12px] uppercase tracking-[0.05em] font-semibold ${
										canSort ? "cursor-pointer" : "cursor-default"
									}`}
									>
										{flexRender(header.column.columnDef.header, header.getContext())}
										{canSort && isActive && (sortOrder === SortOrder.asc ? " 🔼" : " 🔽")}
									</th>
								);
							})}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.length > 0 ? (
						table.getRowModel().rows.map((row) => (
							<tr key={row.id} className="hover:bg-white/6 text-admin-primary h-[20px] border-b border-white/6">
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="px-4 py-3 text-center text-[15px]">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))
					) : (
						<tr>
							<td
								colSpan={columnsLength + (showFormActions ? 1 : 0)}
								className="px-4 py-5 text-center text-[15px] text-admin-muted italic"
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