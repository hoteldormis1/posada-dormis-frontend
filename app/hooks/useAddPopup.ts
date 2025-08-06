import { useState, useMemo } from "react";

export function useAddPopup<T extends Record<string, unknown>>(
	initialValues: Partial<T>,
	numericFields: string[] = []
) {
	if (!initialValues || typeof initialValues !== "object") {
		throw new Error("❌ useAddPopup: initialValues debe ser un objeto no nulo y definido");
	}

	const [showAddPopup, setShowAddPopup] = useState(false);

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
	};

	return {
		showAddPopup,
		setShowAddPopup,
		formData,
		handleFormChange,
		getNewItem,
		formInputs,
		resetForm,
	};
}
