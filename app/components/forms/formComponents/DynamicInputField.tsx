import React from "react";
import { FieldInputType, FormFieldInputOptionsConfig } from "@/models/types";
import InputForm from "./InputForm";

interface DynamicInputFieldProps {
	inputKey: string;
	inputType: FieldInputType;
	label: string;
	placeholder?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
	options?: FormFieldInputOptionsConfig[]; // solo para select
}

const DynamicInputField: React.FC<DynamicInputFieldProps> = ({
	inputKey,
	inputType,
	label,
	placeholder,
	value,
	onChange,
	options = [],
}) => {
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
					className={`
					block w-full text-sm rounded-sm
					bg-[var(--color-light)] border
					border-[var(--color-border)]
					text-[var(--color-text)] placeholder-[var(--color-muted)]
					focus:outline-none focus:ring-2
					focus:ring-[var(--color-main)] focus:border-[var(--color-main)]
					px-3 py-2
					dark:bg-gray-700 dark:border-gray-600
					dark:text-white dark:placeholder-gray-400
					dark:focus:ring-[var(--color-main-light)] dark:focus:border-[var(--color-main-light)]
				`}
				>
					<option value="">Seleccionar...</option>
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</div>
		);
	}

	return (
		<InputForm
			inputKey={inputKey}
			type={inputType}
			placeholder={placeholder || label}
			value={value}
			onChange={onChange}
		>
			{label}
		</InputForm>
	);
};

export default DynamicInputField;
