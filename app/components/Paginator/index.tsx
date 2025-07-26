"use client";

import React from "react";
import { BiLeftArrow, BiRightArrow } from "react-icons/bi";

type Props = {
	currentPage: number;
	totalPages: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (size: number) => void;
};

const Paginator = ({
	currentPage,
	totalPages,
	pageSize,
	onPageChange,
	onPageSizeChange,
}: Props) => {
	const getPageNumbers = () => {
		const maxVisible = 5;
		const pages: number[] = [];

		let start = Math.max(1, currentPage - 2);
		const end = Math.min(totalPages, start + maxVisible - 1);

		if (end - start < maxVisible - 1) {
			start = Math.max(1, end - maxVisible + 1);
		}

		for (let i = start; i <= end; i++) {
			pages.push(i);
		}

		return pages;
	};

	return (
		<div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
			{/* Selector de filas */}
			<div className="mb-2 sm:mb-0 flex items-center gap-2 text-sm text-gray-700">
				<label htmlFor="pageSizeSelect" className="whitespace-nowrap">Filas por página:</label>
				<select
					id="pageSizeSelect"
					value={pageSize}
					onChange={(e) => onPageSizeChange(Number(e.target.value))}
					className="rounded-md border border-[var(--color-border)] px-2 py-1 text-sm"
				>
					<option value={1}>1</option>
					<option value={5}>5</option>
					<option value={10}>10</option>
					<option value={20}>20</option>
					<option value={50}>50</option>
					<option value={100}>100</option>
				</select>
			</div>

			{/* Botones de paginación */}
			<nav
				className="isolate inline-flex -space-x-px rounded-md shadow-sm"
				aria-label="Pagination"
			>
				<button
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
					className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-[var(--color-border)]  disabled:opacity-40"
				>
					<span className="sr-only">Anterior</span>
					<BiLeftArrow className="h-5 w-5" aria-hidden="true" />
				</button>

				{getPageNumbers().map((page) => {
					const isActive = currentPage === page;

					return (
						<button
							key={page}
							onClick={() => onPageChange(page)}
							aria-current={isActive ? "page" : undefined}
							className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-colors duration-150 ease-in-out
								${
									isActive
										? "z-10 bg-main text-white"
										: "text-gray-800 ring-1 ring-inset ring-[var(--color-border)] hover:bg-background"
								}`}
						>
							{page}
						</button>
					);
				})}

				<button
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-[var(--color-border)]  disabled:opacity-40"
				>
					<span className="sr-only">Siguiente</span>
					<BiRightArrow className="h-5 w-5" aria-hidden="true" />
				</button>
			</nav>
		</div>
	);
};

export default Paginator;
