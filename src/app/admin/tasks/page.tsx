"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X, Check } from "lucide-react";
import IconPicker from "@/components/IconPicker";
import { TASK_ICONS } from "@/lib/icons";

interface Task {
  id: string;
  name: string;
  icon: string;
  color: string;
  points: number;
  isActive: boolean;
  sortOrder: number;
}

const COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316", "#14B8A6", "#6366F1",
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    icon: "Star",
    color: "#3B82F6",
    points: 1,
  });

  const loadTasks = async () => {
    const res = await fetch("/api/admin/tasks");
    setTasks(await res.json());
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const resetForm = () => {
    setForm({ name: "", icon: "Star", color: "#3B82F6", points: 1 });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const url = editingId ? `/api/admin/tasks/${editingId}` : "/api/admin/tasks";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "שגיאה בשמירת המשימה");
      return;
    }

    resetForm();
    loadTasks();
  };

  const handleEdit = (task: Task) => {
    setForm({
      name: task.name,
      icon: task.icon,
      color: task.color,
      points: task.points,
    });
    setEditingId(task.id);
    setShowForm(true);
  };

  const handleToggleActive = async (task: Task) => {
    await fetch(`/api/admin/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !task.isActive }),
    });
    loadTasks();
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("למחוק את המשימה? הפעולה תמחק גם את כל הדיווחים עליה."))
      return;
    await fetch(`/api/admin/tasks/${taskId}`, { method: "DELETE" });
    loadTasks();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ניהול משימות</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>הוספה</span>
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              {editingId ? "עריכת משימה" : "משימה חדשה"}
            </h2>
            <button onClick={resetForm}>
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="שם המשימה"
              className="input-field"
              autoFocus
            />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                אייקון
              </label>
              <IconPicker
                selected={form.icon}
                color={form.color}
                onSelect={(icon) => setForm({ ...form, icon })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                צבע
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-8 h-8 rounded-full transition-all ${
                      form.color === c
                        ? "ring-2 ring-offset-2 ring-blue-500"
                        : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                נקודות
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.points}
                onChange={(e) =>
                  setForm({ ...form, points: parseInt(e.target.value) || 1 })
                }
                className="input-field w-24"
              />
            </div>

            <button type="submit" className="btn-primary">
              {editingId ? "עדכון" : "הוספה"}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => {
          const Icon = TASK_ICONS[task.icon] || TASK_ICONS.Star;
          return (
            <div
              key={task.id}
              className={`card flex items-center gap-3 ${
                !task.isActive ? "opacity-50" : ""
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: task.color + "20" }}
              >
                <Icon size={22} color={task.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{task.name}</p>
                <p className="text-sm text-gray-500">
                  {task.points} {task.points === 1 ? "נקודה" : "נקודות"}
                  {!task.isActive && " • לא פעילה"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleActive(task)}
                  className={`p-2 rounded-lg transition-colors ${
                    task.isActive
                      ? "text-green-600 hover:bg-green-50"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                  title={task.isActive ? "השבתה" : "הפעלה"}
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => handleEdit(task)}
                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            אין משימות עדיין. לחץ על &quot;הוספה&quot; כדי ליצור משימה חדשה.
          </p>
        )}
      </div>
    </div>
  );
}
