"use client";

import React, { useMemo } from "react";
import { RootState } from "@/lib/store/store";
import {
	fetchUsuarios,
	setUsuarioPage,
	setUsuarioPageSize,
} from "@/lib/store/utils/user/userSlice";
import { useEntityTable } from "@/hooks/useEntityTable";
import { LoadingSpinner, TableComponent } from "@/components";
import { pantallaPrincipalEstilos } from "@/styles/global-styles";

const Usuarios = () => {
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
		sortField,
		sortOrder,
		handleSort,
	} = useEntityTable({
		fetchAction: fetchUsuarios,
		setPageAction: setUsuarioPage,
		setPageSizeAction: setUsuarioPageSize,
		selector: (state: RootState) => state.user,
		defaultSortField: "idUsuario",
		defaultSortOrder: "ASC",
	});

	// Columnas de la tabla
	const columns = useMemo(
		() => [
			{ header: "ID", key: "idUsuario" },
			{ header: "Nombre", key: "nombre" },
			{ header: "Email", key: "email" },
		],
		[]
	);

	// Formateo de datos
	const data = useMemo(
		() =>
			datos.map((u) => ({
				id: String(u.idUsuario),
				...u,
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
						title="Usuarios"
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

export default Usuarios;
