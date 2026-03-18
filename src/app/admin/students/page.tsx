"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Edit2, X, Upload, FileSpreadsheet, Download } from "lucide-react";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  israeliId: string | null;
  parent1: { israeliId: string; displayName: string };
  parent2: { israeliId: string; displayName: string } | null;
  totalPoints: number;
  percentage: number;
}

export default function StudentsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    created: number;
    updated: number;
    errors: string[];
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    grade: "",
    childIsraeliId: "",
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
      grade: "",
      childIsraeliId: "",
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

    const url = editingId ? `/api/admin/students/${editingId}` : "/api/admin/students";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "שגיאה בשמירת התלמיד");
      return;
    }

    resetForm();
    loadChildren();
  };

  const handleEdit = (child: Child) => {
    setForm({
      firstName: child.firstName,
      lastName: child.lastName,
      grade: child.grade || "",
      childIsraeliId: child.israeliId || "",
      parent1Id: child.parent1.israeliId,
      parent1Name: child.parent1.displayName,
      parent2Id: child.parent2?.israeliId || "",
      parent2Name: child.parent2?.displayName || "",
    });
    setEditingId(child.id);
    setShowForm(true);
    setShowImport(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("למחוק את התלמיד? הפעולה תמחק גם את כל הדיווחים שלו."))
      return;
    await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
    loadChildren();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/students/import", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        setImportResult(result);
        loadChildren();
      } else {
        setImportResult({ created: 0, updated: 0, errors: [result.error] });
      }
    } catch {
      setImportResult({ created: 0, updated: 0, errors: ["שגיאת חיבור"] });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const bom = "\uFEFF";
    const header = "שם פרטי,שם משפחה,כיתה,ת.ז. הורה 1,שם הורה 1,ת.ז. הורה 2,שם הורה 2,ת.ז. תלמיד";
    const example = "ישראל,ישראלי,ג,123456789,אבא ישראלי,987654321,אמא ישראלי,111222333";
    const csv = bom + header + "\n" + example + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportForIdUpdate = () => {
    const bom = "\uFEFF";
    const header = "id,שם פרטי,שם משפחה,כיתה,ת.ז. תלמיד";
    const rows = children.map(
      (c) => `${c.id},${c.firstName},${c.lastName},${c.grade},${c.israeliId || ""}`
    );
    const csv = bom + header + "\n" + rows.join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_id_update.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">ניהול תלמידים</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={exportForIdUpdate}
            className="btn-secondary flex items-center gap-2"
            title="ייצוא CSV לעדכון ת.ז. תלמיד"
          >
            <FileSpreadsheet size={20} />
            <span className="hidden sm:inline">ייצוא ת.ז.</span>
          </button>
          <button
            onClick={() => {
              setShowImport(!showImport);
              setShowForm(false);
              setImportResult(null);
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload size={20} />
            <span className="hidden sm:inline">ייבוא CSV</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
              setShowImport(false);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span>הוספה</span>
          </button>
        </div>
      </div>

      {showImport && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <FileSpreadsheet size={20} />
              ייבוא תלמידים מקובץ CSV
            </h2>
            <button onClick={() => { setShowImport(false); setImportResult(null); }}>
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm space-y-2">
            <p className="font-medium text-blue-800">הנחיות ייבוא:</p>
            <ul className="list-disc list-inside text-blue-700 space-y-1">
              <li>הקובץ חייב להיות בפורמט <strong>CSV</strong> (מופרד בפסיקים)</li>
              <li>השורה הראשונה היא שורת כותרת (תדלג אוטומטית)</li>
              <li>
                סדר העמודות:
                <strong> שם פרטי, שם משפחה, כיתה, ת.ז. הורה 1, שם הורה 1, ת.ז. הורה 2, שם הורה 2, ת.ז. תלמיד</strong>
              </li>
              <li>העמודות <strong>שם פרטי, שם משפחה, ת.ז. הורה 1, שם הורה 1</strong> הן חובה</li>
              <li>עמודות <strong>ת.ז. הורה 2, שם הורה 2, ת.ז. תלמיד</strong> הן אופציונליות</li>
              <li>אם הורה כבר קיים במערכת (לפי ת.ז.) - שמו יעודכן</li>
              <li>אם יש עמודת <strong>id</strong> בהתחלה - ניתן לעדכן תלמידים קיימים (שימושי לעדכון ת.ז.)</li>
              <li>שמירת הקובץ: <strong>UTF-8 עם BOM</strong> מומלץ לעברית תקינה</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={downloadTemplate}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              הורד קובץ דוגמה
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload size={32} className="text-gray-400" />
              <span className="text-gray-600">
                {importing ? "מייבא..." : "לחץ לבחירת קובץ CSV"}
              </span>
            </label>
          </div>

          {importResult && (
            <div className="mt-4 space-y-2">
              {(importResult.created > 0 || importResult.updated > 0) && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-800 text-sm">
                  {importResult.created > 0 && (
                    <>יובאו בהצלחה <strong>{importResult.created}</strong> תלמידים</>
                  )}
                  {importResult.created > 0 && importResult.updated > 0 && " | "}
                  {importResult.updated > 0 && (
                    <>עודכנו <strong>{importResult.updated}</strong> תלמידים</>
                  )}
                </div>
              )}
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm">
                  <p className="font-medium text-red-800 mb-1">שגיאות:</p>
                  <ul className="list-disc list-inside text-red-700 space-y-0.5">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                placeholder="כיתה (לדוגמה: ג, ד׳1)"
                className="input-field"
              />
              <input
                type="text"
                value={form.childIsraeliId}
                onChange={(e) => setForm({ ...form, childIsraeliId: e.target.value })}
                placeholder="ת.ז. תלמיד (אופציונלי)"
                className="input-field"
                inputMode="numeric"
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
                {child.grade && (
                  <span className="text-sm text-gray-400 font-normal me-2">
                    {" "}
                    • כיתה {child.grade}
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-500">
                {child.totalPoints} נקודות • {child.percentage}%
              </p>
              <p className="text-xs text-gray-400">
                הורה 1: {child.parent1.displayName} ({child.parent1.israeliId})
                {child.parent2 &&
                  ` | הורה 2: ${child.parent2.displayName} (${child.parent2.israeliId})`}
                {child.israeliId && ` | ת.ז. תלמיד: ${child.israeliId}`}
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
            אין תלמידים עדיין. לחץ על &quot;הוספה&quot; או &quot;ייבוא CSV&quot; כדי להוסיף תלמידים.
          </p>
        )}
      </div>
    </div>
  );
}
