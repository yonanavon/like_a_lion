import { HDate } from "@hebcal/core";

const HEBREW_DAY_NAMES = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
];

export function getHebrewDateDisplay(date: Date) {
  const dayOfWeek = date.getUTCDay();
  // HDate expects a local Date, so convert UTC components to local
  const localDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const hd = new HDate(localDate);
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();

  return {
    hebrewDayOfWeek: dayOfWeek === 6 ? "שבת" : `יום ${HEBREW_DAY_NAMES[dayOfWeek]}`,
    hebrewDate: hd.renderGematriya(),
    gregorianDate: `${dd}/${mm}/${yyyy}`,
  };
}
