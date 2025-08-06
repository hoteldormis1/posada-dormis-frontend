"use client";

import React from "react";
import { Paginator, PopupFormEditar, DynamicInputField } from "@/components";
import { FieldInputType } from "@/models/types";

interface TableButtonsProps<T> {
	showPagination: boolean;
	currentPage: number;
	pageSize: number;
	totalItems?: number;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (size: number) => void;

	showEditPopup: boolean;
	selectedRow: T | null;
	formInputs: Array<{
		key: string;
		type: FieldInputType;
		label: string;
		options?: Array<{ value: string; label: string }>;
	}>;
	formData: Record<string, string>;
	handleFormChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => void;
	getUpdatedRow: () => T | null;
	handleSaveEdit: (updated: T) => void;
	setShowEditPopup: (show: boolean) => void;
}

const TableButtons = <T extends { id: string }>({
	showPagination,
	currentPage,
	pageSize,
	totalItems,
	onPageChange,
	onPageSizeChange,
	showEditPopup,
	selectedRow,
	formInputs,
	formData,
	handleFormChange,
	getUpdatedRow,
	handleSaveEdit,
	setShowEditPopup,
}: TableButtonsProps<T>) => {
	return (
		<>
			{showPagination && (
				<Paginator
					currentPage={currentPage}
					totalPages={Math.ceil((totalItems ?? 0) / pageSize)}
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
									inputType={input.type}
									label={input.label}
									placeholder={input.label}
									value={formData[input.key] || ""}
									onChange={(e) => handleFormChange(e)}
									options={input.type === "select" ? input.options : undefined}
								/>
							))}
						</div>
					)}
				</PopupFormEditar>
			)}
		</>
	);
};

export default TableButtons;
