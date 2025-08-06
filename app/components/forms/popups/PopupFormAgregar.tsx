"use client";

import { ReactNode, useState } from "react";
import { PopupContainer } from "@/components/index";

type PopupFormAgregarProps<T> = {
	isOpen: boolean;
	title?: string;
	defaultData: T;
	onClose: () => void;
	onSave: (data: T) => void;
	children: (
		formData: T,
		handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
	) => ReactNode;
};

/**
 * Componente reutilizable para formulario de creación.
 *
 * @template T - Tipo del objeto que se va a crear.
 * @param {PopupFormAgregarProps<T>} props - Propiedades del componente.
 * @returns {JSX.Element | null}
 */

function PopupFormAgregar<T>({
	isOpen,
	title = "Agregar",
	defaultData,
	onClose,
	onSave,
	children,
}: PopupFormAgregarProps<T>) {
	const [formData, setFormData] = useState<T>(defaultData);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = () => {
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
						className="px-4 py-2 bg-[var(--color-main)] text-white rounded-md hover:bg-green-700"
					>
						Agregar
					</button>
				</div>
			</div>
		</PopupContainer>
	);
}

export default PopupFormAgregar;
