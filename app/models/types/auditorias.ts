import { SortOrder } from ".";

export interface Auditoria {
	id: number;
	idUsuario: number | null;
	status: number | null;
	ruta: string;
	metodo: string;
	accion: string;
	fecha: string;
	datos: unknown;
	emailUsuario?: string;
	nombreUsuario?: string;
}

export interface AuditoriasState {
	datos: Auditoria[];
	loading: boolean;
	error: string | null;
	page: number;
	pageSize: number;
	total: number;
	sortOrder: SortOrder;
	sortField: string;
}


export type FetchAuditoriasResponse = {
	data: Auditoria[];
	page: number;
	pageSize: number;
	total: number;
};