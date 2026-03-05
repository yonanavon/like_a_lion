"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FlashMessages from "@/components/FlashMessage";

export default function LoginPage() {
  const [israeliId, setIsraeliId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/parent-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ israeliId }),
      });

      if (res.ok) {
        router.push("/parent");
      } else {
        const data = await res.json();
        setError(data.error || "שגיאה");
      }
    } catch {
      setError("שגיאת חיבור");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-orange-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img
            src="/logo-vertical.png"
            alt="יתגבר כארי"
            className="h-32 mx-auto mb-2"
          />
          <p className="text-amber-600 mt-1">מערכת מעקב משימות</p>
        </div>

        <FlashMessages />

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                תעודת זהות
              </label>
              <input
                type="text"
                value={israeliId}
                onChange={(e) => setIsraeliId(e.target.value)}
                placeholder="הזן ת.ז. הורה"
                className="input-field text-center text-xl tracking-widest"
                inputMode="numeric"
                maxLength={9}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || israeliId.length < 5}
              className="btn-primary w-full text-lg"
            >
              {loading ? "מתחבר..." : "כניסה"}
            </button>
          </form>
        </div>

        <p className="text-center mt-4">
          <a
            href="/admin/login"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            כניסת מנהל
          </a>
        </p>

        <div className="mt-8 flex justify-center">
          <img
            src="/school-logo.png"
            alt="תלמוד תורה חב״ד - ממ״ד נוף הגליל"
            className="h-16 opacity-80"
          />
        </div>
      </div>
    </div>
  );
}
