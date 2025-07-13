"use client";

import React from "react";
import { FaCheck, FaTimes, FaEdit, FaPlus } from "react-icons/fa";
import Button from "../Button";

type TableColumn = {
	header: string;
	key: string;
};

interface TableComponentProps<T> {
	columns: TableColumn[];
	data: T[];
	onAdd: () => void;
	onEdit: (id: string) => void;
	title?: string;
	showFormActions?: boolean;
}

// 👇 Usamos genéricos con restricción mínima: T debe tener un `id: string`
const TableComponent = <T extends { id: string }>({
	columns,
	data,
	onEdit,
	onAdd,
	title,
	showFormActions,
}: TableComponentProps<T>) => {
	return (
		<div className="flex flex-col mx-auto">
			<div>
				{showFormActions && (
					<div className="flex justify-end py-4">
						<Button
							onClick={onAdd}
							className="text-white bg-main hover:bg-tertiary text-fontSecondary"
							icon={<FaPlus className="text-white text-lg" />}
						>
							Agregar Nuevo
						</Button>
					</div>
				)}

				<h2 className="py-4">{title}</h2>
				<div className="flex-grow overflow-auto">
					<table className="min-w-full h-full bg-white border border-gray-200">
						<thead>
							<tr>
								{columns.map((column) => (
									<th
										key={column.key}
										className="py-4 px-4 border-b bg-secondary text-black"
									>
										{column.header}
									</th>
								))}
								{showFormActions && (
									<th className="py-4 px-4 border-b bg-secondary text-black">
										Acciones
									</th>
								)}
							</tr>
						</thead>
						<tbody>
							{data.map((item) => (
								<tr key={item.id} className="hover:bg-gray-100 text-fontSecondary">
									{columns.map((column) => (
										<td key={column.key} className="py-4 px-4 border-b text-center">
											{typeof item[column.key as keyof T] === "boolean" ? (
												item[column.key as keyof T] ? (
													<FaCheck className="text-green-600 text-base mx-auto" />
												) : (
													<FaTimes className="text-red-600 text-base mx-auto" />
												)
											) : (
												(item[column.key as keyof T] as string | number)
											)}
										</td>
									))}
									{showFormActions && (
										<td className="py-2 px-4 border-b text-center">
											<button
												onClick={() => onEdit(item.id)}
												className="text-blue-500 hover:text-blue-700 mr-2"
											>
												<FaEdit className="text-black text-base" />
											</button>
										</td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default TableComponent;
