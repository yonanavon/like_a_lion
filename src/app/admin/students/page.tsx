"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X } from "lucide-react";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  parent1: { israeliId: string; displayName: string };
  parent2: { israeliId: string; displayName: string } | null;
  totalPoints: number;
  percentage: number;
}

export default function StudentsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    parent1Id: "",
    parent1Name: "",
    parent2Id: "",
    parent2Name: "",
  });

  const loadChildren = async () => {
    const res = await fetch("/api/admin/students");
    setChildren(await res.json());
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      parent1Id: "",
      parent1Name: "",
      parent2Id: "",
      parent2Name: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.parent1Id || !form.parent1Name)
      return;

    if (editingId) {
      await fetch(`/api/admin/students/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    resetForm();
    loadChildren();
  };

  const handleEdit = (child: Child) => {
    setForm({
      firstName: child.firstName,
      lastName: child.lastName,
      parent1Id: child.parent1.israeliId,
      parent1Name: child.parent1.displayName,
      parent2Id: child.parent2?.israeliId || "",
      parent2Name: child.parent2?.displayName || "",
    });
    setEditingId(child.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("למחוק את התלמיד? הפעולה תמחק גם את כל הדיווחים שלו."))
      return;
    await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
    loadChildren();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ניהול תלמידים</h1>
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
              {editingId ? "עריכת תלמיד" : "תלמיד חדש"}
            </h2>
            <button onClick={resetForm}>
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                placeholder="שם פרטי"
                className="input-field"
              />
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="שם משפחה"
                className="input-field"
              />
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">הורה 1</p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={form.parent1Id}
                  onChange={(e) =>
                    setForm({ ...form, parent1Id: e.target.value })
                  }
                  placeholder="ת.ז. הורה 1"
                  className="input-field"
                  inputMode="numeric"
                />
                <input
                  type="text"
                  value={form.parent1Name}
                  onChange={(e) =>
                    setForm({ ...form, parent1Name: e.target.value })
                  }
                  placeholder="שם הורה 1"
                  className="input-field"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                הורה 2 (אופציונלי)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={form.parent2Id}
                  onChange={(e) =>
                    setForm({ ...form, parent2Id: e.target.value })
                  }
                  placeholder="ת.ז. הורה 2"
                  className="input-field"
                  inputMode="numeric"
                />
                <input
                  type="text"
                  value={form.parent2Name}
                  onChange={(e) =>
                    setForm({ ...form, parent2Name: e.target.value })
                  }
                  placeholder="שם הורה 2"
                  className="input-field"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              {editingId ? "עדכון" : "הוספה"}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {children.map((child) => (
          <div key={child.id} className="card flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium">
                {child.firstName} {child.lastName}
              </p>
              <p className="text-sm text-gray-500">
                {child.totalPoints} נקודות • {child.percentage}%
              </p>
              <p className="text-xs text-gray-400">
                הורה 1: {child.parent1.displayName} ({child.parent1.israeliId})
                {child.parent2 &&
                  ` | הורה 2: ${child.parent2.displayName} (${child.parent2.israeliId})`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEdit(child)}
                className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(child.id)}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {children.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            אין תלמידים עדיין. לחץ על &quot;הוספה&quot; כדי להוסיף תלמיד חדש.
          </p>
        )}
      </div>
    </div>
  );
}
