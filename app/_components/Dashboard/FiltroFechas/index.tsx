import React from "react";

const FiltroFechas = () => {
	return (
		<div className="pt-8 w-full">
			<div className="flex flex-col md:flex-row gap-6 w-full rounded-xl shadow-md p-6 border-1 border-gray-400">
				{/* Fecha Desde */}
				<div className="w-full md:w-1/2 flex items-center gap-4">
					<label
						htmlFor="start-date"
						className="font-semibold text-gray-700 whitespace-nowrap"
					>
						Fecha desde
					</label>
					<div className="relative w-full">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<svg
								className="w-4 h-4 text-gray-500"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
							</svg>
						</div>
						<input
							id="start-date"
							type="date"
							className="bg-tertiary border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
						/>
					</div>
				</div>

				{/* Fecha Hasta */}
				<div className="w-full md:w-1/2 flex items-center gap-4">
					<label
						htmlFor="end-date"
						className="font-semibold text-gray-700 whitespace-nowrap"
					>
						Fecha hasta
					</label>
					<div className="relative w-full">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<svg
								className="w-4 h-4 text-gray-500"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
							</svg>
						</div>
						<input
							id="end-date"
							type="date"
							className="bg-tertiary border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FiltroFechas;
