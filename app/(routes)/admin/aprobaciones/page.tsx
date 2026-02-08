"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { pantallaPrincipalEstilos } from "@/styles/global-styles";
import { LoadingSpinner } from "@/components";
import { useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store/store";
import api from "@/lib/store/axiosConfig";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { useToastAlert } from "@/hooks/useToastAlert";
import { FaCheck, FaTimes } from "react-icons/fa";

interface ReservaPendiente {
	id: number;
	numeroHab: string | number;
	ingreso: string;
	egreso: string;
	huespedNombre: string;
	telefonoHuesped: string;
	emailHuesped: string | null;
	dniHuesped: string;
	montoPagado: number;
	total: number;
}

export default function AprobacionesPage() {
	const { accessToken } = useAppSelector((state: RootState) => state.user);
	const [reservas, setReservas] = useState<ReservaPendiente[]>([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState<number | null>(null);
	const { confirm } = useSweetAlert();
	const { successToast, errorToast } = useToastAlert();

	const hasFetchedRef = useRef(false);

	const fetchPendientes = useCallback(async () => {
		try {
			setLoading(true);
			const { data } = await api.get("/reservas/pendientes");
			setReservas(data);
		} catch {
			errorToast("Error al cargar reservas pendientes.");
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!accessToken || hasFetchedRef.current) return;
		hasFetchedRef.current = true;
		fetchPendientes();
	}, [accessToken, fetchPendientes]);

	const handleAprobar = useCallback(
		async (id: number) => {
			const ok = await confirm("¿Aprobar esta reserva? Se notificará al huésped por email si tiene uno registrado.");
			if (!ok) return;

			setActionLoading(id);
			try {
				await api.put(`/reservas/${id}/confirmar`);
				successToast("Reserva aprobada correctamente.");
				setReservas((prev) => prev.filter((r) => r.id !== id));
			} catch {
				errorToast("Error al aprobar la reserva.");
			} finally {
				setActionLoading(null);
			}
		},
		[confirm, successToast, errorToast]
	);

	const handleRechazar = useCallback(
		async (id: number) => {
			const ok = await confirm("¿Rechazar esta reserva? Se notificará al huésped por email si tiene uno registrado.");
			if (!ok) return;

			setActionLoading(id);
			try {
				await api.put(`/reservas/${id}/cancelar`);
				successToast("Reserva rechazada correctamente.");
				setReservas((prev) => prev.filter((r) => r.id !== id));
			} catch {
				errorToast("Error al rechazar la reserva.");
			} finally {
				setActionLoading(null);
			}
		},
		[confirm, successToast, errorToast]
	);

	const formatDate = (iso: string) => {
		if (!iso || iso === "-") return "-";
		return new Date(iso + "T12:00:00").toLocaleDateString("es-AR", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});
	};

	return (
		<div className={pantallaPrincipalEstilos}>
			<div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
				<h1 className="text-2xl font-semibold text-center py-4">Aprobaciones</h1>

				{loading && <LoadingSpinner />}

				{!loading && reservas.length === 0 && (
					<div className="text-center py-16">
						<div className="text-5xl mb-4 opacity-30">
							<FaCheck className="inline" />
						</div>
						<p className="text-gray-500 text-lg">No hay reservas pendientes de aprobación.</p>
					</div>
				)}

				{!loading && reservas.length > 0 && (
					<div className="flex flex-col gap-4 pb-32">
						{reservas.map((r) => (
							<div
								key={r.id}
								className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4"
							>
								{/* Info */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<span className="font-semibold text-gray-900 truncate">
											{r.huespedNombre}
										</span>
										{r.emailHuesped && (
											<span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full shrink-0">
												email
											</span>
										)}
									</div>

									<div className="text-sm text-gray-500 space-y-0.5">
										<p>
											<span className="font-medium text-gray-700">Hab. {r.numeroHab}</span>
											{" — "}
											{formatDate(r.ingreso)} al {formatDate(r.egreso)}
										</p>
										<p>
											DNI: {r.dniHuesped} &middot; Tel: {r.telefonoHuesped}
										</p>
										<p className="font-medium text-gray-700">
											Total: ${Number(r.total).toLocaleString("es-AR")}
										</p>
									</div>
								</div>

								{/* Actions */}
								<div className="flex gap-2 shrink-0">
									<button
										onClick={() => handleAprobar(r.id)}
										disabled={actionLoading === r.id}
										className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
									>
										<FaCheck size={12} />
										Aprobar
									</button>
									<button
										onClick={() => handleRechazar(r.id)}
										disabled={actionLoading === r.id}
										className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
									>
										<FaTimes size={12} />
										Rechazar
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
