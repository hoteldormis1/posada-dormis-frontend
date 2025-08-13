export const isISO = (s?: string) => !!s && /\d{4}-\d{2}-\d{2}/.test(s);
export const isDDMMYYYY = (s?: string) => !!s && /\d{2}\/\d{2}\/\d{4}/.test(s);

export const toDateInputValue = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const parseDDMMYYYY = (s?: string) => {
  if (!isDDMMYYYY(s)) return null;
  const [dd, mm, yyyy] = String(s).split("/");
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 12, 0, 0, 0);
  return isNaN(d.getTime()) ? null : d;
};

export const diffNoches = (desde?: string, hasta?: string) => {
  const d1 = parseDDMMYYYY(desde);
  const d2 = parseDDMMYYYY(hasta);
  if (!d1 || !d2) return 1;
  const ms = d2.getTime() - d1.getTime();
  return Math.max(Math.ceil(ms / (1000 * 60 * 60 * 24)), 1);
};

export const toISOFromFlexible = (s?: string) => {
  if (!s) return undefined;
  if (isDDMMYYYY(s)) {
    const [dd, mm, yyyy] = s.split("/");
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }
  if (isISO(s)) return s; // YYYY-MM-DD o ISO-like
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};

export const parseDateWithFallbackISO = (dateString?: string) => {
  if (!dateString) return new Date().toISOString();
  if (isDDMMYYYY(dateString)) {
    const [day, month, year] = dateString.split("/");
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
};