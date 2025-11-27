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
		<div className="fixed inset-0 z-[999] flex items-end justify-center bg-gray-900/50 backdrop-blur-md px-2">
			<div
				className={`bg-white w-full max-w-[800px] max-h-[90vh] min-h-[60vh] rounded-t-3xl overflow-y-auto animate-slide-up relative p-6 shadow-2xl ${className}`}
			>
				{showHeader && (
					<div className="flex justify-between items-center border-b-2 border-gray-200 pb-4 mb-2">
						<div className="flex items-center gap-3">
							<div className="w-1 h-8 bg-[var(--color-main)] rounded-full"></div>
							<p className="text-2xl font-bold text-gray-800">{title}</p>
						</div>
						<CloseButton onClose={onClose} size={24} className="text-gray-600 hover:text-gray-900 transition-colors" />
					</div>
				)}
				{children}
			</div>
		</div>
	);
}
