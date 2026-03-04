"use client";

import { usePathname } from "next/navigation";
import AdminNav from "@/components/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <div>
      {!isLoginPage && <AdminNav />}
      <div className={isLoginPage ? "" : "max-w-4xl mx-auto p-4"}>
        {children}
      </div>
    </div>
  );
}
