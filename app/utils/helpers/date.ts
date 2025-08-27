// src/utils/date.ts

/** ────────────────────────────────────────────────────────────────────────────
 *  Regex helpers
 *  ──────────────────────────────────────────────────────────────────────────── */
const RE_ISO_YMD = /^\d{4}-\d{2}-\d{2}$/;     // "YYYY-MM-DD"
const RE_DDMMYYYY = /^\d{2}\/\d{2}\/\d{4}$/;  // "dd/MM/yyyy"

export const isISO = (s?: string) => !!s && RE_ISO_YMD.test(s.trim());
export const isDDMMYYYY = (s?: string) => !!s && RE_DDMMYYYY.test(s.trim());

/** ────────────────────────────────────────────────────────────────────────────
 *  Tipos para UI
 *  ──────────────────────────────────────────────────────────────────────────── */
export type Preset = "HOY" | "SEMANA" | "MES" | "ANIO" | "PERSONALIZADO";
export type GroupBy = "day" | "month" | "year";

/** ────────────────────────────────────────────────────────────────────────────
 *  Utilidades básicas de fecha
 *  ──────────────────────────────────────────────────────────────────────────── */

/** Retorna "YYYY-MM-DD" para un Date (sin zona horaria en el string). */
export const toISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Para inputs <input type="date"> (mismo formato "YYYY-MM-DD"). */
export const toDateInputValue = (iso?: string) => {
  if (!iso) return "";
  // Si ya viene YYYY-MM-DD, devolvemos tal cual
  if (isISO(iso)) return iso;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : toISODate(d);
};

/** "YYYY-MM-DD" -> "dd/MM/yyyy" */
export const isoToDDMMYYYY = (iso: string): string => {
  if (!iso || iso.length < 10) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

/** "dd/MM/yyyy" -> "YYYY-MM-DD" (solo fecha, sin hora) */
export const ddmmToISO = (ddmmyyyy: string): string => {
  if (!isDDMMYYYY(ddmmyyyy)) return "";
  const [d, m, y] = ddmmyyyy.split("/");
  return `${y}-${m}-${d}`;
};

/**
 * Parsea "dd/MM/yyyy" a Date en hora 12:00 local para evitar saltos de día
 * por DST/UTC. Retorna null si es inválida.
 */
export const parseDDMMYYYY = (s?: string): Date | null => {
  if (!isDDMMYYYY(s)) return null;
  const [dd, mm, yyyy] = String(s).split("/");
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 12, 0, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Diferencia en noches entre dos "dd/MM/yyyy". Mínimo 1. */
export const diffNoches = (desde?: string, hasta?: string) => {
  const d1 = parseDDMMYYYY(desde);
  const d2 = parseDDMMYYYY(hasta);
  if (!d1 || !d2) return 1;
  const ms = d2.getTime() - d1.getTime();
  return Math.max(Math.ceil(ms / 86400000), 1);
};

/** Convierte strings variados a ISO completo (con hora), si puede. */
export const toISOFromFlexible = (s?: string) => {
  if (!s) return undefined;
  if (isDDMMYYYY(s)) {
    const [dd, mm, yyyy] = s.split("/");
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }
  if (isISO(s)) {
    // normalizamos a ISO completo UTC
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

/** Igual que la anterior pero devolviendo SOLO fecha "YYYY-MM-DD" si se puede. */
export const toISODateFromFlexible = (s?: string) => {
  const iso = toISOFromFlexible(s);
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : toISODate(d);
};

/** Parsea un string (dd/MM/yyyy, YYYY-MM-DD o lo que entienda Date) a ISO completo; fallback = now. */
export const parseDateWithFallbackISO = (dateString?: string) => {
  if (!dateString) return new Date().toISOString();
  if (isDDMMYYYY(dateString)) {
    const [day, month, year] = dateString.split("/");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};

export const toYMDLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};

/** ────────────────────────────────────────────────────────────────────────────
 *  Helpers de rango (semana/mes/año) – usando semana que inicia en Lunes
 *  ──────────────────────────────────────────────────────────────────────────── */
// Presets (sin depender de horas 23:59:59)
export const startOfWeekMonday = (d: Date) => {
  const tmp = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = tmp.getDay(); // 0=dom,1=lun
  const diff = dow === 0 ? -6 : 1 - dow;
  tmp.setDate(tmp.getDate() + diff);
  return tmp; // 00:00 local
};
export const endOfWeekMonday = (d: Date) => {
  const s = startOfWeekMonday(d);
  const e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
  return e; // último día de la semana (00:00) → enviamos solo YYYY-MM-DD
};

export const startOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0);

export const startOfYear = (d: Date) =>
  new Date(d.getFullYear(), 0, 1);
export const endOfYear = (d: Date) =>
  new Date(d.getFullYear(), 11, 31);

/** Rango ISO de un preset respecto a "now". */
export const getPresetRangeISO = (preset: Preset, now = new Date()) => {
  if (preset === "HOY") {
    const s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const e = s;
    return { fromISO: toISODate(s), toISO: toISODate(e) };
  }
  if (preset === "SEMANA") {
    const s = startOfWeekMonday(now);
    const e = endOfWeekMonday(now);
    return { fromISO: toISODate(s), toISO: toISODate(e) };
  }
  if (preset === "MES") {
    const s = startOfMonth(now);
    const e = endOfMonth(now);
    return { fromISO: toISODate(s), toISO: toISODate(e) };
  }
  if (preset === "ANIO") {
    const s = startOfYear(now);
    const e = endOfYear(now);
    return { fromISO: toISODate(s), toISO: toISODate(e) };
  }
  // PERSONALIZADO → sin cambios
  return { fromISO: "", toISO: "" };
};

/** Versión con labels UI "dd/MM/yyyy", útil para inicializar inputs. */
export const getPresetRangeUI = (preset: Preset, now = new Date()) => {
  const { fromISO, toISO } = getPresetRangeISO(preset, now);
  return {
    fromISO,
    toISO,
    fromUI: fromISO ? isoToDDMMYYYY(fromISO) : "",
    toUI:   toISO ? isoToDDMMYYYY(toISO) : "",
  };
};

/** Normaliza un rango flexible (ISO strings o vacío) a un rango por defecto (últimos N días). */
export const normalizeRangeISO = (from?: string, to?: string, lastNDays = 30) => {
  const now = new Date();
  const toDate = to && (isISO(to) ? new Date(to) : new Date(to));
  const end = toDate && !Number.isNaN(toDate.getTime()) ? toDate : now;

  const fromDate =
    from && (isISO(from) ? new Date(from) : new Date(from));
  const start =
    fromDate && !Number.isNaN(fromDate.getTime())
      ? fromDate
      : (() => {
          const d = new Date(end);
          d.setDate(end.getDate() - (lastNDays - 1));
          return d;
        })();

  return { fromISO: toISODate(start), toISO: toISODate(end) };
};

/** ────────────────────────────────────────────────────────────────────────────
 *  Ayuditas de UI
 *  ──────────────────────────────────────────────────────────────────────────── */

/** Convierte Date a "dd/MM/yyyy" de manera directa. */
export const toDDMMYYYY = (d: Date) => isoToDDMMYYYY(toISODate(d));

/** Label corto d/M (ej: "20/8"). */
export const toLabelDM = (d: Date, locale: string = "es-AR") =>
  d.toLocaleDateString(locale, { day: "numeric", month: "numeric" });

/** Label mes+anio (ej: "ene 2025"). */
export const toLabelMonthYear = (d: Date, locale: string = "es-AR", short = true) =>
  d
    .toLocaleDateString(locale, { month: short ? "short" : "long", year: "numeric" })
    .replace(" de ", " ");
