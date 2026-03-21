"use client";

import { useEffect, useState } from "react";
import { Save, Check, AlertTriangle, Trash2 } from "lucide-react";

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
  const [maxBackDays, setMaxBackDays] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/campaign")
      .then((r) => r.json())
      .then((data) => {
        setStartDate(data.startDate?.split("T")[0] || "");
        setActiveWeekdays(data.activeWeekdays || []);
        setMaxBackDays(data.maxBackDays ?? 1);
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
      body: JSON.stringify({ startDate, activeWeekdays, maxBackDays }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = async () => {
    setResetting(true);
    await fetch("/api/admin/reset-points", { method: "POST" });
    setResetting(false);
    setShowResetConfirm(false);
    setResetConfirmText("");
    alert("כל הנקודות אופסו בהצלחה");
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
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            כמה ימים אחורה ניתן לעדכן משימות
          </label>
          <input
            type="number"
            min={0}
            max={30}
            value={maxBackDays}
            onChange={(e) => {
              setMaxBackDays(Math.max(0, parseInt(e.target.value) || 0));
              setSaved(false);
            }}
            className="input-field w-full sm:w-64"
          />
          <p className="text-xs text-gray-500 mt-1">
            0 = רק היום, 1 = היום ואתמול, וכו׳
          </p>
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

      <div className="card mt-8 border-2 border-red-200 bg-red-50/50">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold text-red-700">איפוס נקודות</h2>
            <p className="text-sm text-red-600 mt-1">
              פעולה זו תמחק את כל השלמות המשימות ותשובות החידונים של כל התלמידים.
              <strong> לא ניתן לבטל פעולה זו.</strong>
            </p>
            <p className="text-sm text-red-600 mt-1">
              מומלץ לייצא את הנתונים לאקסל לפני האיפוס כגיבוי.
            </p>
          </div>
        </div>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Trash2 size={18} />
            איפוס כל הנקודות
          </button>
        ) : (
          <div className="space-y-3 p-4 bg-white rounded-lg border border-red-300">
            <p className="text-sm font-medium text-gray-700">
              הקלד &quot;אני מאשר&quot; כדי לאשר את האיפוס:
            </p>
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder='הקלד "אני מאשר"'
              className="input-field w-full sm:w-64"
              dir="rtl"
            />
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                disabled={resetConfirmText !== "אני מאשר" || resetting}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
              >
                {resetting ? "מאפס..." : "אישור איפוס"}
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  setResetConfirmText("");
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
