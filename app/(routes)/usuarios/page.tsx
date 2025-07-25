"use client";

import React, { useEffect, useMemo } from "react";
import {
	fuenteDeTitulo,
	pantallaPrincipalEstilos,
} from "@/styles/global-styles";
import { AppDispatch, RootState } from "@/lib/store/store";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchUsuarios } from "@/lib/store/utils/user/userSlice";
import { useToastAlert } from "@/utils/hooks/useToastAlert";
import { TableComponent } from "@/components";

const Usuarios = () => {
	const dispatch = useAppDispatch<AppDispatch>();
	const { usuarios } = useAppSelector((state: RootState) => state.user);
	const { errorToast } = useToastAlert();

	// ✅ Solo hace fetch si usuarios está vacío
	useEffect(() => {
		if (usuarios.length === 0) {
			const fetchUsuariosTest = async () => {
				try {
					const action = await dispatch(fetchUsuarios());
					if (!fetchUsuarios.fulfilled.match(action)) {
						console.error("Error al obtener usuarios:", action.payload);
						errorToast(action.payload || "Ocurrió un error al obtener usuarios");
					}
				} catch (err) {
					console.error("Error inesperado:", err);
					errorToast("Error inesperado al obtener usuarios");
				}
			};

			fetchUsuariosTest();
		}
	}, [dispatch, errorToast, usuarios.length]);

	// ✅ useMemo evita recomputación innecesaria
	const usuariosMemo = useMemo(
		() =>
			usuarios.map((usuario) => ({
				id: String(usuario.idUsuario),
				...usuario,
			})),
		[usuarios]
	);

	const columns = useMemo(
		() => [
			{ header: "ID", key: "idUsuario" },
			{ header: "Nombre", key: "nombre" },
			{ header: "Email", key: "email" },
		],
		[]
	);

	return (
		<div className={pantallaPrincipalEstilos}>
			<label className={fuenteDeTitulo}>Usuarios</label>

			<TableComponent
				columns={columns}
				data={usuariosMemo}
				showFormActions={false}
				// onAdd={() => console.log("Agregar usuario")}
				// onEdit={(user) => console.log("Editar usuario:", user)}
			/>
		</div>
	);
};

export default Usuarios;
