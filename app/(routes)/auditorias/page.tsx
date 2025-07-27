"use client";
import React, { useMemo } from "react";
import { LoadingSpinner, TableComponent } from "@/components";
import { pantallaPrincipalEstilos } from "@/styles/global-styles";
import {
	fetchAuditorias,
	setAuditoriaPage,
	setAuditoriaPageSize,
} from "@/lib/store/utils/auditorias/auditoriasSlice";
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
				{loading && <LoadingSpinner />}
				{!loading && !error && (
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
