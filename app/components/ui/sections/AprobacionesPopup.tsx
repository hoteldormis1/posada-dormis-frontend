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
  const [hasUnseen, setHasUnseen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);
  const openRef = useRef(false);

  const { confirm } = useSweetAlert();
  const { successToast, errorToast } = useToastAlert();

  const fetchPendientes = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/reservas/pendientes');
      const lista: ReservaPendiente[] = Array.isArray(data) ? data : [];
      setReservas(lista);
      if (lista.length > 0 && !openRef.current) setHasUnseen(true);
    } catch {
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStore = useCallback(() => {
    const hoy = new Date();
    const startDate = toYMDLocal(hoy);
    const endDate = toYMDLocal(new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000));
    dispatch(fetchReservasCalendar({ startDate, endDate }));
    dispatch(fetchReservas());
  }, [dispatch]);

  useReservasSocket({
    enabled: !!accessToken,
    onNuevaReserva: () => { fetchPendientes(); },
    onReservaActualizada: () => { refreshStore(); fetchPendientes(); },
  });

  useEffect(() => {
    if (!accessToken || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchPendientes();
  }, [accessToken, fetchPendientes]);

  useEffect(() => {
    if (!accessToken || !hasFetchedRef.current) return;
    fetchPendientes();
  }, [pathname, accessToken, fetchPendientes]);

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

  useEffect(() => {
    openRef.current = false;
    setOpen(false);
  }, [pathname]);

  const togglePopup = () => {
    const willOpen = !open;
    openRef.current = willOpen;
    setOpen(willOpen);
    if (willOpen) {
      setHasUnseen(false);
      fetchPendientes();
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

      {/* ── Bell button ───────────────────────────────────────── */}
      <button
        onClick={togglePopup}
        className={`
          relative p-2.5 rounded-xl border transition-all duration-200 cursor-pointer
          ${open
            ? 'text-white bg-white/10 border-white/20 shadow-inner'
            : 'text-white/50 border-white/10 bg-white/[0.04] hover:bg-white/10 hover:text-white hover:border-white/20'
          }
        `}
        title="Reservas pendientes de aprobación"
      >
        <span className={hasUnseen ? 'block animate-[bellShake_0.7s_ease-in-out_infinite]' : 'block'}>
          <FaBell size={20} />
        </span>

        {/* Badge */}
        <span
          className={`
            absolute -top-1.5 -right-1.5 flex items-center justify-center
            min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full
            border transition-all duration-300
            ${pendingCount > 0
              ? 'bg-amber-400 text-amber-950 border-amber-300/60 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
              : 'bg-white/10 text-white/40 border-white/10'
            }
          `}
        >
          {pendingCount}
        </span>

        {/* Ping ring */}
        {hasUnseen && (
          <span className="absolute inset-0 rounded-xl ring-2 ring-amber-400/70 animate-ping pointer-events-none" />
        )}
      </button>

      {/* ── Dropdown ──────────────────────────────────────────── */}
      {open && (
        <div
          className="
            absolute right-0 top-full mt-2 w-[22rem]
            bg-[#07190f] rounded-2xl border border-white/[0.08]
            shadow-[0_24px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]
            z-50 overflow-hidden backdrop-blur-2xl
            animate-[fadeSlideDown_0.18s_ease-out_both]
          "
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.025]">
            <div className="flex items-center gap-2.5">
              {/* Dot indicator */}
              <span
                className={`
                  w-2 h-2 rounded-full flex-shrink-0
                  ${pendingCount > 0
                    ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] animate-pulse'
                    : 'bg-white/20'
                  }
                `}
              />
              <h3 className="text-xs font-semibold tracking-wide text-white/80 uppercase">
                Reservas pendientes
              </h3>
            </div>
            {pendingCount > 0 && (
              <span className="text-[11px] font-semibold text-amber-400/80 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                {pendingCount} {pendingCount === 1 ? 'nueva' : 'nuevas'}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[340px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-emerald-400/60 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Empty state */}
            {!loading && reservas.length === 0 && (
              <div className="py-10 text-center px-6">
                <div className="w-10 h-10 rounded-full bg-emerald-400/10 border border-emerald-400/15 flex items-center justify-center mx-auto mb-3">
                  <FaCheck className="text-emerald-400/50" size={16} />
                </div>
                <p className="text-sm font-medium text-white/60">Sin reservas pendientes</p>
                <p className="text-xs text-white/60 mt-1">Todo al día ✓</p>
              </div>
            )}

            {/* List */}
            {!loading && reservas.length > 0 && (
              <ul className="divide-y divide-white/[0.06]">
                {reservas.map((r) => (
                  <li
                    key={r.id}
                    className="px-4 py-3.5 hover:bg-white/[0.04] transition-colors duration-150 group"
                  >
                    {/* Guest name + email badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-semibold text-white/90 truncate leading-tight">
                        {r.huespedNombre}
                      </span>
                      {r.emailHuesped && (
                        <span className="flex-shrink-0 text-[10px] font-medium tracking-wide bg-sky-400/10 text-sky-300/80 border border-sky-400/20 px-2 py-0.5 rounded-full">
                          {r.emailHuesped}
                        </span>
                      )}
                    </div>

                    {/* Details row */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="text-[11px] font-semibold text-emerald-400/90 bg-emerald-400/10 border border-emerald-400/15 px-1.5 py-0.5 rounded-md">
                        Hab. {r.numeroHab}
                      </span>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-[11px] text-white/40">
                        {formatDate(r.ingreso)} → {formatDate(r.egreso)}
                      </span>
                      <span className="text-white/20 text-xs ml-auto">·</span>
                      <span className="text-[11px] font-semibold text-white/70">
                        ${Number(r.total).toLocaleString('es-AR')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAprobar(r.id)}
                        disabled={actionLoading === r.id}
                        className="
                          flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg
                          text-emerald-300 border border-emerald-500/30 bg-emerald-500/10
                          hover:bg-emerald-500 hover:text-white hover:border-emerald-400
                          disabled:opacity-40 disabled:cursor-not-allowed
                          transition-all duration-150 cursor-pointer
                        "
                      >
                        {actionLoading === r.id ? (
                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaCheck size={9} />
                        )}
                        Aprobar
                      </button>

                      <button
                        onClick={() => handleRechazar(r.id)}
                        disabled={actionLoading === r.id}
                        className="
                          flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg
                          text-red-300/80 border border-red-500/25 bg-red-500/8
                          hover:bg-red-500 hover:text-white hover:border-red-400
                          disabled:opacity-40 disabled:cursor-not-allowed
                          transition-all duration-150 cursor-pointer
                        "
                      >
                        {actionLoading === r.id ? (
                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FaTimes size={9} />
                        )}
                        Rechazar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {!loading && reservas.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.015]">
              <p className="text-[10px] text-white/20 text-center">
                Se notificará al huésped por email al aprobar o rechazar
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
