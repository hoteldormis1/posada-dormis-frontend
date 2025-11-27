"use client";

import { ReactNode, useEffect, useState } from "react";
import {PopupContainer} from "@/components/index";

type PopupFormEditarProps<T> = {
	isOpen: boolean;
	title?: string;
	initialData: T;
	onClose: () => void;
	onSave: (data: T) => void;
	children: (
		formData: T,
		handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
	) => ReactNode;
	// Nuevo: validación
	validateForm?: () => boolean;
	hasErrors?: boolean;
};

function PopupFormEditar<T>({
	isOpen,
	title = "Editar",
	initialData,
	onClose,
	onSave,
	children,
	validateForm, // Nuevo
	hasErrors = false, // Nuevo
}: PopupFormEditarProps<T>) {
	const [formData, setFormData] = useState<T>(initialData);

	useEffect(() => {
		if (isOpen) setFormData(initialData);
	}, [initialData, isOpen]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = () => {
		// Validar antes de guardar
		if (validateForm && !validateForm()) {
			return; // No continuar si la validación falla
		}
		onSave(formData);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<PopupContainer onClose={onClose} title={title}>
			<div className="relative h-full flex flex-col pt-4 space-y-6">
				<div className="flex-1 overflow-auto pr-1 pb-20">
					{children(formData, handleChange)}
				</div>

				<div className="absolute bottom-4 right-4 flex justify-end gap-3">
					<button
						type="button"
						onClick={onClose}
						className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium shadow-sm"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={handleSubmit}
						disabled={hasErrors}
						className={`px-5 py-2.5 text-white rounded-lg font-medium shadow-md transition-all duration-200 ${
							hasErrors 
								? 'bg-gray-400 cursor-not-allowed opacity-60' 
								: 'bg-[var(--color-main)] hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
						}`}
					>
						Guardar cambios
					</button>
				</div>
			</div>
		</PopupContainer>
	);
}

export default PopupFormEditar;
