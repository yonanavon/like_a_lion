"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ListTodo,
  Users,
  Calendar,
  Megaphone,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "ראשי", icon: LayoutDashboard },
  { href: "/admin/tasks", label: "משימות", icon: ListTodo },
  { href: "/admin/students", label: "תלמידים", icon: Users },
  { href: "/admin/days", label: "ימים", icon: Calendar },
  { href: "/admin/messages", label: "מבזקים", icon: Megaphone },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
