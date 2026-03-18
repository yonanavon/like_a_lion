"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, X, Archive, ArchiveRestore } from "lucide-react";
import { GRADE_LETTERS } from "@/lib/grades";

interface Question {
  id: string;
  text: string;
  grade: string;
  options: string[];
  correctAnswerIndex: number;
  isArchived: boolean;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeGrade, setActiveGrade] = useState("א");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswerIndex: 0,
  });

  const loadQuestions = async () => {
    const res = await fetch(`/api/admin/questions?grade=${activeGrade}`);
    setQuestions(await res.json());
  };

  useEffect(() => {
    loadQuestions();
  }, [activeGrade]);

  const resetForm = () => {
    setForm({ text: "", options: ["", "", "", ""], correctAnswerIndex: 0 });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filledOptions = form.options.filter((o) => o.trim());
    if (!form.text.trim() || filledOptions.length < 2) return;

    if (form.correctAnswerIndex >= filledOptions.length) {
      alert("יש לבחור תשובה נכונה מבין התשובות שהוזנו");
      return;
    }

    const url = editingId
      ? `/api/admin/questions/${editingId}`
      : "/api/admin/questions";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: form.text,
        grade: activeGrade,
        options: filledOptions,
        correctAnswerIndex: form.correctAnswerIndex,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "שגיאה בשמירת השאלה");
      return;
    }

    resetForm();
    loadQuestions();
  };

  const handleEdit = (q: Question) => {
    const opts = [...q.options];
    while (opts.length < 4) opts.push("");
    setForm({
      text: q.text,
      options: opts,
      correctAnswerIndex: q.correctAnswerIndex,
    });
    setEditingId(q.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("למחוק את השאלה? הפעולה תמחק גם את כל התשובות עליה.")) return;
    await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    loadQuestions();
  };

  const handleArchive = async (id: string) => {
    await fetch(`/api/admin/questions/${id}/archive`, { method: "PUT" });
    loadQuestions();
  };

  const updateOption = (idx: number, value: string) => {
    const newOptions = [...form.options];
    newOptions[idx] = value;
    setForm({ ...form, options: newOptions });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ניהול שאלות</h1>
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

      {/* Grade tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {GRADE_LETTERS.map((g) => (
          <button
            key={g}
            onClick={() => {
              setActiveGrade(g);
              resetForm();
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeGrade === g
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {g}׳
          </button>
        ))}
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              {editingId ? "עריכת שאלה" : "שאלה חדשה"} - כיתה {activeGrade}׳
            </h2>
            <button onClick={resetForm}>
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                טקסט השאלה
              </label>
              <input
                type="text"
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="הקלד את השאלה..."
                className="input-field"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                תשובות (לפחות 2)
              </label>
              <div className="space-y-2">
                {form.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={form.correctAnswerIndex === idx}
                      onChange={() =>
                        setForm({ ...form, correctAnswerIndex: idx })
                      }
                      className="accent-green-600"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`תשובה ${idx + 1}${idx < 2 ? " (חובה)" : " (אופציונלי)"}`}
                      className="input-field flex-1"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                סמן את התשובה הנכונה באמצעות הכפתור העגול
              </p>
            </div>

            <button type="submit" className="btn-primary">
              {editingId ? "עדכון" : "הוספה"}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {questions.map((q) => (
          <div
            key={q.id}
            className={`card ${q.isArchived ? "opacity-50" : ""}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium mb-2">{q.text}</p>
                <div className="space-y-1">
                  {q.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`text-sm px-2 py-1 rounded ${
                        idx === q.correctAnswerIndex
                          ? "bg-green-50 text-green-700 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {idx + 1}. {opt}
                      {idx === q.correctAnswerIndex && " ✓"}
                    </div>
                  ))}
                </div>
                {q.isArchived && (
                  <p className="text-xs text-gray-400 mt-1">בארכיון</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleArchive(q.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    q.isArchived
                      ? "text-green-600 hover:bg-green-50"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                  title={q.isArchived ? "שחזור מארכיון" : "העבר לארכיון"}
                >
                  {q.isArchived ? (
                    <ArchiveRestore size={18} />
                  ) : (
                    <Archive size={18} />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(q)}
                  className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            אין שאלות לכיתה {activeGrade}׳. לחץ על &quot;הוספה&quot; כדי ליצור
            שאלה חדשה.
          </p>
        )}
      </div>
    </div>
  );
}
