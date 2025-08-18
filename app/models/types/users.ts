import { SortOrder } from ".";

export interface Usuario {
	idUsuario: number;
	email: string;
	nombre: string;
	clave: string;
}

export interface LoginCredentials {
	email: string;
	clave: string;
}

export interface TipoUsuario {
	nombre: string;
	idTipoUsuario: number;
	activo: boolean;
}

export interface UserState {
	loading: boolean;
	accessToken: string | null;
	error: string | null;
	datos: Usuario[];
	page: number;
	pageSize: number;
	total: number;
	sortOrder: SortOrder;
	sortField: string;
	tiposUsuarios: TipoUsuario[];
	currentUser: UserPerfil;
}

export type UserPerfil = {
	idUsuario: number;
	nombre: string;
	email: string;
	idTipoUsuario: number;
  };