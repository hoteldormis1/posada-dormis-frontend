"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchContableResumen } from "@/lib/store/utils";
import { StateStatus } from "@/models/types";
import { LoadingSpinner } from "@/components";
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

// ─────────────────────────── Mapa de iconos/colores por estado ───────────────────────────

const estadoConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  pendiente: {
    icon: <FaClock size={22} />,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  confirmada: {
    icon: <FaCheckCircle size={22} />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  cancelada: {
    icon: <FaTimesCircle size={22} />,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  checkin: {
    icon: <FaSignInAlt size={22} />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  checkout: {
    icon: <FaSignOutAlt size={22} />,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
};

const defaultConfig = {
  icon: <FaChartBar size={22} />,
  color: "text-gray-600",
  bg: "bg-gray-50",
  border: "border-gray-200",
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

  // Preset activo — default "MES"
  const [preset, setPreset] = useState<Preset>("MES");

  // Rango de fechas en dd/mm/yyyy (para UI) — se inicializa con "Este mes"
  const [fromUI, setFromUI] = useState(() => getRangeFromPreset("MES").fromUI);
  const [toUI, setToUI] = useState(() => getRangeFromPreset("MES").toUI);

  // Fetch inicial con rango del mes actual
  useEffect(() => {
    const { fromISO, toISO } = getRangeFromPreset("MES");
    dispatch(fetchContableResumen({ from: fromISO, to: toISO }));
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handler de preset
  const handlePreset = (p: Preset) => {
    setPreset(p);
    if (p === "PERSONALIZADO") {
      // Poner inicio/fin del mes actual como default en los inputs
      const { fromUI: fUI, toUI: tUI } = getRangeFromPreset("MES");
      setFromUI(fUI);
      setToUI(tUI);
      return; // no fetchear, espera al botón
    }
    const { fromISO, toISO, fromUI: fUI, toUI: tUI } = getRangeFromPreset(p);
    setFromUI(fUI);
    setToUI(tUI);
    dispatch(fetchContableResumen({ from: fromISO, to: toISO }));
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
    dispatch(fetchContableResumen({ from: fromISO, to: toISO }));
  };

  // Datos
  const estados = useMemo(() => resumen?.estados ?? [], [resumen]);
  const totalGeneral = resumen?.totalGeneral;

  return (
    <div className="bg-background w-full min-h-full overflow-auto pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vista Contable</h1>
            <p className="text-sm text-gray-500 mt-1">
              Resumen financiero de reservas por estado
            </p>
          </div>
        </div>

        {/* Filtro de fechas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-6 space-y-4">
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
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                >
                  Filtrar
                </button>
              </div>
            </div>
          )}

          {resumen?.range && (
            <p className="text-xs text-gray-400">
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
            <p className="text-red-600 font-medium">{errorResumen}</p>
          </div>
        )}

        {statusResumen === StateStatus.succeeded && resumen && (
          <>
            {/* Tarjeta de Total General */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaDollarSign className="text-blue-600" size={20} />
                Resumen General
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-700">
                    {totalGeneral?.cantidad ?? 0}
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-1">Total Reservas</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-xl sm:text-2xl font-bold text-green-700">
                    {fmtMoney(totalGeneral?.montoTotal ?? 0)}
                  </p>
                  <p className="text-xs text-green-600 font-medium mt-1">Monto Total</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-xl sm:text-2xl font-bold text-emerald-700">
                    {fmtMoney(totalGeneral?.montoPagado ?? 0)}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Monto Pagado</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-xl sm:text-2xl font-bold text-orange-700">
                    {fmtMoney(totalGeneral?.saldoPendiente ?? 0)}
                  </p>
                  <p className="text-xs text-orange-600 font-medium mt-1">Saldo Pendiente</p>
                </div>
              </div>
            </div>

            {/* Tarjetas por estado */}
            <h2 className="text-lg font-bold text-gray-800 mb-4">Desglose por Estado</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {estados.map((estado) => {
                const cfg = estadoConfig[estado.nombre] ?? defaultConfig;
                return (
                  <div
                    key={estado.idEstadoReserva}
                    className={`rounded-xl shadow-sm border ${cfg.border} ${cfg.bg} p-5 transition-all hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`${cfg.color}`}>{cfg.icon}</div>
                        <div>
                          <h3 className="font-bold text-gray-800 capitalize text-base">
                            {estado.nombre}
                          </h3>
                          <p className="text-xs text-gray-500">{estado.descripcion}</p>
                        </div>
                      </div>
                      <span
                        className={`text-2xl font-bold ${cfg.color}`}
                      >
                        {estado.cantidad}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Monto Total</span>
                        <span className="font-semibold text-gray-800">
                          {fmtMoney(estado.montoTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Monto Pagado</span>
                        <span className="font-semibold text-green-700">
                          {fmtMoney(estado.montoPagado)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                        <span className="text-gray-600 font-medium">Saldo Pendiente</span>
                        <span className="font-bold text-orange-600">
                          {fmtMoney(estado.saldoPendiente)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tabla resumen */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">Tabla Resumen</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Estado</th>
                      <th className="px-5 py-3 text-right font-semibold">Cantidad</th>
                      <th className="px-5 py-3 text-right font-semibold">Monto Total</th>
                      <th className="px-5 py-3 text-right font-semibold">Monto Pagado</th>
                      <th className="px-5 py-3 text-right font-semibold">Saldo Pendiente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {estados.map((estado) => {
                      const cfg = estadoConfig[estado.nombre] ?? defaultConfig;
                      return (
                        <tr key={estado.idEstadoReserva} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className={cfg.color}>{cfg.icon}</span>
                              <span className="font-medium capitalize">{estado.nombre}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-semibold">{estado.cantidad}</td>
                          <td className="px-5 py-3 text-right">{fmtMoney(estado.montoTotal)}</td>
                          <td className="px-5 py-3 text-right text-green-700 font-medium">
                            {fmtMoney(estado.montoPagado)}
                          </td>
                          <td className="px-5 py-3 text-right text-orange-600 font-bold">
                            {fmtMoney(estado.saldoPendiente)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 font-bold">
                    <tr>
                      <td className="px-5 py-3">Total</td>
                      <td className="px-5 py-3 text-right">{totalGeneral?.cantidad ?? 0}</td>
                      <td className="px-5 py-3 text-right">
                        {fmtMoney(totalGeneral?.montoTotal ?? 0)}
                      </td>
                      <td className="px-5 py-3 text-right text-green-700">
                        {fmtMoney(totalGeneral?.montoPagado ?? 0)}
                      </td>
                      <td className="px-5 py-3 text-right text-orange-600">
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
