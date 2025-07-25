"use client";

import { useState, forwardRef, ForwardedRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface InputTypeProps extends React.InputHTMLAttributes<HTMLInputElement> {
	inputKey?: string;
	inputType?: string; // puede ser "text", "password", "email", etc.
	// inputMode?: "text" | "search" | "email" | "tel" | "url" | "none" | "numeric" | "decimal" | ""; // por ejemplo "numeric"
	placeholder?: string;
	labelStyles?: string;
	children?: React.ReactNode;
	error?: string | null;
	disabled?: boolean;
	required?: boolean;
}

const InputType = (
	{
		inputKey = "",
		inputType = "text",
		// inputMode = "",
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
		inputType === "password" ? (show ? "text" : "password") : inputType;

	return (
		<div className="w-full">
			<label
				htmlFor={inputKey}
				className={`block mb-2 text-base font-medium text-gray-900 ${labelStyles}`}
			>
				{children}
			</label>

			<div className="relative">
				<input
					id={inputKey}
					name={inputKey}
					ref={ref}
					type={type}
					// inputMode={inputMode}
					placeholder={placeholder}
					disabled={disabled}
					required={required}
					className={`w-full bg-white border ${
						error ? "border-red-500" : "border-borders"
					} rounded-md px-4 py-4 placeholder:text-borders text-gray-900 text-sm focus:outline-none focus:ring-1 ${
						error
							? "focus:ring-red-500 focus:border-red-500"
							: "focus:ring-main focus:border-main"
					}`}
					onWheel={(e) => (e.target as HTMLInputElement).blur()} // evitar scroll en inputs de tipo number
					onPaste={(e) => e.preventDefault()}
					{...rest}
				/>

				{inputType === "password" && (
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

export default forwardRef<HTMLInputElement, InputTypeProps>(InputType);
