"use client";

import React from "react";
import { FieldInputType, FormFieldInputOptionsConfig } from "@/models/types";
import InputForm from "./InputForm";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DynamicInputFieldProps {
	inputKey: string;
	inputType: FieldInputType;
	label: string;
	placeholder?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
	options?: FormFieldInputOptionsConfig[]; // solo para select
	error?: string; // Nuevo: error de validación
}

const DynamicInputField: React.FC<DynamicInputFieldProps> = ({
	inputKey,
	inputType,
	label,
	placeholder,
	value,
	onChange,
	options = [],
	error, // Nuevo
}) => {
	const inputClassName = `
		block w-full text-sm rounded-sm
		bg-[var(--color-light)] border
		${error 
			? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
			: 'border-[var(--color-border)] focus:ring-[var(--color-main)] focus:border-[var(--color-main)]'
		}
		text-[var(--color-text)] placeholder-[var(--color-muted)]
		focus:outline-none focus:ring-2
		px-3 py-2
		dark:bg-gray-700 dark:border-gray-600
		dark:text-white dark:placeholder-gray-400
		${error 
			? 'dark:focus:ring-red-500 dark:focus:border-red-500' 
			: 'dark:focus:ring-[var(--color-main-light)] dark:focus:border-[var(--color-main-light)]'
		}
	`;

	if (inputType === "select") {
		return (
			<div className="flex flex-col gap-1">
				<label
					htmlFor={inputKey}
					className="text-sm font-medium text-[var(--color-text)] dark:text-white"
				>
					{label}
				</label>
				<select
					id={inputKey}
					name={inputKey}
					value={value}
					onChange={onChange}
					className={inputClassName}
				>
					<option value="">Seleccionar...</option>
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
				{error && (
					<p className="text-red-500 text-xs mt-1">{error}</p>
				)}
			</div>
		);
	}

	if (inputType === "date") {
		// Convierte dd/mm/yyyy a Date
		const parseDate = (dateString: string): Date | null => {
			if (!dateString || dateString.length !== 10) return null;
			const [day, month, year] = dateString.split("/");
			const date = new Date(Number(year), Number(month) - 1, Number(day));
			return isNaN(date.getTime()) ? null : date;
		};

		// Convierte Date a dd/mm/yyyy
		const formatDate = (date: Date | null): string => {
			if (!date) return "";
			const day = date.getDate().toString().padStart(2, "0");
			const month = (date.getMonth() + 1).toString().padStart(2, "0");
			const year = date.getFullYear();
			return `${day}/${month}/${year}`;
		};

		// Evento para react-hook-form o tu handler onChange
		const handleDateChange = (date: Date | null) => {
			const formattedDate = formatDate(date);
			const syntheticEvent = {
				target: {
					name: inputKey,
					value: formattedDate,
				},
			} as React.ChangeEvent<HTMLInputElement>;
			onChange(syntheticEvent);
		};

		// Aquí llega el valor inicial de edición (dd/mm/yyyy) y lo transformamos a Date
		const selectedDate = parseDate(value);

		return (
			<div className="flex flex-col gap-1">
				<label
					htmlFor={inputKey}
					className="text-sm font-medium text-[var(--color-text)] dark:text-white"
				>
					{label}
				</label>
				<DatePicker
					selected={selectedDate}
					onChange={handleDateChange}
					dateFormat="dd/MM/yyyy"
					placeholderText="dd/mm/yyyy"
					className={inputClassName}
					wrapperClassName="w-full"
					showYearDropdown
					scrollableYearDropdown
					dropdownMode="select"
				/>
				{error && <p className="text-red-500 text-xs mt-1">{error}</p>}
			</div>
		);
	}

	return (
		<InputForm
			inputKey={inputKey}
			InputForm={inputType}
			placeholder={placeholder || label}
			value={value}
			onChange={onChange}
			error={error}
		>
			{label}
		</InputForm>
	);
};

export default DynamicInputField;
