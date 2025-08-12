"use client";

import { useState, forwardRef, ForwardedRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface InputTypeProps extends React.InputHTMLAttributes<HTMLInputElement> {
	inputKey?: string;
	InputForm?: string;
	placeholder?: string;
	labelStyles?: string;
	children?: React.ReactNode;
	error?: string | null;
	disabled?: boolean;
	required?: boolean;
}

const InputTypeComponent = (
	{
		inputKey = "",
		InputForm = "text",
		placeholder = "",
		labelStyles = "",
		children,
		error = null,
		disabled = false,
		required = false,
		...rest
	}: InputTypeProps,
	ref: ForwardedRef<HTMLInputElement>
) => {
	const [show, setShow] = useState(false);

	const type =
		InputForm === "password" ? (show ? "text" : "password") : InputForm;

	return (
		<div className="w-full">
			<label
				htmlFor={inputKey}
				className={`block mb-2 text-sm font-medium text-gray-900 ${labelStyles}`}
			>
				{children}
			</label>

			<div className="relative">
				<input
					id={inputKey}
					name={inputKey}
					ref={ref}
					type={type}
					placeholder={placeholder}
					disabled={disabled}
					required={required}
					className={`
						block w-full text-sm rounded-sm
						bg-[var(--color-light)] border
						${error ? "border-[var(--color-danger)]" : "border-[var(--color-border)]"}
						placeholder-[var(--color-muted)] text-[var(--color-text)]
						focus:outline-none
						focus:ring-2
						${
							error
								? "focus:ring-[var(--color-danger)] focus:border-[var(--color-danger)]"
								: "focus:ring-[var(--color-main)] focus:border-[var(--color-main)]"
						}
						px-4 py-2
						dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-[var(--color-main-light)] dark:focus:border-[var(--color-main-light)]
						[&::-webkit-search-cancel-button]:hidden
					`}
					onWheel={(e) => (e.target as HTMLInputElement).blur()}
					onPaste={(e) => {
						if (InputForm === "password") e.preventDefault();
					}}
					{...rest}
				/>

				{InputForm === "password" && (
					<button
						type="button"
						onClick={() => setShow((s) => !s)}
						className="absolute inset-y-0 right-3 flex items-center justify-center top-1/2 transform -translate-y-1/2"
					>
						{!show ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
					</button>
				)}
			</div>

			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}
		</div>
	);
};

// 👇 Usamos export default con forwardRef directamente
export default forwardRef<HTMLInputElement, InputTypeProps>(InputTypeComponent);
