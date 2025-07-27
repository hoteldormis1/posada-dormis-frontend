export * from "./habitaciones"
export * from "./reservas"
export * from "./users"
export * from "./auditorias"

export type StateStatus = "idle" | "loading" | "succeeded" | "failed";
export type SortOrder = "ASC" | "DESC";

export type FetchParams = {
	page?: number;
	size?: number;
	search?: string;
	sortOrder?: string;
	sortField?: string;
};