"use client";

import React, { useEffect, useMemo } from "react";
import {
  fuenteDeTitulo,
  pantallaPrincipalEstilos,
} from "../../styles/global-styles";
import { TableComponent } from "@/components";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchReservas, Reserva } from "@/lib/store/utils/reservas/reservasSlice";
import { useToastAlert } from "@/utils/hooks/useToastAlert";

const Reservas: React.FC = () => {
  const dispatch = useAppDispatch<AppDispatch>();
  const { reservas, status } = useAppSelector((state: RootState) => state.reservas);
  const { errorToast } = useToastAlert();

  // Fetch de reservas al iniciar
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchReservas()).then((action) => {
        if (fetchReservas.rejected.match(action)) {
          errorToast(action.payload || "Error al obtener reservas");
        }
      });
    }
  }, [dispatch, status, errorToast]);

  // Columnas de la tabla
  const columns = useMemo(
    () => [
      { header: "Habitación", key: "numeroHab" },
      { header: "Fecha de ingreso", key: "ingreso" },
      { header: "Fecha de salida", key: "egreso" },
      { header: "Huésped", key: "huespedNombre" },
      { header: "Teléfono", key: "telefonoHuesped" },
      { header: "Monto pagado", key: "montoPagado" },
      { header: "Total", key: "total" },
      { header: "Estado", key: "estadoDeReserva" },
    ],
    []
  );

  // Datos para la tabla
  const data = useMemo(
    () => reservas,
    [reservas]
  );

  // Renderizado
  return (
    <div className={pantallaPrincipalEstilos}>
      <h1 className={fuenteDeTitulo}>Reservas</h1>
      <div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
        {status === "loading" ? (
          <p className="text-center mt-10">Cargando reservas...</p>
        ) : data.length === 0 ? (
          <p className="text-center mt-10">No hay reservas registradas</p>
        ) : (
          <TableComponent<Reserva>
            columns={columns}
            data={data}
            showFormActions={false}
          />
        )}
      </div>
    </div>
  );
};

export default Reservas;
