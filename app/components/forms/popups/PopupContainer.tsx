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
		<div className="fixed inset-0 z-[999]  flex items-end justify-center bg-gray-700/30 backdrop-blur-sm px-2">
			<div
				className={`bg-light w-full max-w-[800px] max-h-[90vh] min-h-[60vh] rounded-t-2xl overflow-y-auto animate-slide-up relative p-4 ${className}`}
			>
				{showHeader && (
					<div className="flex justify-between items-center border-b pb-4">
						<p className="text-xl font-semibold">{title}</p>
						<CloseButton onClose={onClose} size={24} className="text-dark" />
					</div>
				)}
				{children}
			</div>
		</div>
	);
}
