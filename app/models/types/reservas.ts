import { StateStatus } from ".";

export enum TipoReserva {
  CheckIn = "check-in",
  CheckOut = "check-out",
  Reservado = "reservado",
  Cancelado = "cancelado",
}

export type Reserva = {
  id: string; // idReserva como string
  numeroHab: number; // número de la habitación
  ingreso: string; // fechaDesde (ISO string)
  egreso: string;  // fechaHasta (ISO string)
  huespedNombre: string; // nombre completo del huésped
  estadoDeReserva: TipoReserva; // string o enum con valores como "reservado", "check-in", etc.
  telefonoHuesped?: string; // opcional
  montoPagado: number; // agregado para claridad en la tabla
  total: number; // monto total calculado
  dniHuesped?: string; // opcional
  emailHuesped?: string; // opcional
};

export interface ReservasState {
  reservas: Reserva[];
  status: StateStatus;
  error: string | null;
}