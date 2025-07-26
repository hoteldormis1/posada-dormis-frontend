"use client";
import React, { useEffect, useMemo, useState } from "react";
import { LoadingSpinner, TableComponent } from "@/components";
import { pantallaPrincipalEstilos } from "@/styles/global-styles";
import { fetchAuditorias, setAuditoriaPage, setAuditoriaPageSize } from "@/lib/store/utils/auditorias/auditoriasSlice";
import { RootState } from "@/lib/store/store";
import { useEntityTable } from "@/utils/hooks/useEntityTable";

const Auditorias = () => {
  const {
    datos,
    loading,
    error,
    page,
    pageSize,
    total,
    search,
    setSearch,
    handleSearch,
    handlePageChange,
    handlePageSizeChange,
    handleSort,
    sortField,
    sortOrder,
  } = useEntityTable({
    fetchAction: fetchAuditorias,
    setPageAction: setAuditoriaPage,
    setPageSizeAction: setAuditoriaPageSize,
    selector: (state: RootState) => state.auditorias,
    defaultSortField: "fecha",
    defaultSortOrder: "DESC",
  });

   const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loading) {
      timeout = setTimeout(() => setShowSpinner(true), 300); // espera 300ms
    } else {
      setShowSpinner(false);
    }
    return () => clearTimeout(timeout);
  }, [loading]);

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
      datos.map((a) => ({
        id: String(a.id),
        metodo: a.metodo,
        ruta: a.ruta,
        accion: a.accion,
        emailUsuario: a.emailUsuario ?? "—",
        status: a.status ?? "—",
        fecha: new Date(a.fecha).toLocaleString("es-AR"),
      })),
    [datos]
  );

  return (
    <div className={pantallaPrincipalEstilos}>
      <div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
        {showSpinner  && <LoadingSpinner />}
        {!loading && error && <p className="text-red-500 text-center mt-10">{error}</p>}
        {!loading && !error && data.length === 0 && <p className="text-center mt-10">No hay auditorías registradas</p>}
        {!loading && !error && data.length > 0 && (
          <TableComponent
            columns={columns}
            data={data}
            showPagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={total}
            title="Auditorías"
            search={search}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearch}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />
        )}
      </div>
    </div>
  );
};

export default Auditorias;
