"use client";

import { useEffect, useState } from "react";
import ChildCard from "@/components/ChildCard";

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  totalPoints: number;
  percentage: number;
}

export default function ParentPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/parent/children")
      .then((r) => r.json())
      .then((data) => {
        setChildren(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">הילדים שלי</h2>
      <div className="space-y-3">
        {children.map((child) => (
          <ChildCard key={child.id} child={child} />
        ))}

        {children.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            לא נמצאו ילדים משויכים לחשבון שלך.
          </p>
        )}
      </div>
    </div>
  );
}
