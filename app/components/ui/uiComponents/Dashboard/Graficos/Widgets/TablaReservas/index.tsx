"use client";

import React from "react";
import { TableComponent } from "@/components";
import { Reserva, TipoReserva } from "@/models/types";

const TablaReservas = () => {
	const columns = [
			{ header: "Habitación", key: "numeroHab" },
			{ header: "Ingreso", key: "ingreso" },
			{ header: "Salida", key: "egreso" },
			{ header: "Huésped", key: "huespedNombre" },
			{ header: "Estado", key: "estadoDeReserva" },
		];
	
		const reservas = [
			{
				id: "1",
				numeroHab: 101,
				ingreso: "21/06/2025",
				egreso: "24/06/2025",
				huespedNombre: "Juan Pérez",
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
			<div className={"w-full"}>
				<TableComponent<Reserva>
					columns={columns}
					data={reservas}
					// onAdd={() => null}
					onEdit={() => null}
				/>
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

export default TablaReservas;
