'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaBell, FaCheck, FaTimes } from 'react-icons/fa';
import { useAppSelector } from '@/lib/store/hooks';
import { RootState } from '@/lib/store/store';
import api from '@/lib/store/axiosConfig';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { useToastAlert } from '@/hooks/useToastAlert';

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
  const { accessToken } = useAppSelector((state: RootState) => state.user);

  const [open, setOpen] = useState(false);
  const [reservas, setReservas] = useState<ReservaPendiente[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  const { confirm } = useSweetAlert();
  const { successToast, errorToast } = useToastAlert();

  const fetchPendientes = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/reservas/pendientes');
      setReservas(Array.isArray(data) ? data : []);
    } catch {
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close popup on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const togglePopup = () => {
    setOpen((v) => !v);
    if (!open) fetchPendientes();
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
      } catch {
        errorToast('Error al aprobar la reserva.');
      } finally {
        setActionLoading(null);
      }
    },
    [confirm, successToast, errorToast]
  );

  const handleRechazar = useCallback(
    async (id: number) => {
      const ok = await confirm('¿Rechazar esta reserva? Se notificará al huésped por email si tiene uno registrado.');
      if (!ok) return;
      setActionLoading(id);
      try {
        await api.put(`/reservas/${id}/cancelar`);
        successToast('Reserva rechazada correctamente.');
        setReservas((prev) => prev.filter((r) => r.id !== id));
      } catch {
        errorToast('Error al rechazar la reserva.');
      } finally {
        setActionLoading(null);
      }
    },
    [confirm, successToast, errorToast]
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
        className={`relative p-2 rounded-full transition-all duration-150 cursor-pointer
          ${open
            ? 'text-white bg-black  '
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
        title="Aprobaciones pendientes"
      >
        <FaBell size={22} />
        <span className={`absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold rounded-full
          ${pendingCount > 0 ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'}`}>
          {pendingCount}
        </span>
      </button>

      {/* Dropdown popup */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b ">
            <h3 className="text-sm font-semibold">Aprobaciones pendientes</h3>
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
                <FaCheck className="mx-auto text-gray-300 mb-2" size={24} />
                <p className="text-sm text-gray-400">Sin reservas pendientes</p>
              </div>
            )}

            {!loading && reservas.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {reservas.map((r) => (
                  <li key={r.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    {/* Guest info */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {r.huespedNombre}
                      </span>
                      {r.emailHuesped && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full shrink-0">
                          email
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                      <p>
                        <span className="font-medium text-gray-700">Hab. {r.numeroHab}</span>
                        {' — '}
                        {formatDate(r.ingreso)} al {formatDate(r.egreso)}
                      </p>
                      <p>
                        Total: <span className="font-medium text-gray-700">${Number(r.total).toLocaleString('es-AR')}</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAprobar(r.id)}
                        disabled={actionLoading === r.id}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-green-600 border-1  hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        <FaCheck size={10} />
                        Aprobar
                      </button>
                      <button
                        onClick={() => handleRechazar(r.id)}
                        disabled={actionLoading === r.id}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md text-red-600 border-1 hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        <FaTimes size={10} />
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
