"use client";

import React, { useEffect, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import {
  fetchAuditorias,
  setAuditoriaPage,
  setAuditoriaPageSize,
} from "@/lib/store/utils/auditorias/auditoriasSlice";
import { TableComponent } from "@/components";
import {
  fuenteDeTitulo,
  pantallaPrincipalEstilos,
} from "@/styles/global-styles";

const Auditorias = () => {
  const dispatch = useAppDispatch<AppDispatch>();
  const { lista, loading, error, page, pageSize, total } = useAppSelector(
    (state: RootState) => state.auditorias
  );
  const { accessToken } = useAppSelector((state: RootState) => state.user);

  // Fetch inicial y cuando cambian page o pageSize
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchAuditorias({ page, size: pageSize }));
    }
  }, [accessToken, page, pageSize, dispatch]);

  const columns = useMemo(
    () => [
      { header: "Método", key: "metodo" },
      { header: "Ruta", key: "ruta" },
      { header: "Acción", key: "accion" },
      { header: "Usuario", key: "emailUsuario" },
      { header: "Status", key: "status" },
      { header: "Fecha", key: "fecha" },
    ],
    []
  );

  const data = useMemo(
    () =>
      lista.map((a) => ({
        id: String(a.id),
        metodo: a.metodo,
        ruta: a.ruta,
        accion: a.accion,
        emailUsuario: a.emailUsuario ?? "—",
        status: a.status ?? "—",
        fecha: new Date(a.fecha).toLocaleString("es-AR"),
      })),
    [lista]
  );

  // Callbacks para manejar el paginado
  const handlePageChange = useCallback(
    (newPage: number) => {
      dispatch(setAuditoriaPage(newPage));
      dispatch(fetchAuditorias({ page: newPage, size: pageSize }));
    },
    [dispatch, pageSize]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      dispatch(setAuditoriaPageSize(newSize));
      dispatch(fetchAuditorias({ page: 1, size: newSize }));
    },
    [dispatch]
  );

  return (
    <div className={pantallaPrincipalEstilos}>
      <label className={fuenteDeTitulo}>Auditorías</label>
      <div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
        {loading ? (
          <p className="text-center mt-10">Cargando auditorías...</p>
        ) : error ? (
          <p className="text-red-500 text-center mt-10">{error}</p>
        ) : data.length === 0 ? (
          <p className="text-center mt-10">No hay auditorías registradas</p>
        ) : (
          <TableComponent
            columns={columns}
            data={data}
            showFormActions={false}
            showPagination={true}
            currentPage={page}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
};

export default Auditorias;
