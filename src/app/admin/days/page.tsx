"use client";

import { useEffect, useState } from "react";
import { Save, Check } from "lucide-react";

const WEEKDAYS = [
  { day: 0, label: "א׳", name: "ראשון" },
  { day: 1, label: "ב׳", name: "שני" },
  { day: 2, label: "ג׳", name: "שלישי" },
  { day: 3, label: "ד׳", name: "רביעי" },
  { day: 4, label: "ה׳", name: "חמישי" },
  { day: 5, label: "ו׳", name: "שישי" },
  { day: 6, label: "ש׳", name: "שבת" },
];

export default function DaysPage() {
  const [startDate, setStartDate] = useState("");
  const [activeWeekdays, setActiveWeekdays] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/campaign")
      .then((r) => r.json())
      .then((data) => {
        setStartDate(data.startDate?.split("T")[0] || "");
        setActiveWeekdays(data.activeWeekdays || []);
      });
  }, []);

  const toggleDay = (day: number) => {
    setActiveWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/campaign", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate, activeWeekdays }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">הגדרות ימים</h1>

      <div className="card space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            תאריך תחילת המבצע
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setSaved(false);
            }}
            className="input-field w-full sm:w-64"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            ימים פעילים
          </label>
          <div className="flex gap-2 flex-wrap">
            {WEEKDAYS.map((wd) => {
              const isActive = activeWeekdays.includes(wd.day);
              return (
                <button
                  key={wd.day}
                  onClick={() => toggleDay(wd.day)}
                  className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  <span>{wd.label}</span>
                  {isActive && <Check size={14} className="mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={18} />
          {saving ? "שומר..." : saved ? "נשמר!" : "שמירה"}
        </button>
      </div>
    </div>
  );
}
