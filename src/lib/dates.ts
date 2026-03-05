export function getIsraelToday(): string {
  const israelDateStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jerusalem",
  });
  return israelDateStr; // YYYY-MM-DD
}

/**
 * Parse a YYYY-MM-DD string into a Date at midnight UTC.
 * We use UTC consistently for all date-only comparisons to avoid timezone drift.
 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDateStr(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isActiveDay(date: Date, activeWeekdays: number[]): boolean {
  return activeWeekdays.includes(date.getUTCDay());
}

export function getPreviousActiveDay(
  date: Date,
  startDate: Date,
  activeWeekdays: number[]
): string | null {
  const d = new Date(date);
  for (let i = 0; i < 60; i++) {
    d.setUTCDate(d.getUTCDate() - 1);
    if (d < startDate) return null;
    if (isActiveDay(d, activeWeekdays)) return formatDateStr(d);
  }
  return null;
}

export function getNextActiveDay(
  date: Date,
  today: Date,
  activeWeekdays: number[]
): string | null {
  const d = new Date(date);
  for (let i = 0; i < 60; i++) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (d > today) return null;
    if (isActiveDay(d, activeWeekdays)) return formatDateStr(d);
  }
  return null;
}

export function countActiveDays(
  startDate: Date,
  endDate: Date,
  activeWeekdays: number[]
): number {
  let count = 0;
  const d = new Date(startDate);
  while (d <= endDate) {
    if (activeWeekdays.includes(d.getUTCDay())) count++;
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return count;
}
