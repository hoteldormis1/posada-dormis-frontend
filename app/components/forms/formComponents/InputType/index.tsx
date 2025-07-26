"use client";

import { useState, forwardRef, ForwardedRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface InputTypeProps extends React.InputHTMLAttributes<HTMLInputElement> {
	inputKey?: string;
	inputType?: string;
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
		inputType = "text",
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

	const type = inputType === "password" ? (show ? "text" : "password") : inputType;

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
					placeholder={placeholder}
					disabled={disabled}
					required={required}
					className={`w-full bg-white border ${
						error ? "border-red-500" : "border-borders"
					} rounded-md px-4 py-2 placeholder:text-borders text-gray-900 text-sm focus:outline-none focus:ring-1 ${
						error
							? "focus:ring-red-500 focus:border-red-500"
							: "focus:ring-main focus:border-main"
					} [&::-webkit-search-cancel-button]:hidden`}
					onWheel={(e) => (e.target as HTMLInputElement).blur()}
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

// 👇 Usamos export default con forwardRef directamente
export default forwardRef<HTMLInputElement, InputTypeProps>(InputTypeComponent);
