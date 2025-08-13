export const getPrecioHabitacion = (habitaciones: any, idHabitacion: any) => {
    const hab = habitaciones?.datos?.find(
      (h: any) => Number(h.idHabitacion) === Number(idHabitacion)
    );
    return typeof hab?.precio === "number" ? hab.precio : 1000;
  };