'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaBell, FaCheck, FaTimes } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { AppDispatch, RootState } from '@/lib/store/store';
import api from '@/lib/store/axiosConfig';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { useToastAlert } from '@/hooks/useToastAlert';
import { fetchReservas } from '@/lib/store/utils/reservas/reservasSlice';
import { fetchReservasCalendar } from '@/lib/store/utils/calendario/calendarioSlice';
import { useReservasSocket } from '@/hooks/useReservasSocket';
import { toYMDLocal } from '@/utils/helpers/date';

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

export default function AprobacionesPopup() {
  const pathname = usePathname();
  const dispatch = useAppDispatch<AppDispatch>();
  const { accessToken } = useAppSelector((state: RootState) => state.user);

  const [open, setOpen] = useState(false);
  const [reservas, setReservas] = useState<ReservaPendiente[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  // true mientras haya reservas pendientes que el usuario aún no abrió el popup para ver
  const [hasUnseen, setHasUnseen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);
  // ref sincronizado con `open` para leerlo dentro de fetchPendientes sin recrearla
  const openRef = useRef(false);

  const { confirm } = useSweetAlert();
  const { successToast, errorToast } = useToastAlert();

  const fetchPendientes = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/reservas/pendientes');
      const lista: ReservaPendiente[] = Array.isArray(data) ? data : [];
      setReservas(lista);
      // Solo activa la animación si el popup está cerrado — si está abierto el usuario ya las está viendo
      if (lista.length > 0 && !openRef.current) setHasUnseen(true);
    } catch {
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Refresca el calendario y la tabla de reservas en el store */
  const refreshStore = useCallback(() => {
    const hoy = new Date();
    const startDate = toYMDLocal(hoy);
    const endDate = toYMDLocal(new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000));
    dispatch(fetchReservasCalendar({ startDate, endDate }));
    dispatch(fetchReservas());
  }, [dispatch]);

  // ─── WebSocket ────────────────────────────────────────────────────────────
  useReservasSocket({
    enabled: !!accessToken,
    onNuevaReserva: () => {
      fetchPendientes(); // refresca lista y activa hasUnseen automáticamente
    },
    onReservaActualizada: () => {
      refreshStore();
      fetchPendientes();
    },
  });

  // Fetch on first mount
  useEffect(() => {
    if (!accessToken || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchPendientes();
  }, [accessToken, fetchPendientes]);

  // Re-fetch when pathname changes
  useEffect(() => {
    if (!accessToken || !hasFetchedRef.current) return;
    fetchPendientes();
  }, [pathname, accessToken, fetchPendientes]);

  // Close popup on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        openRef.current = false;
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close popup on route change
  useEffect(() => {
    openRef.current = false;
    setOpen(false);
  }, [pathname]);

  const togglePopup = () => {
    const willOpen = !open;
    openRef.current = willOpen;
    setOpen(willOpen);
    if (willOpen) {
      setHasUnseen(false); // primero apaga la animación...
      fetchPendientes();   // ...luego refresca (openRef ya es true, no la reactivará)
    }
  };

  const handleAprobar = useCallback(
    async (id: number) => {
      const ok = await confirm('¿Aprobar esta reserva? Se notificará al huésped por email si tiene uno registrado.');
      if (!ok) return;
      setActionLoading(id);
      try {
        await api.put(`/reservas/${id}/confirmar`);
        successToast('Reserva aprobada correctamente.');
        setReservas((prev) => prev.filter((r) => r.id !== id));
        refreshStore();
      } catch {
        errorToast('Error al aprobar la reserva.');
      } finally {
        setActionLoading(null);
      }
    },
    [confirm, successToast, errorToast, refreshStore]
  );

  const handleRechazar = useCallback(
    async (id: number) => {
      const ok = await confirm('¿Rechazar esta reserva? Se notificará al huésped por email si tiene uno registrado.');
      if (!ok) return;
      setActionLoading(id);
      try {
        await api.put(`/reservas/${id}/rechazar`);
        successToast('Reserva rechazada correctamente.');
        setReservas((prev) => prev.filter((r) => r.id !== id));
        refreshStore();
      } catch {
        errorToast('Error al rechazar la reserva.');
      } finally {
        setActionLoading(null);
      }
    },
    [confirm, successToast, errorToast, refreshStore]
  );

  const formatDate = (iso: string) => {
    if (!iso || iso === '-') return '-';
    return new Date(iso + 'T12:00:00').toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const pendingCount = reservas.length;

  return (
    <div className="relative" ref={popupRef}>
      {/* Bell button */}
      <button
        onClick={togglePopup}
        className={`relative p-2.5 rounded-xl border transition-all duration-150 cursor-pointer
          ${open
            ? 'text-white bg-white/12 border-white/20'
            : 'text-emerald-100/60 border-white/10 bg-white/5 hover:bg-white/10 hover:text-white'}`}
        title="Reservas pendientes de aprobación"
      >
        {/* Icono: se sacude mientras haya pendientes no vistos */}
        <span className={hasUnseen ? 'block animate-[bellShake_0.7s_ease-in-out_infinite]' : 'block'}>
          <FaBell size={22} />
        </span>

        {/* Badge con contador */}
        <span className={`absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold rounded-full transition-all border
          ${pendingCount > 0 ? 'bg-amber-400 text-[#1f1303] border-amber-300' : 'bg-white/20 text-white/70 border-white/20'}`}>
          {pendingCount}
        </span>

        {/* Aro pulsante mientras haya pendientes no vistos */}
        {hasUnseen && (
          <span className="absolute inset-0 rounded-full ring-2 ring-amber-400 animate-ping pointer-events-none" />
        )}
      </button>

      {/* Dropdown popup */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#071d13]/98 rounded-xl shadow-2xl border border-white/12 z-50 overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white">Reservas pendientes de aprobación</h3>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-main border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && reservas.length === 0 && (
              <div className="py-8 text-center">
                <FaCheck className="mx-auto text-emerald-300/50 mb-2" size={24} />
                <p className="text-sm text-emerald-100/45">Sin reservas pendientes</p>
              </div>
            )}

            {!loading && reservas.length > 0 && (
              <ul className="divide-y divide-white/8">
                {reservas.map((r) => (
                  <li key={r.id} className="px-4 py-3 hover:bg-white/6 transition-colors">
                    {/* Guest info */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-sm font-medium text-white truncate">
                        {r.huespedNombre}
                      </span>
                      {r.emailHuesped && (
                        <span className="text-[10px] bg-emerald-400/15 text-emerald-300 border border-emerald-300/25 px-1.5 py-0.5 rounded-full shrink-0">
                          email
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="text-xs text-emerald-100/50 space-y-0.5 mb-2">
                      <p>
                        <span className="font-medium text-emerald-200">Hab. {r.numeroHab}</span>
                        {' — '}
                        {formatDate(r.ingreso)} al {formatDate(r.egreso)}
                      </p>
                      <p>
                        Total: <span className="font-medium text-emerald-200">${Number(r.total).toLocaleString('es-AR')}</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAprobar(r.id)}
                        disabled={actionLoading === r.id}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-emerald-300 border border-emerald-400/35 hover:bg-emerald-500 hover:text-[#062317] hover:border-emerald-400 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {actionLoading === r.id ? (
                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaCheck size={10} />
                        )}
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazar(r.id)}
                        disabled={actionLoading === r.id}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-red-300 border border-red-400/35 hover:bg-red-500 hover:text-white hover:border-red-400 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {actionLoading === r.id ? (
                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaTimes size={10} />
                        )}
                        Rechazar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
