"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center">
            <img
              src="/logo-horizontal.png"
              alt="יתגבר כארי"
              className="h-9"
            />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>יציאה</span>
          </button>
        </div>
      </nav>
      <div className="max-w-lg mx-auto p-4">{children}</div>
    </div>
  );
}
