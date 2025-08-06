import React from "react";
import { AppIcon } from "../..";

export default function CloseButton({ onClose, size = 30,  className = "" }) {
	return (
		<button
			onClick={onClose}
			aria-label="Cerrar"
			className={`absolute top-4 right-4 border-2 border-dark rounded-full cursor-pointer z-[999999] `}
		>
			<AppIcon name="close" size={size} className={className}/>
		</button>
	);
}
