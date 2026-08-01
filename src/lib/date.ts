/**
 * Date utilities — business timezone Africa/Algiers.
 */

const TZ = "Africa/Algiers";

export function nowAlgiers(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: TZ })
  );
}

export function formatDate(
  date: Date | string | null | undefined
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("fr-FR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("fr-FR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function startOfDayAlgiers(date?: Date): Date {
  const base = date ? new Date(date) : nowAlgiers();
  base.setHours(0, 0, 0, 0);
  return base;
}

export function endOfDayAlgiers(date?: Date): Date {
  const base = date ? new Date(date) : nowAlgiers();
  base.setHours(23, 59, 59, 999);
  return base;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getDayName(date: Date): string {
  return date.toLocaleDateString("fr-FR", { weekday: "long" });
}
