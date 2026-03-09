"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { getHebrewDateDisplay } from "@/lib/hebrew-date";
import {
  parseDate,
  getPreviousActiveDay,
  getNextActiveDay,
  getIsraelToday,
} from "@/lib/dates";

interface DateNavigatorProps {
  currentDate: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
  campaignStartDate: string;
  activeWeekdays: number[];
}

export default function DateNavigator({
  currentDate,
  onDateChange,
  campaignStartDate,
  activeWeekdays,
}: DateNavigatorProps) {
  const date = parseDate(currentDate);
  const { hebrewDayOfWeek, hebrewDate, gregorianDate } =
    getHebrewDateDisplay(date);

  const today = parseDate(getIsraelToday());
  const startDate = parseDate(campaignStartDate);

  // Allow reporting only for today and yesterday
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const earliestDate = startDate > yesterday ? startDate : yesterday;

  const prevDate = getPreviousActiveDay(date, earliestDate, activeWeekdays);
  const nextDate = getNextActiveDay(date, today, activeWeekdays);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
      <button
        onClick={() => nextDate && onDateChange(nextDate)}
        disabled={!nextDate}
        className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={24} />
      </button>

      <div className="text-center">
        <p className="font-bold text-lg">{hebrewDayOfWeek}</p>
        <p className="text-sm text-gray-600">{hebrewDate}</p>
        <p className="text-xs text-gray-400">{gregorianDate}</p>
      </div>

      <button
        onClick={() => prevDate && onDateChange(prevDate)}
        disabled={!prevDate}
        className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
    </div>
  );
}
