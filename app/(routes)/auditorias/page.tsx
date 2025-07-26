"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchAuditorias,
  setAuditoriaPage,
  setAuditoriaPageSize,
} from "@/lib/store/utils/auditorias/auditoriasSlice";
import { LoadingSpinner, TableComponent } from "@/components";
import { pantallaPrincipalEstilos } from "@/styles/global-styles";
import { RootState, AppDispatch } from "@/lib/store/store";

const Auditorias = () => {
  const dispatch: AppDispatch = useAppDispatch();
  const { lista, loading, error, page, pageSize, total } = useAppSelector(
    (state: RootState) => state.auditorias
  );
  const { accessToken } = useAppSelector((state: RootState) => state.user);

  const [search, setSearch] = useState("");

  // Fetch inicial
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchAuditorias({ page, size: pageSize, search }));
    }
  }, [accessToken, page, pageSize, dispatch]);

  const handleSearch = (e) => {
	e.preventDefault()
    dispatch(setAuditoriaPage(1)); // reset a la primera página
    dispatch(fetchAuditorias({ page: 1, size: pageSize, search }));
  };

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

  return (
    <div className={pantallaPrincipalEstilos}>
      <div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
        {loading && <LoadingSpinner />}

        {!loading && error && (
          <p className="text-red-500 text-center mt-10">{error}</p>
        )}

        {!loading && !error && data.length === 0 && (
          <p className="text-center mt-10">No hay auditorías registradas</p>
        )}

        {!loading && !error && data.length > 0 && (
          <TableComponent
            columns={columns}
            data={data}
            showPagination={true}
            currentPage={page}
            pageSize={pageSize}
            totalItems={total}
            title="Auditorías"
            search={search}
            onSearchChange={(value) => setSearch(value)}
            onSearchSubmit={(e?: React.FormEvent | React.KeyboardEvent)=>handleSearch(e)} // nuevo prop para Enter o click
            onPageChange={(newPage) => {
              dispatch(setAuditoriaPage(newPage));
              dispatch(
                fetchAuditorias({
                  page: newPage,
                  size: pageSize,
                  search,
                })
              );
            }}
            onPageSizeChange={(newSize) => {
              dispatch(setAuditoriaPageSize(newSize));
              dispatch(
                fetchAuditorias({
                  page: 1,
                  size: newSize,
                  search,
                })
              );
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Auditorias;
