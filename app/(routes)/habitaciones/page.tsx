"use client";

import React, { useMemo } from "react";
import { pantallaPrincipalEstilos } from "../../styles/global-styles";
import { LoadingSpinner, TableComponent } from "@/components";
// import { useToastAlert } from "@/utils/hooks/useToastAlert";
import { RootState } from "@/lib/store/store";
import { useEntityTable } from "@/hooks/useEntityTable";
import {
	fetchHabitaciones,
	setHabitacionesPage,
	setHabitacionesPageSize,
	// setHabitacionesSort,
} from "@/lib/store/utils/habitaciones/habitacionesSlice";

const Habitaciones = () => {
	const {
		datos,
		loading,
		error,
		page,
		pageSize,
		total,
		sortField,
		sortOrder,
		handlePageChange,
		handlePageSizeChange,
		handleSort,
		search,
		setSearch,
		handleSearch,
	} = useEntityTable({
		fetchAction: fetchHabitaciones,
		setPageAction: setHabitacionesPage,
		setPageSizeAction: setHabitacionesPageSize,
		selector: (state: RootState) => state.habitaciones,
		defaultSortField: "numero",
		defaultSortOrder: "ASC",
	});

	const columns = useMemo(
		() => [
			{ header: "Número", key: "numero" },
			{ header: "Tipo", key: "tipo" },
			{ header: "Precio", key: "precio" },
			{ header: "Estado", key: "estado" },
		],
		[]
	);

	const data = useMemo(() => {
		if (!datos || !Array.isArray(datos)) return [];
		return datos.map((h) => ({
			id: String(h.idHabitacion),
			...h,
		}));
	}, [datos]);

	return (
		<div className={pantallaPrincipalEstilos}>
			<div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
				{loading && <LoadingSpinner />}
				{!loading && !error && (
					<TableComponent
						title="Habitaciones"
						columns={columns}
						data={data}
						showFormActions={true}
						showPagination={true}
						currentPage={page}
						pageSize={pageSize}
						totalItems={total}
						sortField={sortField}
						sortOrder={sortOrder}
						onPageChange={handlePageChange}
						onPageSizeChange={handlePageSizeChange}
						onSort={handleSort}
						search={search}
						onSearchChange={setSearch}
						onSearchSubmit={handleSearch}
						inputOptions={[
							{ key: "numero", type: "text", label: "Numero" },
							{
								key: "estado",
								type: "select",
								label: "Estado de habitación",
								options: [{ value: "test1", label: "test1" }],
							},
							{
								key: "tipo",
								type: "select",
								label: "Tipo de habitación",
								options: [{ value: "test1", label: "test1" }],
							},
						]}
					/>
				)}
			</div>
		</div>
	);
};

export default Habitaciones;
