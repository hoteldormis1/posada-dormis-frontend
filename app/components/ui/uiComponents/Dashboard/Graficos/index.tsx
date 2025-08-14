"use client";

import React, { useMemo } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store/store";
import { fuenteDeSubtitulo } from "@/styles/global-styles";
import {
  GraficoCantidadDeReservas,
  GraficoCantidadDeIngresos,
  // GraficoPieEstadoHabitaciones,
} from "@/components/index";
// import TablaHabitaciones from "./Widgets/TablaReservas";

type TelemetryPoint = {
  bucket: string;      // ISO
  label?: string;      // p.ej. "20/8"
  count: number;       // cantidad
  sum?: number;        // ventas ($)
};

const fallbackLabel = (iso: string) => {
  const d = new Date(iso);
  const dd = String(d.getUTCDate());
  const mm = String(d.getUTCMonth() + 1);
  return `${dd}/${mm}`;
};

const Graficos: React.FC = () => {
  const { datos, status, error } = useAppSelector((s: RootState) => s.dashboards);

  const tele = datos?.totals?.telemetria;
  const reservasSeries = (tele?.reservas || []) as TelemetryPoint[];
  const ventasSeries   = (tele?.ventas   || []) as TelemetryPoint[];

  // Transformo para los componentes de gráfico
  const reservasData = useMemo(
    () =>
      reservasSeries.map((p) => ({
        label: p.label || fallbackLabel(p.bucket),
        value: p.count,
        bucket: p.bucket,
      })),
    [reservasSeries]
  );

  const ventasCountData = useMemo(
    () =>
      ventasSeries.map((p) => ({
        label: p.label || fallbackLabel(p.bucket),
        value: p.count,
        bucket: p.bucket,
      })),
    [ventasSeries]
  );

  const ventasSumData = useMemo(
    () =>
      ventasSeries.map((p) => ({
        label: p.label || fallbackLabel(p.bucket),
        value: p.sum ?? 0,
        bucket: p.bucket,
      })),
    [ventasSeries]
  );

  const tarjeta = (titulo: string, contenido: React.ReactNode, key: string | number) => (
    <div
      key={key}
      className="flex flex-col p-6 border border-gray-300 shadow-md min-h-[300px] max-h-[500px] bg-white"
    >
      <label className={fuenteDeSubtitulo}>{titulo}</label>
      <div className="mt-4 flex-1">{contenido}</div>
    </div>
  );

  if (status === "loading") {
    return (
      <div className="pt-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[0, 1].map((i) =>
            tarjeta(
              "Cargando…",
              <div className="animate-pulse h-full rounded-lg bg-gray-100" />,
              i
            )
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-8 w-full">
        <div className="text-red-600">Error: {String(error)}</div>
      </div>
    );
  }

  const hayReservas = reservasData.length > 0;
  const hayVentas = ventasCountData.length > 0;
  
  return (
    <div className="pt-4 w-full bg-white/70 shadow-md rounded-xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
        {tarjeta(
          "Cantidad de reservas",
          hayReservas ? (
            <GraficoCantidadDeReservas data={reservasData} className="h-full"/>
          ) : (
            <div className="text-sm text-gray-500">Sin datos en el rango seleccionado.</div>
          ),
          "reservas"
        )}

        {tarjeta(
          "Ingresos",
          hayVentas ? (
            <GraficoCantidadDeIngresos   data={ventasSumData} className="h-full" />
          ) : (
            <div className="text-sm text-gray-500">Sin datos en el rango seleccionado.</div>
          ),
          "ventas"
        )}
      </div>

      {/* Pie de actualización */}
      {/*datos?.lastUpdated && (
        <div className="mt-4 text-xs text-gray-500">
          Actualizado: {new Date(datos.lastUpdated).toLocaleString("es-AR")}
        </div>
      )*/}
    </div>
  );
};

export default Graficos;
