"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Trophy, Crown } from "lucide-react";

interface Child {
  name: string;
  totalPoints: number;
}

export default function LeaderboardEmbed() {
  const searchParams = useSearchParams();
  const grade = searchParams.get("grade");

  const [children, setChildren] = useState<Child[]>([]);
  const [gradeHebrew, setGradeHebrew] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!grade) {
      setError("לא צוין מספר כיתה");
      setLoading(false);
      return;
    }

    fetch(`/api/embed/leaderboard?grade=${grade}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setGradeHebrew(data.grade);
          setChildren(data.children);
        }
      })
      .catch(() => setError("שגיאה בטעינת הנתונים"))
      .finally(() => setLoading(false));
  }, [grade]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500 text-sm">{error}</div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        אין תלמידים עם נקודות בכיתה {gradeHebrew}׳
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-lg font-bold text-center mb-4 flex items-center justify-center gap-2">
        <Trophy size={20} className="text-amber-500" />
        מובילים - כיתה {gradeHebrew}׳
      </h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-start py-2 pe-2 w-10">#</th>
            <th className="text-start py-2">שם</th>
            <th className="text-center py-2 w-24">נקודות</th>
          </tr>
        </thead>
        <tbody>
          {children.map((child, idx) => (
            <tr
              key={idx}
              className={`border-b border-gray-100 ${
                idx < 3 ? "bg-amber-50" : ""
              }`}
            >
              <td className="py-2.5 pe-2">
                {idx < 3 ? (
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold ${
                      idx === 0
                        ? "bg-amber-400"
                        : idx === 1
                          ? "bg-gray-400"
                          : "bg-amber-600"
                    }`}
                  >
                    <Crown size={14} />
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-7 h-7 text-gray-500 font-medium">
                    {idx + 1}
                  </span>
                )}
              </td>
              <td className="py-2.5 font-medium">{child.name}</td>
              <td className="py-2.5 text-center">
                <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                  <Trophy size={14} />
                  {child.totalPoints}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
