"use client";

import React from "react";
import {
	fuenteDeTitulo,
	pantallaPrincipalEstilos,
} from "../_styles/global-styles";
import { Reserva, TipoReserva } from "@/_models/types";
import { TableComponent } from "@/_components";

const page = () => {
	const columns = [
		{ header: "Habitación", key: "numeroHab" },
		{ header: "Fecha de ingreso", key: "ingreso" },
		{ header: "Fecha de salida", key: "egreso" },
		{ header: "Huésped", key: "huespedNombre" },
		{ header: "Teléfono", key: "telefonoHuesped" },
		{ header: "Total", key: "total" },
		{ header: "Estado", key: "estadoDeReserva" },
	];

	const reservas = [
		{
			id: "1",
			numeroHab: 101,
			ingreso: "21/06/2025",
			egreso: "24/06/2025",
			huespedNombre: "Juan Pérez",
			telefonoHuesped: "+54 9 351 1234567",
			total: 10500,
			estadoDeReserva: TipoReserva.CheckIn,
		},
		{
			id: "2",
			numeroHab: 102,
			ingreso: "20/06/2025",
			egreso: "23/06/2025",
			huespedNombre: "Ana Gómez",
			telefonoHuesped: "+54 9 351 7654321",
			total: 13500,
			estadoDeReserva: TipoReserva.Reservado,
		},
		{
			id: "3",
			numeroHab: 103,
			ingreso: "19/06/2025",
			egreso: "21/06/2025",
			huespedNombre: "Carlos López",
			telefonoHuesped: "+54 9 351 9876543",
			total: 16000,
			estadoDeReserva: TipoReserva.CheckOut, // Cambié "mantenimiento" a "check-out"
		},
	];

	return (
		<div className={pantallaPrincipalEstilos}>
			<label className={fuenteDeTitulo}>Reservas</label>
			<div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12 m-auto">
				<TableComponent<Reserva>
					columns={columns}
					data={reservas}
					showFormActions={true}
					onAdd={() => null}
					onEdit={() => null}
				/>
			</div>

			{/* <Formulare
				toggleModal={toggleModal}
				type={dataFormulare.type}
				title={dataFormulare.title}
				data={dataFormulare.data}
				submitFunction={dataFormulare.submitFunction}
				submitBtnTitle={dataFormulare.submitBtnTitle}
				isOpen={isOpen}
				fields={[
					{ name: "Número", type: "number", db_name: "number", required: true, min: 1 },
    			{ name: "Precio", type: "number", db_name: "price", required: true, min: 1 },
					{
						name: "Tipo de habitaciones",
						type: "select",
						options: roomTypes.map((item: RoomTypes) => ({
							name: item.name,
							id: item._id,
						})),
						db_name: "typeId",
					},
					{ name: "Habilitado", type: "checkbox", db_name: "enabled" }
				]}
			/> */}
		</div>
	);
};

export default page;
