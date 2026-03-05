"use client";

import Link from "next/link";
import { ListTodo, Users, Calendar, Megaphone, BarChart3 } from "lucide-react";

const sections = [
  {
    href: "/admin/dashboard",
    label: "דשבורד",
    desc: "תמונת מצב דיווחים ונקודות",
    icon: BarChart3,
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    href: "/admin/tasks",
    label: "ניהול משימות",
    desc: "הוספה, עריכה וניהול משימות",
    icon: ListTodo,
    color: "bg-blue-100 text-blue-600",
  },
  {
    href: "/admin/students",
    label: "ניהול תלמידים",
    desc: "הוספה, עריכה ומחיקת תלמידים",
    icon: Users,
    color: "bg-green-100 text-green-600",
  },
  {
    href: "/admin/days",
    label: "ימים",
    desc: "הגדרת תאריך התחלה וימים פעילים",
    icon: Calendar,
    color: "bg-purple-100 text-purple-600",
  },
  {
    href: "/admin/messages",
    label: "מבזקים",
    desc: "הודעות להורים בדף הכניסה",
    icon: Megaphone,
    color: "bg-amber-100 text-amber-600",
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ניהול המערכת</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <div className="card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${section.color}`}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h2 className="font-semibold">{section.label}</h2>
                    <p className="text-sm text-gray-500">{section.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
