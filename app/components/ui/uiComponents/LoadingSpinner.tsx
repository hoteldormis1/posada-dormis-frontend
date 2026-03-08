import React from "react";

const LoadingSpinner = () => {
	return (
		<div role="status" className="w-full py-8 px-2">
			<style>{`
				@keyframes adminSkeleton {
					0% { background-position: -420px 0; }
					100% { background-position: 420px 0; }
				}
				.loader-skel {
					border-radius: 8px;
					background: linear-gradient(
						90deg,
						rgba(255,255,255,0.06) 25%,
						rgba(255,255,255,0.13) 50%,
						rgba(255,255,255,0.06) 75%
					);
					background-size: 840px 100%;
					animation: adminSkeleton 1.45s ease-in-out infinite;
				}
			`}</style>

			<div className="mx-auto w-full max-w-5xl rounded-2xl border border-white/10 bg-white/4 p-4 sm:p-5">
				<div className="mb-4 flex items-center justify-between">
					<div className="loader-skel h-4 w-40" />
					<div className="loader-skel h-8 w-28 rounded-lg" />
				</div>

				<div className="mb-3 flex gap-2">
					<div className="loader-skel h-3 w-[18%]" />
					<div className="loader-skel h-3 w-[14%]" />
					<div className="loader-skel h-3 w-[14%]" />
					<div className="loader-skel h-3 w-[20%]" />
					<div className="loader-skel h-3 w-[14%]" />
					<div className="loader-skel h-3 w-[14%]" />
				</div>

				{[1, 2, 3].map((row) => (
					<div key={row} className="flex items-center gap-3 border-b border-white/8 py-3 last:border-b-0">
						<div className="loader-skel h-9 w-9 rounded-lg shrink-0" />
						<div className="flex-1 flex gap-3">
							<div className="loader-skel h-3 flex-[2]" />
							<div className="loader-skel h-3 flex-1" />
							<div className="loader-skel h-3 flex-1" />
							<div className="loader-skel h-6 w-20 rounded-full" />
						</div>
					</div>
				))}
			</div>

			<span className="sr-only">Cargando contenido</span>
		</div>
	);
};

export default LoadingSpinner;
