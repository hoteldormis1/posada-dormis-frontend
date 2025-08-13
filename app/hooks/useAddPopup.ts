import { useState, useMemo } from "react";
import { z } from "zod";
import { useHuespedFormLogic } from "./useHuespedFormLogic";

export function useAddPopup<T extends Record<string, unknown>>(
	initialValues: Partial<T>,
	numericFields: string[] = [],
	schema?: z.ZodSchema<Record<string, unknown>>
) {
	if (!initialValues || typeof initialValues !== "object") {
		throw new Error("❌ useAddPopup: initialValues debe ser un objeto no nulo y definido");
	}

	const [showAddPopup, setShowAddPopup] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const [formData, setFormData] = useState<Record<string, string>>(() => {
		return Object.entries(initialValues).reduce((acc, [k, v]) => {
			acc[k] = String(v ?? "");
			return acc;
		}, {} as Record<string, string>);
	});

	const handleFormChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		
		// Limpiar error del campo cuando el usuario empiece a escribir
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	// Integrar la lógica de selección de huésped
	const huespedLogic = useHuespedFormLogic(formData, handleFormChange);

	const validateForm = (): boolean => {
		if (!schema) return true;

		try {
			schema.parse(formData);
			setErrors({});
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errorMap: Record<string, string> = {};
				error.issues.forEach((err) => {
					const field = err.path.join(".");
					errorMap[field] = err.message;
				});
				setErrors(errorMap);
			}
			return false;
		}
	};

	const getNewItem = () => {
		return Object.fromEntries(
			Object.entries(formData).map(([k, v]) =>
				numericFields.includes(k) ? [k, Number(v)] : [k, v]
			)
		) as T;
	};

	const formInputs = useMemo(() => {
		return Object.keys(initialValues).map((key) => ({
			key,
			label: key[0].toUpperCase() + key.slice(1),
			type: numericFields.includes(key) ? "number" : "text",
		}));
	}, [initialValues, numericFields]);

	const resetForm = () => {
		setFormData(
			Object.entries(initialValues).reduce((acc, [k, v]) => {
				acc[k] = String(v ?? "");
				return acc;
			}, {} as Record<string, string>)
		);
		setErrors({});
	};

	return {
		showAddPopup,
		setShowAddPopup,
		formData,
		handleFormChange,
		getNewItem,
		formInputs,
		resetForm,
		errors,
		validateForm,
		// Exportar la lógica de huésped
		huespedLogic,
	};
}
