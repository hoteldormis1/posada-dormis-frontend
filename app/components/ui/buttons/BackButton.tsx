import React from "react";
import Link from "next/link";
import { AppIcon } from "@/components/index";

export default function BackButton({ href, size = 24, className = "" }) {
	return (
		<Link
			href={href}
			aria-label="Volver"
			className={`inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/20 bg-white/8 text-admin-muted hover:text-admin-primary hover:bg-white/14 transition-colors cursor-pointer ${className}`}
		>
			<AppIcon name="back" size={size} className="text-inherit" />
		</Link>
	);
}
