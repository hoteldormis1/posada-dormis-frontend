"use client";

import CloseButton from "@/components/ui/buttons/CloseButton";
import { ReactNode } from "react";

type PopupContainerProps = {
	onClose: () => void;
	title?: string;
	children: ReactNode;
	className?: string;
	showHeader?: boolean;
};

export default function PopupContainer({
	onClose,
	title = "",
	children,
	className = "",
	showHeader = true,
}: PopupContainerProps) {
	return (
		<div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/65 backdrop-blur-md px-2">
			<div
				className={`bg-[#071e14] border border-white/12 w-full max-w-[800px] max-h-[90vh] min-h-[60vh] rounded-t-3xl overflow-y-auto animate-slide-up relative p-6 shadow-2xl ${className}`}
			>
				{showHeader && (
					<div className="flex justify-between items-center border-b border-white/10 pb-4 mb-2">
						<div className="flex items-center gap-3">
							<div className="w-1 h-8 bg-emerald-400 rounded-full"></div>
							<p className="text-2xl font-bold text-white">{title}</p>
						</div>
						<CloseButton onClose={onClose} size={24} className="text-emerald-100/60 hover:text-white transition-colors" />
					</div>
				)}
				{children}
			</div>
		</div>
	);
}
