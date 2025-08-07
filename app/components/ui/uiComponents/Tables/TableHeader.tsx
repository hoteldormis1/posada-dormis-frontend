"use client";

import React from "react";
import { FaSearch } from "react-icons/fa";
import InputForm from "@/components/forms/formComponents/InputForm";
import { fuenteDeTitulo } from "@/styles/global-styles";

interface TableHeaderProps {
	title?: string;
	search: string;
	onSearchChange?: (value: string) => void;
	onSearchSubmit?: (e?: React.FormEvent | React.KeyboardEvent) => void;
	setShowAddPopup?: (show: boolean) => void;
	showFormActions: boolean;
}

const TableHeader = ({
	title,
	search,
	onSearchChange,
	onSearchSubmit,
	setShowAddPopup,
	showFormActions
}: TableHeaderProps) => {
	return (
		<div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
			{title && <h2 className={fuenteDeTitulo}>{title}</h2>}

			<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
				<div className="relative w-full sm:w-64">
					<InputForm
						InputForm="search"
						placeholder="Buscar..."
						value={search}
						onChange={(e) => onSearchChange?.(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && onSearchSubmit?.(e)}
					/>
					<button
						type="button"
						onClick={onSearchSubmit}
						aria-label="Buscar"
						className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-main focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-1 rounded"
					>
						<FaSearch className="w-4 h-4" />
					</button>
				</div>

				{showFormActions && <button
					onClick={() => setShowAddPopup?.(true)}
					className="cursor-pointer bg-main text-white px-4 py-2 rounded hover:bg-green-700 transition-all text-sm w-full sm:w-auto"
				>
					+ Agregar
				</button>}
			</div>
		</div>
	);
};

export default TableHeader;
