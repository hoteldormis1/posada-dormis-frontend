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
}

const TableHeader = ({
	title,
	search,
	onSearchChange,
	onSearchSubmit,
}: TableHeaderProps) => {
	return (
		<div className="w-full flex flex-col sm:flex-row justify-between items-center mb-2 ">
			{title && <h2 className={fuenteDeTitulo}>{title}</h2>}
			<div className="flex gap-2 items-center">
				<div className="mb-3 w-full sm:w-64 relative">
					<InputForm
						InputForm="search"
						placeholder="Buscar..."
						value={search}
						onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && onSearchSubmit && onSearchSubmit(e)}
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
			</div>
		</div>
	);
};


export default TableHeader;