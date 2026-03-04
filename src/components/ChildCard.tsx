"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";

interface ChildCardProps {
  child: {
    id: string;
    firstName: string;
    lastName: string;
    totalPoints: number;
    percentage: number;
  };
}

export default function ChildCard({ child }: ChildCardProps) {
  const percentColor =
    child.percentage >= 80
      ? "text-green-600"
      : child.percentage >= 50
        ? "text-amber-600"
        : "text-red-500";

  return (
    <Link href={`/parent/child/${child.id}`}>
      <div className="card hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-blue-600">
              {child.firstName[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-lg">
              {child.firstName} {child.lastName}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1 text-gray-600">
                <Trophy size={14} />
                {child.totalPoints} נקודות
              </span>
              <span className={`font-medium ${percentColor}`}>
                {child.percentage}%
              </span>
            </div>
          </div>
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={
                  child.percentage >= 80
                    ? "#16A34A"
                    : child.percentage >= 50
                      ? "#D97706"
                      : "#EF4444"
                }
                strokeWidth="3"
                strokeDasharray={`${child.percentage}, 100`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {child.percentage}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
