"use client";

import React from "react";
import {
	fuenteDeTitulo,
	pantallaPrincipalEstilos,
} from "../_styles/global-styles";
import { TableComponent } from "@/_components";
import { Room } from "@/_models/types";

const Habitaciones = () => {
	const columns = [
		{ header: "Número", key: "numero" },
		{ header: "Tipo", key: "tipo" },
		{ header: "Precio", key: "precio" },
		{ header: "Habilitada", key: "habilitada" },
	];

	const rooms: Room[] = [
		{
			id: "1",
			numero: 101,
			tipo: "Individual",
			precio: 3500,
			habilitada: true,
		},
		{
			id: "2",
			numero: 102,
			tipo: "Doble",
			precio: 4500,
			habilitada: true,
		},
		{
			id: "3",
			numero: 103,
			tipo: "Suite",
			precio: 8000,
			habilitada: false,
		},
	];

	return (
		<div className={pantallaPrincipalEstilos}>
			<label className={fuenteDeTitulo}>Habitaciones</label>
			<div className="w-11/12 sm:w-10/12 md:w-9/12 xl:w-8/12">
				<TableComponent<Room>
					columns={columns}
					data={rooms}
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

export default Habitaciones;
