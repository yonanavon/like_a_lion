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
  const hd = new HDate(date);
  return {
    hebrewDayOfWeek: date.getDay() === 6 ? "שבת" : `יום ${HEBREW_DAY_NAMES[date.getDay()]}`,
    hebrewDate: hd.renderGematriya(),
    gregorianDate: date.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  };
}
