import React from "react";
import { AppIcon } from "@/components/index";

export default function CloseButton({ onClose, size = 30,  className = "" }) {
	return (
		<button
			onClick={onClose}
			aria-label="Cerrar"
			className="absolute top-4 right-4 inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/20 bg-white/8 text-admin-muted hover:text-admin-primary hover:bg-white/14 transition-colors cursor-pointer z-[999999]"
		>
			<AppIcon name="close" size={size} className={`text-inherit ${className}`} />
		</button>
	);
}
