export function getIsraelToday(): string {
  const israelDateStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jerusalem",
  });
  return israelDateStr; // YYYY-MM-DD
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}

export function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isActiveDay(date: Date, activeWeekdays: number[]): boolean {
  return activeWeekdays.includes(date.getDay());
}

export function getPreviousActiveDay(
  date: Date,
  startDate: Date,
  activeWeekdays: number[]
): string | null {
  const d = new Date(date);
  for (let i = 0; i < 60; i++) {
    d.setDate(d.getDate() - 1);
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
    d.setDate(d.getDate() + 1);
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
    if (activeWeekdays.includes(d.getDay())) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}
