/** Una habitación en el timeline */
export type Room = {
    id: string | number;   // ID único (puede ser idHabitacion o número)
    name: string;          // Nombre a mostrar (ej. "Habitación 101")
    numero: number;        // Número de la habitación
  };
  
  /** Una reserva a mostrar en el timeline */
  export type Booking = {
    id: string | number;   // ID único de la reserva
    roomId: string | number; // Referencia a Room.id
    start: string | Date;  // Fecha de inicio (inclusive)
    end: string | Date;    // Fecha de fin (exclusive)
    guest?: string;        // Nombre del huésped
    price?: number;        // Precio total o parcial
    status?: "unconfirmed" | "confirmed" | "checkin" | "checkout" | "paid" | string;
    rightTopLabel?: string;     // Etiqueta superior derecha opcional
    rightBottomLabel?: string;  // Etiqueta inferior derecha opcional
  };
  
  /** Rango seleccionado con el mouse en el calendario */
  export type DateRange = {
    start: Date;              // Fecha de inicio (inclusive)
    end: Date;                // Fecha de fin (exclusive)
    roomId: string | number;  // Habitación seleccionada
  };