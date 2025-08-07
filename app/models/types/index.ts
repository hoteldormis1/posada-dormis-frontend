export * from "./habitaciones"
export * from "./reservas"
export * from "./users"
export * from "./auditorias"
export * from "./form"

export enum StateStatus {
	idle = "idle",
	loading = "loading",
	succeeded = "succeeded",
	failed = "failed",
}

export enum SortOrder {
	asc = "ASC",
	desc = "DESC"
}

export type FetchParams = {
	page?: number;
	size?: number;
	search?: string;
	sortOrder?: string;
	sortField?: string;
};