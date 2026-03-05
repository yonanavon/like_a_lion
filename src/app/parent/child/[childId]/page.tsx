"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Trophy } from "lucide-react";
import DateNavigator from "@/components/DateNavigator";
import TaskToggleButton from "@/components/TaskToggleButton";
import { getIsraelToday } from "@/lib/dates";

interface Task {
  id: string;
  name: string;
  icon: string;
  color: string;
  points: number;
  isCompleted: boolean;
}

interface ChildData {
  firstName: string;
  lastName: string;
}

interface CampaignData {
  startDate: string;
  activeWeekdays: number[];
}

export default function ChildTasksPage() {
  const params = useParams();
  const router = useRouter();
  const childId = params.childId as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [child, setChild] = useState<ChildData | null>(null);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [currentDate, setCurrentDate] = useState(getIsraelToday());
  const [loading, setLoading] = useState(true);

  const todayPoints = useMemo(() => {
    return tasks
      .filter((t) => t.isCompleted)
      .reduce((sum, t) => sum + t.points, 0);
  }, [tasks]);

  const loadTasks = useCallback(
    async (date: string) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/children/${childId}/completions?date=${date}`
        );
        const data = await res.json();
        setTasks(data.tasks);
        setChild(data.child);
        if (data.campaign) {
          setCampaign({
            startDate: data.campaign.startDate.split("T")[0],
            activeWeekdays: data.campaign.activeWeekdays,
          });
        }
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    },
    [childId]
  );

  useEffect(() => {
    loadTasks(currentDate);
  }, [currentDate, loadTasks]);

  const handleToggle = async (taskId: string) => {
    const res = await fetch(`/api/children/${childId}/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, date: currentDate }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "שגיאה");
      throw new Error("Toggle failed");
    }

    const result = await res.json();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, isCompleted: result.isCompleted } : t
      )
    );
  };

  const handleDateChange = (date: string) => {
    setCurrentDate(date);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/parent")}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowRight size={24} />
          </button>
          {child && (
            <h2 className="text-xl font-bold">
              {child.firstName} {child.lastName}
            </h2>
          )}
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl">
          <Trophy size={18} />
          <span className="font-bold text-lg">{todayPoints}</span>
        </div>
      </div>

      {campaign && (
        <div className="mb-4">
          <DateNavigator
            currentDate={currentDate}
            onDateChange={handleDateChange}
            campaignStartDate={campaign.startDate}
            activeWeekdays={campaign.activeWeekdays}
          />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {tasks.map((task, index) => {
            const isLastOdd =
              tasks.length % 2 === 1 && index === tasks.length - 1;
            return (
              <div
                key={task.id}
                className={
                  isLastOdd
                    ? "col-span-2 flex justify-center"
                    : ""
                }
              >
                <div className={isLastOdd ? "w-[calc(50%-6px)]" : "w-full"}>
                  <TaskToggleButton
                    task={task}
                    isCompleted={task.isCompleted}
                    onToggle={handleToggle}
                  />
                </div>
              </div>
            );
          })}

          {tasks.length === 0 && (
            <p className="col-span-2 text-center text-gray-500 py-8">
              אין משימות פעילות כרגע.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
