"use client";

import React from "react";
import { FaSearch, FaTrash } from "react-icons/fa";
import InputForm from "@/components/forms/formComponents/InputForm";
import { fuenteDeTitulo } from "@/styles/global-styles";

interface TableHeaderProps {
	title?: string;
	search: string;
	onSearchChange?: (value: string) => void;
	onSearchSubmit?: (e?: React.FormEvent | React.KeyboardEvent) => void;
	setShowAddPopup?: (show: boolean) => void;
	showFormActions: boolean;
	showActions?: { create: boolean; delete: boolean; edit: boolean };
	selectedCount?: number;
	onDeleteSelected?: () => void;
	deletingMany?: boolean;
}

const TableHeader = ({
	title,
	search,
	onSearchChange,
	onSearchSubmit,
	setShowAddPopup,
	showFormActions,
	showActions,
	selectedCount = 0,
	onDeleteSelected,
	deletingMany = false,
}: TableHeaderProps) => {
	const hasBulkAction = selectedCount > 0 && onDeleteSelected;

	return (
		<div className="w-full flex flex-col gap-3 mb-4">
			{/* Fila principal: título + búsqueda + agregar */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
							className="absolute right-3 top-3/5 -translate-y-1/2 text-admin-dim hover:text-admin-accent focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 rounded"
						>
							<FaSearch className="w-4 h-4 cursor-pointer" />
						</button>
					</div>

					{showFormActions && showActions?.create && (
						<button
							onClick={() => setShowAddPopup?.(true)}
							className="cursor-pointer admin-button-primary px-4 py-2 rounded-lg transition-all text-sm w-full sm:w-auto font-semibold"
						>
							+ Agregar
						</button>
					)}
				</div>
			</div>

			{/* Barra de selección múltiple */}
			{hasBulkAction && (
				<div className="flex items-center justify-between gap-3 rounded-xl border border-red-400/25 bg-red-500/8 px-4 py-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
					<span className="text-[14px] font-medium text-red-300/90">
						{selectedCount} {selectedCount === 1 ? "fila seleccionada" : "filas seleccionadas"}
					</span>
					<button
						onClick={onDeleteSelected}
						disabled={deletingMany}
						className="inline-flex items-center gap-2 rounded-lg border border-red-400/35 bg-red-500/15 px-4 py-1.5 text-[14px] font-semibold text-red-300 transition-all hover:bg-red-500/25 hover:border-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						<FaTrash className="text-xs" />
						{deletingMany ? "Eliminando…" : "Eliminar seleccionados"}
					</button>
				</div>
			)}
		</div>
	);
};

export default TableHeader;
