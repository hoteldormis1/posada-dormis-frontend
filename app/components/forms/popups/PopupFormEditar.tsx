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
			<div className="pt-4 space-y-6">
				{children(formData, handleChange)}

				<div className="flex justify-end gap-3">
					<button
						onClick={onClose}
						className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
					>
						Cancelar
					</button>
					<button
						onClick={handleSubmit}
						disabled={hasErrors}
						className={`px-4 py-2 text-white rounded-md ${
							hasErrors 
								? 'bg-gray-400 cursor-not-allowed' 
								: 'bg-[var(--color-main)] hover:bg-green-700'
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
