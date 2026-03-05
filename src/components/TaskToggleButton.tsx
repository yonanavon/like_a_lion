"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { TASK_ICONS } from "@/lib/icons";

interface TaskToggleButtonProps {
  task: {
    id: string;
    name: string;
    icon: string;
    color: string;
    points: number;
  };
  isCompleted: boolean;
  onToggle: (taskId: string) => Promise<void>;
}

export default function TaskToggleButton({
  task,
  isCompleted,
  onToggle,
}: TaskToggleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);

  const Icon = TASK_ICONS[task.icon] || TASK_ICONS.Star;

  // Sync with prop when it changes (e.g. date navigation)
  useEffect(() => {
    setCompleted(isCompleted);
  }, [isCompleted]);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    const prevState = completed;
    setCompleted(!completed); // optimistic
    try {
      await onToggle(task.id);
    } catch {
      setCompleted(prevState); // revert
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`relative rounded-2xl p-4 flex flex-col items-center justify-center gap-2 min-h-[120px] transition-all active:scale-95 ${
        completed
          ? "shadow-md"
          : "border-2 border-dashed hover:border-solid"
      }`}
      style={{
        backgroundColor: completed ? task.color + "15" : "white",
        borderColor: completed ? task.color : "#D1D5DB",
      }}
    >
      {completed && (
        <div
          className="absolute top-2 start-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: task.color }}
        >
          <Check size={14} className="text-white" />
        </div>
      )}

      <Icon
        size={36}
        color={completed ? task.color : "#9CA3AF"}
        className={`transition-all ${loading ? "animate-pulse" : ""}`}
      />

      <span
        className={`text-sm font-medium text-center leading-tight ${
          completed ? "text-gray-800" : "text-gray-500"
        }`}
      >
        {task.name}
      </span>

      <span
        className="text-xs"
        style={{ color: completed ? task.color : "#9CA3AF" }}
      >
        {task.points} {task.points === 1 ? "נקודה" : "נקודות"}
      </span>
    </button>
  );
}
