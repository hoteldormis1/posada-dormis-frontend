"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchContableExportar } from "@/lib/store/utils";
import { StateStatus } from "@/models/types";
import { LoadingSpinner } from "@/components";
import { toYMDLocal } from "@/utils/helpers/date";
import { exportarCSV, exportarPDF, ColumnaExport } from "@/utils/helpers/exportar";
import {
  FaFileCsv,
  FaFilePdf,
  FaFilter,
  FaDownload,
  FaTable,
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

const ESTADOS_OPCIONES = [
  { value: "", label: "Todos los estados" },
  { value: "pendiente", label: "Pendiente" },
  { value: "confirmada", label: "Confirmada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "checkin", label: "Check-in" },
  { value: "checkout", label: "Check-out" },
];

// ─────────────────────────── Componente ───────────────────────────

const ReportesPage: React.FC = () => {
  const dispatch = useAppDispatch<AppDispatch>();
  const { exportData, statusExport, errorExport } = useAppSelector(
    (state: RootState) => state.contable
  );

  // Filtros
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toYMDLocal(d);
  });
  const [toDate, setToDate] = useState(() => toYMDLocal(new Date()));
  const [estado, setEstado] = useState("");

  // Fetch inicial
  useEffect(() => {
    dispatch(fetchContableExportar({ from: fromDate, to: toDate }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFiltrar = () => {
    dispatch(
      fetchContableExportar({
        from: fromDate,
        to: toDate,
        ...(estado ? { estado } : {}),
      })
    );
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

  // Handlers de exportación
  const estadoLabel = estado ? ESTADOS_OPCIONES.find((e) => e.value === estado)?.label : "Todos";
  const rangoLabel =
    exportData?.range
      ? `${fmtDate(exportData.range.from)} al ${fmtDate(exportData.range.to)}`
      : "";
  const filenameBase = `reservas_${estado || "todas"}_${fromDate}_${toDate}`;

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
    <div className="bg-background w-full min-h-full overflow-auto pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reportes</h1>
            <p className="text-sm text-gray-500 mt-1">
              Exportación de listados de reservas a CSV y PDF
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-gray-400" size={14} />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Filtros
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Fecha desde
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="block w-full text-sm rounded-lg bg-gray-50 border-2 border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Fecha hasta
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="block w-full text-sm rounded-lg bg-gray-50 border-2 border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Estado
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="block w-full text-sm rounded-lg bg-gray-50 border-2 border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {ESTADOS_OPCIONES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleFiltrar}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Loading / Error */}
        {statusExport === StateStatus.loading && (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {statusExport === StateStatus.failed && (
          <div className="text-center py-10">
            <p className="text-red-600 font-medium">{errorExport}</p>
          </div>
        )}

        {statusExport === StateStatus.succeeded && exportData && (
          <>
            {/* Resumen rápido + Botones de exportación */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Info */}
                <div className="flex flex-wrap items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-700">{resumen?.total ?? 0}</p>
                    <p className="text-xs text-gray-500 font-medium">Reservas</p>
                  </div>
                  <div className="hidden sm:block h-10 w-px bg-gray-200" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-800">
                      {fmtMoney(resumen?.montoTotal ?? 0)}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">Monto Total</p>
                  </div>
                  <div className="hidden sm:block h-10 w-px bg-gray-200" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-700">
                      {fmtMoney(resumen?.montoPagado ?? 0)}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">Pagado</p>
                  </div>
                  <div className="hidden sm:block h-10 w-px bg-gray-200" />
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-600">
                      {fmtMoney(resumen?.saldoPendiente ?? 0)}
                    </p>
                    <p className="text-xs text-gray-500 font-medium">Saldo</p>
                  </div>
                </div>

                {/* Botones de exportación */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportCSV}
                    disabled={!datosFormateados.length}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <FaFileCsv size={16} />
                    Exportar CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    disabled={!datosFormateados.length}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium text-sm rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <FaFilePdf size={16} />
                    Exportar PDF
                  </button>
                </div>
              </div>
              {exportData.range && (
                <p className="text-xs text-gray-400 mt-3">
                  <FaDownload className="inline mr-1" size={10} />
                  Período: {fmtDate(exportData.range.from)} al {fmtDate(exportData.range.to)}
                  {estado ? ` — Estado: ${estadoLabel}` : ""}
                </p>
              )}
            </div>

            {/* Tabla de preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <FaTable className="text-gray-400" size={16} />
                <h2 className="text-lg font-bold text-gray-800">
                  Vista previa ({datosFormateados.length} registros)
                </h2>
              </div>

              {datosFormateados.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <FaTable size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No hay reservas en el rango seleccionado</p>
                  <p className="text-sm mt-1">Ajustá los filtros para buscar resultados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
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
                    <tbody className="divide-y divide-gray-100">
                      {datosFormateados.map((r) => {
                        const estadoColor: Record<string, string> = {
                          pendiente: "bg-amber-100 text-amber-700",
                          confirmada: "bg-emerald-100 text-emerald-700",
                          cancelada: "bg-red-100 text-red-700",
                          checkin: "bg-blue-100 text-blue-700",
                          checkout: "bg-violet-100 text-violet-700",
                        };
                        const badge = estadoColor[r.estado as string] ?? "bg-gray-100 text-gray-700";

                        return (
                          <tr key={r.idReserva as number} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-700">
                              #{r.idReserva as number}
                            </td>
                            <td className="px-4 py-3">{r.huesped as string}</td>
                            <td className="px-4 py-3 text-gray-500">{r.dni as string}</td>
                            <td className="px-4 py-3 font-medium">{r.habitacion as string}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${badge}`}
                              >
                                {r.estado as string}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{r.fechaDesdeStr as string}</td>
                            <td className="px-4 py-3 text-gray-600">{r.fechaHastaStr as string}</td>
                            <td className="px-4 py-3 text-right">{r.montoTotalStr as string}</td>
                            <td className="px-4 py-3 text-right text-green-700 font-medium">
                              {r.montoPagadoStr as string}
                            </td>
                            <td className="px-4 py-3 text-right text-orange-600 font-bold">
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
