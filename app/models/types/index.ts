export type Room = {
	id: string;
	numero: number;
	tipo: string;              // Ej: "doble", "suite"
	habilitada: boolean;
	precio: number;
};

export enum TipoReserva {
  CheckIn = "check-in",
  CheckOut = "check-out",
  Reservado = "reservado",
  Cancelado = "cancelado",
}

export type Reserva = {
  id: string;
  numeroHab: number;
  ingreso: string;
  egreso: string;
  huespedNombre: string;
  estadoDeReserva: TipoReserva;
  telefonoHuesped?: string; // ✅ opcional
  total?: number;           // ✅ opcional
};