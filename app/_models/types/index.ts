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
  numeroHab: number;            // Número de habitación reservada
  ingreso: string;              // Fecha de ingreso (ISO string o Date)
  egreso: string;               // Fecha de salida (ISO string o Date)
  huespedNombre: string;        
  telefonoHuesped: string;      
  total: number;                // Total a pagar o pagado
  estadoDeReserva: TipoReserva; 
};