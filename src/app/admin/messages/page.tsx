"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, EyeOff, X } from "lucide-react";

interface FlashMessage {
  id: string;
  content: string;
  isActive: boolean;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<FlashMessage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newContent, setNewContent] = useState("");

  const loadMessages = async () => {
    const res = await fetch("/api/admin/messages");
    setMessages(await res.json());
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newContent }),
    });

    setNewContent("");
    setShowForm(false);
    loadMessages();
  };

  const handleToggle = async (msg: FlashMessage) => {
    await fetch(`/api/admin/messages/${msg.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !msg.isActive }),
    });
    loadMessages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("למחוק את המבזק?")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    loadMessages();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">מבזקים</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>הוספה</span>
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">מבזק חדש</h2>
            <button onClick={() => setShowForm(false)}>
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="תוכן המבזק..."
              className="input-field min-h-[80px] resize-none"
              autoFocus
            />
            <button type="submit" className="btn-primary">
              הוספה
            </button>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`card flex items-center gap-3 ${
              !msg.isActive ? "opacity-50" : ""
            }`}
          >
            <p className="flex-1 text-sm">{msg.content}</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleToggle(msg)}
                className={`p-2 rounded-lg transition-colors ${
                  msg.isActive
                    ? "text-green-600 hover:bg-green-50"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
                title={msg.isActive ? "הסתרה" : "הצגה"}
              >
                {msg.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              <button
                onClick={() => handleDelete(msg.id)}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            אין מבזקים. לחץ על &quot;הוספה&quot; כדי ליצור מבזק חדש.
          </p>
        )}
      </div>
    </div>
  );
}
