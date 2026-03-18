import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  const isAdmin = password === process.env.ADMIN_PASSWORD;
  const isTeacher = !isAdmin && !!process.env.TEACHER_PASSWORD && password === process.env.TEACHER_PASSWORD;

  if (!isAdmin && !isTeacher) {
    return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  const session = await getIronSession<SessionData>(request, response, {
    password: process.env.SESSION_SECRET || "this-is-a-dev-secret-change-in-production-32chars",
    cookieName: "yitgaber-session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax" as const,
    },
  });

  session.role = isAdmin ? "admin" : "teacher";
  await session.save();

  return response;
}
