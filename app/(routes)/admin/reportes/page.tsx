"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import { useReservasSocket } from "@/hooks/useReservasSocket";
import { fetchContableExportar, fetchDashboardSummary } from "@/lib/store/utils";
import { fetchContableOcupacion } from "@/lib/store/utils/contable/contableSlice";
import { StateStatus } from "@/models/types";
import { LoadingSpinner, GraficoCantidadDeReservas } from "@/components";
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
import { exportarCSV, exportarPDF, ColumnaExport } from "@/utils/helpers/exportar";
import {
  getEstadoReservaTheme,
  getEstadoReservaLabel,
  type EstadoReservaKey,
} from "@/utils/helpers/reservaEstado";
import {
  FaFileCsv,
  FaFilePdf,
  FaFilter,
  FaDownload,
  FaTable,
  FaChartBar,
} from "react-icons/fa";
import type { ReservaExportable } from "@/lib/store/utils/contable/contableSlice";

// ─────────────────────────── Columnas de exportación ───────────────────────────

const columnasExport: ColumnaExport[] = [
  { header: "ID", key: "idReserva" },
  { header: "Huésped", key: "huesped" },
  { header: "DNI", key: "dni" },
  { header: "Teléfono", key: "telefono" },
  { header: "Habitación", key: "habitacion" },
  { header: "Tipo Hab.", key: "tipoHabitacion" },
  { header: "Estado", key: "estado" },
  { header: "Fecha Desde", key: "fechaDesdeStr" },
  { header: "Fecha Hasta", key: "fechaHastaStr" },
  { header: "Monto Total", key: "montoTotalStr" },
  { header: "Monto Pagado", key: "montoPagadoStr" },
  { header: "Saldo Pendiente", key: "saldoPendienteStr" },
];

// ─────────────────────────── Helpers ───────────────────────────

const fmtMoney = (n: number) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 });

const fmtDateShort = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const REPORTES_LEGEND: EstadoReservaKey[] = [
  "confirmada",
  "checkin",
  "checkout",
];

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

const ReportesPage: React.FC = () => {
  const dispatch = useAppDispatch<AppDispatch>();
  const { exportData, statusExport, errorExport, ocupacion } = useAppSelector(
    (state: RootState) => state.contable
  );
  const teleReservas = useAppSelector(
    (state: RootState) => state.dashboards?.datos?.totals?.telemetria?.reservas ?? []
  );

  // Preset activo — default "MES"
  const [preset, setPreset] = useState<Preset>("MES");

  // Rango de fechas en dd/mm/yyyy (para UI) — se inicializa con "Este mes"
  const [fromUI, setFromUI] = useState(() => getRangeFromPreset("MES").fromUI);
  const [toUI, setToUI] = useState(() => getRangeFromPreset("MES").toUI);
  const [selectedEstadoKeys, setSelectedEstadoKeys] = useState<EstadoReservaKey[]>([
    "confirmada",
    "checkin",
    "checkout",
    "rechazada",
  ]);

  // Helpers para obtener ISO del state actual
  const currentFromISO = ddmmToISO(fromUI) || getRangeFromPreset("MES").fromISO;
  const currentToISO = ddmmToISO(toUI) || getRangeFromPreset("MES").toISO;

  /** Despacha los tres fetches en simultáneo */
  const fetchTodos = (fromISO: string, toISO: string, estados: EstadoReservaKey[] = selectedEstadoKeys) => {
    dispatch(fetchContableExportar({ from: fromISO, to: toISO, estados }));
    dispatch(fetchDashboardSummary({ from: fromISO, to: toISO, agruparPor: "day" }));
    dispatch(fetchContableOcupacion({ from: fromISO, to: toISO }));
  };

  // Fetch inicial con rango del mes actual
  useEffect(() => {
    const { fromISO, toISO } = getRangeFromPreset("MES");
    fetchTodos(fromISO, toISO, selectedEstadoKeys);
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Siempre apunta al refetch con los filtros actuales (evita stale closure)
  const refreshRef = useRef<() => void>(() => {});
  useEffect(() => {
    const fromISO = ddmmToISO(fromUI) || getRangeFromPreset("MES").fromISO;
    const toISO = ddmmToISO(toUI) || getRangeFromPreset("MES").toISO;
    refreshRef.current = () => fetchTodos(fromISO, toISO, selectedEstadoKeys);
  });

  // Socket: actualiza los reportes en tiempo real
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
    fetchTodos(fromISO, toISO, selectedEstadoKeys);
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
    fetchTodos(fromISO, toISO, selectedEstadoKeys);
  };

  const toggleEstadoFilter = (key: EstadoReservaKey) => {
    setSelectedEstadoKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      const safeNext = next.length > 0 ? next : prev;
      fetchTodos(currentFromISO, currentToISO, safeNext);
      return safeNext;
    });
  };

  const activarTodosEstados = () => {
    setSelectedEstadoKeys(REPORTES_LEGEND);
    fetchTodos(currentFromISO, currentToISO, REPORTES_LEGEND);
  };

  // Preparar datos con formatos de texto para export
  const datosFormateados = useMemo(() => {
    if (!exportData?.reservas) return [];
    return exportData.reservas.map((r: ReservaExportable) => ({
      ...r,
      fechaDesdeStr: fmtDateShort(r.fechaDesde),
      fechaHastaStr: fmtDateShort(r.fechaHasta),
      montoTotalStr: fmtMoney(r.montoTotal),
      montoPagadoStr: fmtMoney(r.montoPagado),
      saldoPendienteStr: fmtMoney(r.saldoPendiente),
    }));
  }, [exportData]);

  // Resúmenes rápidos
  const resumen = useMemo(() => {
    if (!exportData?.reservas) return null;
    const reservas = exportData.reservas;
    return {
      total: reservas.length,
      montoTotal: reservas.reduce((acc, r) => acc + r.montoTotal, 0),
      montoPagado: reservas.reduce((acc, r) => acc + r.montoPagado, 0),
      saldoPendiente: reservas.reduce((acc, r) => acc + r.saldoPendiente, 0),
    };
  }, [exportData]);

  // Datos para gráficos
  const fallbackLabel = (iso: string) => {
    const d = new Date(iso);
    return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
  };

  const reservasPorFechaData = useMemo(
    () =>
      teleReservas.map((p: { bucket: string; label?: string; count: number }) => ({
        label: p.label || fallbackLabel(p.bucket),
        value: p.count,
      })),
    [teleReservas]
  );

  const ocupacionPorFechaData = useMemo(
    () =>
      (ocupacion?.serie ?? []).map((p) => ({
        label: fallbackLabel(p.fecha + "T00:00:00Z"),
        value: p.porcentaje,
      })),
    [ocupacion]
  );

  // Handlers de exportación
  const estadoLabel = selectedEstadoKeys.length === REPORTES_LEGEND.length
    ? "Todos"
    : selectedEstadoKeys.map((k) => getEstadoReservaLabel(k)).join(", ");
  const rangoLabel =
    exportData?.range
      ? `${fmtDate(exportData.range.from)} al ${fmtDate(exportData.range.to)}`
      : "";
  const filenameBase = `reservas_${selectedEstadoKeys.join("-") || "todas"}_${currentFromISO}_${currentToISO}`;

  const handleExportCSV = () => {
    exportarCSV({
      filename: filenameBase,
      columnas: columnasExport,
      datos: datosFormateados,
    });
  };

  const handleExportPDF = () => {
    exportarPDF({
      filename: filenameBase,
      titulo: "Reporte de Reservas — Posada Dormi's",
      subtitulo: `Estado: ${estadoLabel} | Período: ${rangoLabel} | Total: ${resumen?.total ?? 0} reservas`,
      columnas: columnasExport,
      datos: datosFormateados,
    });
  };

  return (
    <div className="w-full min-h-full overflow-auto pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold admin-title">Reportes</h1>
            <p className="text-sm admin-subtitle mt-1">
              Exportación de listados de reservas a CSV y PDF
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="admin-glass-card p-4 sm:p-5 mb-6 space-y-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-emerald-100/55" size={14} />
            <h2 className="text-sm font-semibold text-emerald-100/75 uppercase tracking-wider">
              Filtros
            </h2>
          </div>

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
                  Buscar
                </button>
              </div>
            </div>
          )}

          {/* Filtro por estados (leyenda interactiva) */}
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            <button
              type="button"
              onClick={activarTodosEstados}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors bg-white/6 border-white/14 text-white/85 hover:bg-white/12"
            >
              Todos
            </button>
            {REPORTES_LEGEND.map((estadoKey) => {
              const theme = getEstadoReservaTheme(estadoKey);
              const isActive = selectedEstadoKeys.includes(estadoKey);
              return (
                <button
                  type="button"
                  key={estadoKey}
                  onClick={() => toggleEstadoFilter(estadoKey)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    isActive
                      ? "bg-white/10 border-white/30 text-white"
                      : "bg-transparent border-white/14 text-white/60 hover:bg-white/6 hover:text-white/80"
                  }`}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-[3px]"
                    style={{ backgroundColor: theme.hex.color }}
                  />
                  {getEstadoReservaLabel(estadoKey)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gráficos */}
        {(reservasPorFechaData.length > 0 || ocupacionPorFechaData.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Reservas por fecha */}
            <div className="admin-glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <FaChartBar className="text-emerald-300" size={16} />
                <h2 className="text-sm font-semibold text-emerald-100/75 uppercase tracking-wider">
                  Reservas por fecha
                </h2>
              </div>
              <div className="h-[260px]">
                {reservasPorFechaData.length > 0 ? (
                  <GraficoCantidadDeReservas
                    data={reservasPorFechaData}
                    className="h-full"
                    color="#3b82f6"
                    datasetLabel="Reservas"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-emerald-100/65">
                    Sin datos en el rango seleccionado
                  </div>
                )}
              </div>
            </div>

            {/* Ocupación por fecha */}
            <div className="admin-glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <FaChartBar className="text-cyan-300" size={16} />
                <h2 className="text-sm font-semibold text-emerald-100/75 uppercase tracking-wider">
                  Ocupación de habitaciones (%)
                </h2>
              </div>
              <div className="h-[260px]">
                {ocupacionPorFechaData.length > 0 ? (
                  <GraficoCantidadDeReservas
                    data={ocupacionPorFechaData}
                    className="h-full"
                    color="#8b5cf6"
                    datasetLabel="Ocupación %"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-emerald-100/65">
                    Sin datos en el rango seleccionado
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading / Error */}
        {statusExport === StateStatus.loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {statusExport === StateStatus.failed && (
          <div className="text-center py-10">
            <p className="text-red-300 font-medium">{errorExport}</p>
          </div>
        )}

        {statusExport === StateStatus.succeeded && exportData && (
          <>
            {/* Resumen rápido + Botones de exportación */}
            <div className="admin-glass-card p-5 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Info */}
                <div className="flex flex-wrap items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-200">{resumen?.total ?? 0}</p>
                    <p className="text-xs text-emerald-100/55 font-medium">Reservas</p>
                  </div>
                  <div className="hidden sm:block h-10 w-px bg-white/15" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">
                      {fmtMoney(resumen?.montoTotal ?? 0)}
                    </p>
                    <p className="text-xs text-emerald-100/55 font-medium">Monto Total</p>
                  </div>
                  <div className="hidden sm:block h-10 w-px bg-white/15" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-300">
                      {fmtMoney(resumen?.montoPagado ?? 0)}
                    </p>
                    <p className="text-xs text-emerald-100/55 font-medium">Pagado</p>
                  </div>
                  <div className="hidden sm:block h-10 w-px bg-white/15" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-300">
                      {fmtMoney(resumen?.saldoPendiente ?? 0)}
                    </p>
                    <p className="text-xs text-emerald-100/55 font-medium">Saldo</p>
                  </div>
                </div>

                {/* Botones de exportación */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportCSV}
                    disabled={!datosFormateados.length}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-[#062317] font-medium text-sm rounded-lg hover:bg-emerald-400 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <FaFileCsv size={16} />
                    Exportar CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    disabled={!datosFormateados.length}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white font-medium text-sm rounded-lg hover:bg-rose-400 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <FaFilePdf size={16} />
                    Exportar PDF
                  </button>
                </div>
              </div>
              {exportData.range && (
                <p className="text-xs text-emerald-100/65 mt-3">
                  <FaDownload className="inline mr-1" size={10} />
                  Período: {fmtDate(exportData.range.from)} al {fmtDate(exportData.range.to)}
                  {` — Estado(s): ${estadoLabel}`}
                </p>
              )}
            </div>

            {/* Tabla de preview */}
            <div className="admin-glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
                <FaTable className="text-emerald-100/55" size={16} />
                <h2 className="text-lg font-bold text-white">
                  Vista previa ({datosFormateados.length} registros)
                </h2>
              </div>

              {datosFormateados.length === 0 ? (
                <div className="text-center py-16 text-emerald-100/65">
                  <FaTable size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No hay reservas en el rango seleccionado</p>
                  <p className="text-sm mt-1">Ajustá los filtros para buscar resultados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[15px]">
                    <thead className="bg-black/20 text-emerald-100/80 text-[12px] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">ID</th>
                        <th className="px-4 py-3 text-left font-semibold">Huésped</th>
                        <th className="px-4 py-3 text-left font-semibold">DNI</th>
                        <th className="px-4 py-3 text-left font-semibold">Hab.</th>
                        <th className="px-4 py-3 text-left font-semibold">Estado</th>
                        <th className="px-4 py-3 text-left font-semibold">Desde</th>
                        <th className="px-4 py-3 text-left font-semibold">Hasta</th>
                        <th className="px-4 py-3 text-right font-semibold">Total</th>
                        <th className="px-4 py-3 text-right font-semibold">Pagado</th>
                        <th className="px-4 py-3 text-right font-semibold">Saldo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8 text-white/90">
                      {datosFormateados.map((r) => {
                        const badge = getEstadoReservaTheme(r.estado as string).tw.badgeSoft;

                        return (
                          <tr key={r.idReserva as number} className="hover:bg-white/6 transition-colors">
                            <td className="px-4 py-3 font-medium text-white">
                              #{r.idReserva as number}
                            </td>
                            <td className="px-4 py-3">{r.huesped as string}</td>
                            <td className="px-4 py-3 text-emerald-100/55">{r.dni as string}</td>
                            <td className="px-4 py-3 font-medium">{r.habitacion as string}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[12px] font-semibold capitalize ${badge}`}
                              >
                                {r.estado as string}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-emerald-100/65">{r.fechaDesdeStr as string}</td>
                            <td className="px-4 py-3 text-emerald-100/65">{r.fechaHastaStr as string}</td>
                            <td className="px-4 py-3 text-right">{r.montoTotalStr as string}</td>
                            <td className="px-4 py-3 text-right text-emerald-300 font-medium">
                              {r.montoPagadoStr as string}
                            </td>
                            <td className="px-4 py-3 text-right text-amber-300 font-bold">
                              {r.saldoPendienteStr as string}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportesPage;
