import { StateStatus } from ".";

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

export interface ReservasState {
  reservas: Reserva[];
  status: StateStatus;
  error: string | null;
}