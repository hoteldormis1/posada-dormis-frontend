"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import { useReservasSocket } from "@/hooks/useReservasSocket";
import { fetchContableResumen, fetchDashboardSummary } from "@/lib/store/utils";
import { StateStatus } from "@/models/types";
import { LoadingSpinner, GraficoCantidadDeReservas, GraficoPie } from "@/components";
import PresetTabs from "@/components/ui/uiComponents/Dashboard/FiltroFechas/PresetTabs";
import {
  type Preset,
  toYMDLocal,
  toDDMMYYYY,
  ddmmToISO,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfWeekMonday,
  endOfWeekMonday,
} from "@/utils/helpers/date";
import InputDateForm from "@/components/forms/formComponents/InputDateForm";
import {
  FaDollarSign,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSignInAlt,
  FaSignOutAlt,
  FaChartBar,
} from "react-icons/fa";
import {
  getEstadoReservaTheme,
  normalizeEstadoReserva,
  getEstadoReservaLabel,
  getEstadoReservaChartColor,
} from "@/utils/helpers/reservaEstado";

// ─────────────────────────── Mapa de iconos/colores por estado ───────────────────────────
const estadoIconMap: Record<string, React.ReactNode> = {
  pendiente: <FaClock size={22} />,
  confirmada: <FaCheckCircle size={22} />,
  cancelada: <FaTimesCircle size={22} />,
  checkin: <FaSignInAlt size={22} />,
  checkout: <FaSignOutAlt size={22} />,
};

const defaultConfig: { icon: React.ReactNode; color: string; bg: string; border: string } = {
  icon: <FaChartBar size={22} />,
  color: "text-emerald-100/75",
  bg: "bg-white/4",
  border: "border-white/12",
};

const getEstadoConfig = (estadoNombre: string) => {
  const key = normalizeEstadoReserva(estadoNombre);
  const theme = getEstadoReservaTheme(estadoNombre);

  return {
    icon: estadoIconMap[key] ?? defaultConfig.icon,
    color: theme.tw.text,
    bg: theme.tw.bg,
    border: theme.tw.border,
  };
};

// ─────────────────────────── Helpers de formato ───────────────────────────

const fmtMoney = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 });

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

/** Calcula from/to en ISO y dd/mm/yyyy a partir de un preset. */
const getRangeFromPreset = (preset: Preset) => {
  const now = new Date();
  let s: Date;
  let e: Date;

  switch (preset) {
    case "HOY":
      s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      e = s;
      break;
    case "SEMANA":
      s = startOfWeekMonday(now);
      e = endOfWeekMonday(now);
      break;
    case "MES":
      s = startOfMonth(now);
      e = endOfMonth(now);
      break;
    case "ANIO":
      s = startOfYear(now);
      e = endOfYear(now);
      break;
    default:
      s = startOfMonth(now);
      e = endOfMonth(now);
      break;
  }
  return {
    fromISO: toYMDLocal(s),
    toISO: toYMDLocal(e),
    fromUI: toDDMMYYYY(s),
    toUI: toDDMMYYYY(e),
  };
};

// ─────────────────────────── Componente ───────────────────────────

const ContablePage: React.FC = () => {
  const dispatch = useAppDispatch<AppDispatch>();
  const { resumen, statusResumen, errorResumen } = useAppSelector(
    (state: RootState) => state.contable
  );
  // Telemetría de ventas (ingresos + reservas) desde el endpoint del dashboard
  const teleVentas = useAppSelector(
    (state: RootState) => state.dashboards?.datos?.totals?.telemetria?.ventas ?? []
  );

  // Preset activo — default "MES"
  const [preset, setPreset] = useState<Preset>("MES");

  // Rango de fechas en dd/mm/yyyy (para UI) — se inicializa con "Este mes"
  const [fromUI, setFromUI] = useState(() => getRangeFromPreset("MES").fromUI);
  const [toUI, setToUI] = useState(() => getRangeFromPreset("MES").toUI);

  /** Despacha ambos fetches con el mismo rango */
  const fetchAmbos = (fromISO: string, toISO: string) => {
    dispatch(fetchContableResumen({ from: fromISO, to: toISO }));
    dispatch(fetchDashboardSummary({ from: fromISO, to: toISO, agruparPor: "day" }));
  };

  // Fetch inicial con rango del mes actual
  useEffect(() => {
    const { fromISO, toISO } = getRangeFromPreset("MES");
    fetchAmbos(fromISO, toISO);
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Siempre apunta al refetch con los filtros actuales (evita stale closure)
  const refreshRef = useRef<() => void>(() => {});
  useEffect(() => {
    const fromISO = ddmmToISO(fromUI) || getRangeFromPreset("MES").fromISO;
    const toISO = ddmmToISO(toUI) || getRangeFromPreset("MES").toISO;
    refreshRef.current = () => fetchAmbos(fromISO, toISO);
  });

  // Socket: actualiza los datos contables en tiempo real
  useReservasSocket({
    onNuevaReserva: () => refreshRef.current(),
    onReservaActualizada: () => refreshRef.current(),
  });

  // Handler de preset
  const handlePreset = (p: Preset) => {
    setPreset(p);
    if (p === "PERSONALIZADO") {
      const { fromUI: fUI, toUI: tUI } = getRangeFromPreset("MES");
      setFromUI(fUI);
      setToUI(tUI);
      return;
    }
    const { fromISO, toISO, fromUI: fUI, toUI: tUI } = getRangeFromPreset(p);
    setFromUI(fUI);
    setToUI(tUI);
    fetchAmbos(fromISO, toISO);
  };

  // Handler del input dd/mm/yyyy
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "from") setFromUI(e.target.value);
    if (e.target.name === "to") setToUI(e.target.value);
  };

  // Handler de personalizado
  const handleFiltrar = () => {
    const fromISO = ddmmToISO(fromUI);
    const toISO = ddmmToISO(toUI);
    if (!fromISO || !toISO) return;
    fetchAmbos(fromISO, toISO);
  };

  // Datos contables
  const estados = useMemo(() => resumen?.estados ?? [], [resumen]);
  const totalGeneral = resumen?.totalGeneral;
  const labelsEstados = useMemo(
    () => estados.map((e) => getEstadoReservaLabel(e.nombre)),
    [estados]
  );
  const cantidadPorEstado = useMemo(() => estados.map((e) => e.cantidad), [estados]);
  const coloresEstados = useMemo(
    () => estados.map((e) => getEstadoReservaChartColor(e.nombre, 0.7)),
    [estados]
  );

  // Datos para el gráfico de ingresos por fecha (del endpoint /dashboards/summary)
  const fallbackLabel = (iso: string) => {
    const d = new Date(iso);
    return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
  };
  const ingresosPorFechaData = useMemo(
    () =>
      teleVentas.map((p: { bucket: string; label?: string; sum: number }) => ({
        label: p.label || fallbackLabel(p.bucket),
        value: p.sum,
      })),
    [teleVentas]
  );

  return (
    <div className="w-full min-h-full overflow-auto pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold admin-title">Vista Contable</h1>
            <p className="text-sm admin-subtitle mt-1">
              Resumen financiero de reservas por estado
            </p>
          </div>
        </div>

        {/* Filtro de fechas */}
        <div className="admin-glass-card p-4 sm:p-5 mb-6 space-y-4">
          {/* Preset tabs */}
          <PresetTabs preset={preset} onSelect={handlePreset} />

          {/* Inputs manuales — solo en modo personalizado */}
          {preset === "PERSONALIZADO" && (
            <div className="flex flex-col sm:flex-row items-end gap-4 pt-2">
              <div className="flex-1 min-w-0">
                <InputDateForm
                  inputKey="from"
                  label="Fecha desde"
                  value={fromUI}
                  onChange={handleDateChange}
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div className="flex-1 min-w-0">
                <InputDateForm
                  inputKey="to"
                  label="Fecha hasta"
                  value={toUI}
                  onChange={handleDateChange}
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div className="flex items-end pb-1">
                <button
                  onClick={handleFiltrar}
                  className="px-6 py-2.5 admin-button-primary font-medium text-sm rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Filtrar
                </button>
              </div>
            </div>
          )}

          {resumen?.range && (
            <p className="text-xs text-emerald-100/65">
              Mostrando datos del {fmtDate(resumen.range.from)} al {fmtDate(resumen.range.to)}
            </p>
          )}
        </div>

        {/* Loading / Error */}
        {statusResumen === StateStatus.loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {statusResumen === StateStatus.failed && (
            <div className="text-center py-10">
            <p className="text-red-300 font-medium">{errorResumen}</p>
          </div>
        )}

        {statusResumen === StateStatus.succeeded && resumen && (
          <>
            {/* Tarjeta de Total General */}
            <div className="admin-glass-card p-6 mb-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FaDollarSign className="text-emerald-300" size={20} />
                Resumen General
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-200">
                    {totalGeneral?.cantidad ?? 0}
                  </p>
                  <p className="text-xs text-emerald-100/55 font-medium mt-1">Total Reservas</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xl sm:text-2xl font-bold text-emerald-300">
                    {fmtMoney(totalGeneral?.montoTotal ?? 0)}
                  </p>
                  <p className="text-xs text-emerald-100/55 font-medium mt-1">Monto Total</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xl sm:text-2xl font-bold text-cyan-300">
                    {fmtMoney(totalGeneral?.montoPagado ?? 0)}
                  </p>
                  <p className="text-xs text-emerald-100/55 font-medium mt-1">Monto Pagado</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xl sm:text-2xl font-bold text-amber-300">
                    {fmtMoney(totalGeneral?.saldoPendiente ?? 0)}
                  </p>
                  <p className="text-xs text-emerald-100/55 font-medium mt-1">Saldo Pendiente</p>
                </div>
              </div>
            </div>

            

            {/* Graficos contables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 w-full admin-glass-card p-6 mb-8">
              <div className="gap-8">
                <div className="flex flex-col p-6 border border-white/10 shadow-md h-[400px] bg-white/4 rounded-xl">
                  <label className="text-2xl font-semibold text-white">Reservas por estado</label>
                  <div className="mt-4 flex-1 flex items-center justify-center">
                    {estados.length > 0 ? (
                      <div className="w-full max-w-xs">
                        <GraficoPie
                          labels={labelsEstados}
                          data={cantidadPorEstado}
                          title=""
                          backgroundColors={coloresEstados}
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-emerald-100/65">Sin datos en el rango seleccionado.</div>
                    )}
                  </div>
                </div>
              </div>

                <div className="flex flex-col p-6 border border-white/10 shadow-md h-[400px] bg-white/4 rounded-xl">
                  <label className="text-2xl font-semibold text-white">Ingresos por fecha</label>
                  <div className="mt-4 flex-1">
                    {ingresosPorFechaData.length > 0 ? (
                      <GraficoCantidadDeReservas
                        data={ingresosPorFechaData}
                        className="h-full"
                        color="#10b981"
                        datasetLabel="Ingresos"
                        yType="money"
                      />
                    ) : (
                      <div className="text-sm text-emerald-100/65">Sin datos en el rango seleccionado.</div>
                    )}
                  </div>
                </div>
              
            </div>

            {/* Tarjetas por estado */}
            <h2 className="text-lg font-bold text-white mb-4">Resumen por Estado</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {estados.map((estado) => {
                const cfg = getEstadoConfig(estado.nombre);
                const theme = getEstadoReservaTheme(estado.nombre).hex;
                return (
                  <div
                    key={estado.idEstadoReserva}
                    className="rounded-xl p-5 transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${theme.color}33`,
                      boxShadow: `0 8px 24px ${theme.color}14, inset 0 1px 0 rgba(255,255,255,0.05)`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`${cfg.color}`}>{cfg.icon}</div>
                        <div>
                          <h3 className="font-bold text-white capitalize text-base">
                            {getEstadoReservaLabel(estado.nombre)}
                          </h3>
                          <p className="text-xs text-white/45">{estado.descripcion}</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold" style={{ color: theme.color }}>
                        {estado.cantidad}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Monto Total</span>
                        <span className="font-semibold text-white">
                          {fmtMoney(estado.montoTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Monto Pagado</span>
                        <span className="font-semibold" style={{ color: theme.accent }}>
                          {fmtMoney(estado.montoPagado)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-white/12 pt-2 mt-2">
                        <span className="text-white/60 font-medium">Saldo Pendiente</span>
                        <span className="font-bold text-amber-300">
                          {fmtMoney(estado.saldoPendiente)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tabla resumen */}
            <div className="admin-glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Tabla Resumen</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[15px]">
                  <thead className="bg-black/20 text-emerald-100/80 text-[12px] uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Estado</th>
                      <th className="px-5 py-3 text-right font-semibold">Cantidad</th>
                      <th className="px-5 py-3 text-right font-semibold">Monto Total</th>
                      <th className="px-5 py-3 text-right font-semibold">Monto Pagado</th>
                      <th className="px-5 py-3 text-right font-semibold">Saldo Pendiente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8 text-white/90">
                    {estados.map((estado) => {
                      const cfg = getEstadoConfig(estado.nombre);
                      return (
                        <tr key={estado.idEstadoReserva} className="hover:bg-white/6 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className={cfg.color}>{cfg.icon}</span>
                              <span className="font-medium capitalize">{estado.nombre}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-semibold">{estado.cantidad}</td>
                          <td className="px-5 py-3 text-right">{fmtMoney(estado.montoTotal)}</td>
                          <td className="px-5 py-3 text-right text-emerald-300 font-medium">
                            {fmtMoney(estado.montoPagado)}
                          </td>
                          <td className="px-5 py-3 text-right text-amber-300 font-bold">
                            {fmtMoney(estado.saldoPendiente)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-black/20 font-bold text-white">
                    <tr>
                      <td className="px-5 py-3">Total</td>
                      <td className="px-5 py-3 text-right">{totalGeneral?.cantidad ?? 0}</td>
                      <td className="px-5 py-3 text-right">
                        {fmtMoney(totalGeneral?.montoTotal ?? 0)}
                      </td>
                      <td className="px-5 py-3 text-right text-emerald-300">
                        {fmtMoney(totalGeneral?.montoPagado ?? 0)}
                      </td>
                      <td className="px-5 py-3 text-right text-amber-300">
                        {fmtMoney(totalGeneral?.saldoPendiente ?? 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContablePage;
