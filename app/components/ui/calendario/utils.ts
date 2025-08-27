import { toYMD } from "@/utils/helpers/date";
import { Booking } from "./Calendario";

  

export const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

  // Agrupa días consecutivos por número de habitación y arma bookings end-exclusive
  export function buildBookingsFromByDate(
    byDate: Array<{ date: string; roomNumbers?: number[] | null }>,
    MS_PER_DAY: number
  ): Booking[] {
    if (!Array.isArray(byDate) || byDate.length === 0) return [];
  
    const sorted = [...byDate].sort((a, b) => a.date.localeCompare(b.date));
    const openStart = new Map<number, string>();
    const lastDate = new Map<number, string>();
    const result: Booking[] = [];
  
    const closeSegment = (roomNumber: number) => {
      const start = openStart.get(roomNumber);
      const endInc = lastDate.get(roomNumber);
      if (!start || !endInc) return;
      const endExc = toYMD(addDays(new Date(endInc), 1)); // end exclusive
      result.push({
        id: `bydate-${roomNumber}-${start}-${endInc}`,
        roomId: roomNumber,
        start,
        end: endExc,
        status: "confirmed",
      });
      openStart.delete(roomNumber);
      lastDate.delete(roomNumber);
    };
  
    for (const day of sorted) {
      const ymd = day.date;
      const numbers = new Set<number>(
        (day.roomNumbers ?? []).map(Number).filter(Number.isFinite)
      );
  
      // cerrar segmentos que no continúan hoy
      for (const rn of Array.from(lastDate.keys())) {
        if (!numbers.has(rn)) closeSegment(rn);
      }
  
      // abrir o extender
      numbers.forEach((rn) => {
        const prev = lastDate.get(rn);
        if (!prev) {
          openStart.set(rn, ymd);
          lastDate.set(rn, ymd);
        } else {
          const prevDate = new Date(prev);
          const nextDate = new Date(ymd);
          const diffDays = Math.round(
            (nextDate.getTime() - prevDate.getTime()) / MS_PER_DAY
          );
          if (diffDays === 1) {
            lastDate.set(rn, ymd);
          } else {
            closeSegment(rn);
            openStart.set(rn, ymd);
            lastDate.set(rn, ymd);
          }
        }
      });
    }
  
    // cerrar pendientes
    for (const rn of Array.from(lastDate.keys())) closeSegment(rn);
  
    return result;
  }