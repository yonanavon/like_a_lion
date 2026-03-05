"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Trophy,
  CheckCircle2,
  XCircle,
  BarChart3,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { TASK_ICONS } from "@/lib/icons";
import { getHebrewDateDisplay } from "@/lib/hebrew-date";
import { parseDate } from "@/lib/dates";

interface TaskStat {
  id: string;
  name: string;
  icon: string;
  color: string;
  points: number;
  completedCount: number;
  totalChildren: number;
  percentage: number;
}

interface ChildDayStat {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  parent1Name: string;
  dayPoints: number;
  maxPointsPerDay: number;
  dayPercentage: number;
  completedTasks: { taskId: string; completed: boolean }[];
  reported: boolean;
}

interface LeaderboardEntry {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  totalPoints: number;
  maxPoints: number;
  percentage: number;
}

interface GradeStat {
  grade: string;
  total: number;
  reported: number;
  points: number;
  maxPoints: number;
  reportingRate: number;
  percentage: number;
}

interface DailyHistory {
  date: string;
  reported: number;
  total: number;
  percentage: number;
}

interface DashboardData {
  selectedDate: string;
  today: string;
  campaign: {
    startDate: string;
    activeWeekdays: number[];
    activeDaysSoFar: number;
  };
  overview: {
    totalChildren: number;
    reportedToday: number;
    notReportedToday: number;
    reportingRate: number;
    totalPointsAllChildren: number;
    maxTotalPoints: number;
    overallPercentage: number;
    maxPointsPerDay: number;
    activeTasks: number;
  };
  taskStats: TaskStat[];
  childrenStats: ChildDayStat[];
  leaderboard: LeaderboardEntry[];
  gradeStats: GradeStat[];
  dailyHistory: DailyHistory[];
}

type ChildrenTab = "notReported" | "all" | "leaderboard";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [childrenTab, setChildrenTab] = useState<ChildrenTab>("notReported");

  const loadData = useCallback(async (date?: string) => {
    setLoading(true);
    try {
      const url = date
        ? `/api/admin/dashboard?date=${date}`
        : "/api/admin/dashboard";
      const res = await fetch(url);
      const json = await res.json();
      setData(json);
      setSelectedDate(json.selectedDate);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const isToday = selectedDate === data.today;
  const dateObj = parseDate(selectedDate || data.today);
  const hebrew = getHebrewDateDisplay(dateObj);

  const navigateDate = (direction: "prev" | "next") => {
    if (!data.dailyHistory.length) return;
    const currentIdx = data.dailyHistory.findIndex(
      (d) => d.date === selectedDate
    );
    if (direction === "prev" && currentIdx > 0) {
      loadData(data.dailyHistory[currentIdx - 1].date);
    } else if (
      direction === "next" &&
      currentIdx < data.dailyHistory.length - 1
    ) {
      loadData(data.dailyHistory[currentIdx + 1].date);
    }
  };

  const currentDayIdx = data.dailyHistory.findIndex(
    (d) => d.date === selectedDate
  );
  const canGoPrev = currentDayIdx > 0;
  const canGoNext = currentDayIdx < data.dailyHistory.length - 1;

  const notReported = data.childrenStats.filter((c) => !c.reported);
  const reportedChildren = data.childrenStats
    .filter((c) => c.reported)
    .sort((a, b) => b.dayPercentage - a.dayPercentage);

  return (
    <div className="space-y-6 pb-8">
      <h1 className="text-2xl font-bold">דשבורד</h1>

      {/* Date Navigator */}
      <div className="card flex items-center justify-between">
        <button
          onClick={() => navigateDate("next")}
          disabled={!canGoNext}
          className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={24} />
        </button>
        <div className="text-center">
          <p className="font-bold text-lg">{hebrew.hebrewDayOfWeek}</p>
          <p className="text-sm text-gray-600">{hebrew.hebrewDate}</p>
          <p className="text-xs text-gray-400">{hebrew.gregorianDate}</p>
          {isToday && (
            <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              היום
            </span>
          )}
        </div>
        <button
          onClick={() => navigateDate("prev")}
          disabled={!canGoPrev}
          className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Users size={22} className="text-blue-600" />}
          label="סה״כ תלמידים"
          value={data.overview.totalChildren}
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={<CheckCircle2 size={22} className="text-green-600" />}
          label="דיווחו היום"
          value={data.overview.reportedToday}
          suffix={`/${data.overview.totalChildren}`}
          bgColor="bg-green-50"
          subValue={`${data.overview.reportingRate}%`}
          subColor={
            data.overview.reportingRate >= 70
              ? "text-green-600"
              : data.overview.reportingRate >= 40
                ? "text-amber-600"
                : "text-red-500"
          }
        />
        <StatCard
          icon={<XCircle size={22} className="text-red-500" />}
          label="לא דיווחו"
          value={data.overview.notReportedToday}
          bgColor="bg-red-50"
        />
        <StatCard
          icon={<TrendingUp size={22} className="text-purple-600" />}
          label="אחוז כללי"
          value={`${data.overview.overallPercentage}%`}
          bgColor="bg-purple-50"
          subValue={`יום ${data.campaign.activeDaysSoFar} במבצע`}
          subColor="text-gray-500"
        />
      </div>

      {/* Task Completion Rates */}
      <div className="card">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-600" />
          ביצוע משימות - {hebrew.hebrewDayOfWeek}
        </h2>
        <div className="space-y-3">
          {data.taskStats.map((task) => {
            const Icon = TASK_ICONS[task.icon] || TASK_ICONS.Star;
            return (
              <div key={task.id} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: task.color + "20" }}
                >
                  <Icon size={18} color={task.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">
                      {task.name}
                    </span>
                    <span className="text-sm text-gray-500 shrink-0 ms-2">
                      {task.completedCount}/{task.totalChildren}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${task.percentage}%`,
                        backgroundColor: task.color,
                      }}
                    />
                  </div>
                </div>
                <span
                  className="text-sm font-bold w-12 text-left shrink-0"
                  style={{ color: task.color }}
                >
                  {task.percentage}%
                </span>
              </div>
            );
          })}
          {data.taskStats.length === 0 && (
            <p className="text-center text-gray-400 py-4">אין משימות פעילות</p>
          )}
        </div>
      </div>

      {/* Grade Breakdown */}
      {data.gradeStats.length > 1 && (
        <div className="card">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-green-600" />
            לפי כיתות
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-start py-2 font-medium text-gray-500">
                    כיתה
                  </th>
                  <th className="text-center py-2 font-medium text-gray-500">
                    תלמידים
                  </th>
                  <th className="text-center py-2 font-medium text-gray-500">
                    דיווחו היום
                  </th>
                  <th className="text-center py-2 font-medium text-gray-500">
                    % דיווח
                  </th>
                  <th className="text-center py-2 font-medium text-gray-500">
                    % כללי
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.gradeStats.map((gs) => (
                  <tr key={gs.grade} className="border-b border-gray-50">
                    <td className="py-2.5 font-medium">{gs.grade}</td>
                    <td className="text-center py-2.5">{gs.total}</td>
                    <td className="text-center py-2.5">
                      {gs.reported}/{gs.total}
                    </td>
                    <td className="text-center py-2.5">
                      <span
                        className={`font-medium ${
                          gs.reportingRate >= 70
                            ? "text-green-600"
                            : gs.reportingRate >= 40
                              ? "text-amber-600"
                              : "text-red-500"
                        }`}
                      >
                        {gs.reportingRate}%
                      </span>
                    </td>
                    <td className="text-center py-2.5">
                      <span
                        className={`font-medium ${
                          gs.percentage >= 70
                            ? "text-green-600"
                            : gs.percentage >= 40
                              ? "text-amber-600"
                              : "text-red-500"
                        }`}
                      >
                        {gs.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily History */}
      {data.dailyHistory.length > 1 && (
        <div className="card">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-600" />
            מגמת דיווח יומית
          </h2>
          <div className="flex items-end gap-1 h-32">
            {data.dailyHistory.map((day) => {
              const isSelected = day.date === selectedDate;
              return (
                <button
                  key={day.date}
                  onClick={() => loadData(day.date)}
                  className={`flex-1 flex flex-col items-center gap-1 group transition-all rounded-t-lg ${
                    isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  title={`${day.date}: ${day.reported}/${day.total} (${day.percentage}%)`}
                >
                  <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.percentage}%
                  </span>
                  <div className="w-full flex justify-center flex-1 items-end">
                    <div
                      className={`w-full max-w-[32px] rounded-t-md transition-all ${
                        isSelected ? "bg-blue-500" : "bg-blue-200 group-hover:bg-blue-300"
                      }`}
                      style={{
                        height: `${Math.max(day.percentage, 4)}%`,
                      }}
                    />
                  </div>
                  <span
                    className={`text-[10px] pb-1 ${
                      isSelected
                        ? "text-blue-600 font-bold"
                        : "text-gray-400"
                    }`}
                  >
                    {day.date.slice(8)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Children Tabs */}
      <div className="card">
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
          <TabButton
            active={childrenTab === "notReported"}
            onClick={() => setChildrenTab("notReported")}
            label={`לא דיווחו (${notReported.length})`}
          />
          <TabButton
            active={childrenTab === "all"}
            onClick={() => setChildrenTab("all")}
            label={`פירוט יומי (${data.childrenStats.length})`}
          />
          <TabButton
            active={childrenTab === "leaderboard"}
            onClick={() => setChildrenTab("leaderboard")}
            label="טבלת מובילים"
          />
        </div>

        {childrenTab === "notReported" && (
          <div>
            {notReported.length === 0 ? (
              <div className="text-center py-8 text-green-600">
                <CheckCircle2 size={40} className="mx-auto mb-2" />
                <p className="font-medium">כל התלמידים דיווחו!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notReported.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center gap-3 p-3 bg-red-50 rounded-xl"
                  >
                    <AlertTriangle size={18} className="text-red-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {child.firstName} {child.lastName}
                        {child.grade && (
                          <span className="text-gray-400 font-normal">
                            {" "}
                            - {child.grade}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">
                        {child.parent1Name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {childrenTab === "all" && (
          <div className="space-y-2">
            {[...reportedChildren, ...notReported].map((child) => (
              <div
                key={child.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  child.reported ? "bg-gray-50" : "bg-red-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">
                      {child.firstName} {child.lastName}
                    </p>
                    {child.grade && (
                      <span className="text-xs text-gray-400">
                        {child.grade}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {child.completedTasks.map((ct) => {
                      const task = data.taskStats.find(
                        (t) => t.id === ct.taskId
                      );
                      if (!task) return null;
                      const Icon = TASK_ICONS[task.icon] || TASK_ICONS.Star;
                      return (
                        <div
                          key={ct.taskId}
                          className={`w-7 h-7 rounded-md flex items-center justify-center ${
                            ct.completed ? "" : "opacity-20"
                          }`}
                          style={{
                            backgroundColor: ct.completed
                              ? task.color + "20"
                              : "#f3f4f6",
                          }}
                          title={task.name}
                        >
                          <Icon
                            size={14}
                            color={ct.completed ? task.color : "#9ca3af"}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      child.dayPercentage === 100
                        ? "text-green-600"
                        : child.dayPercentage > 0
                          ? "text-amber-600"
                          : "text-gray-300"
                    }`}
                  >
                    {child.dayPercentage}%
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {child.dayPoints}/{child.maxPointsPerDay}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {childrenTab === "leaderboard" && (
          <div className="space-y-2">
            {data.leaderboard.map((child, idx) => (
              <div
                key={child.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  idx < 3 ? "bg-amber-50" : "bg-gray-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
                    idx === 0
                      ? "bg-amber-400 text-white"
                      : idx === 1
                        ? "bg-gray-300 text-white"
                        : idx === 2
                          ? "bg-amber-600 text-white"
                          : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {idx < 3 ? (
                    <Crown size={16} />
                  ) : (
                    idx + 1
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {child.firstName} {child.lastName}
                    {child.grade && (
                      <span className="text-gray-400 font-normal">
                        {" "}
                        - {child.grade}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          child.percentage >= 80
                            ? "bg-green-500"
                            : child.percentage >= 50
                              ? "bg-amber-500"
                              : "bg-red-400"
                        }`}
                        style={{ width: `${child.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <p className="flex items-center gap-1 text-sm font-bold text-amber-600">
                    <Trophy size={14} />
                    {child.totalPoints}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {child.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  bgColor,
  subValue,
  subColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  bgColor: string;
  subValue?: string;
  subColor?: string;
}) {
  return (
    <div className={`rounded-2xl p-4 ${bgColor}`}>
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-bold">
        {value}
        {suffix && <span className="text-sm font-normal text-gray-400">{suffix}</span>}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {subValue && (
        <p className={`text-xs font-medium mt-1 ${subColor || ""}`}>
          {subValue}
        </p>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}
