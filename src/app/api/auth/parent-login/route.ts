import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/auth";
import { normalizeIsraeliId } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { israeliId } = await request.json();

  if (!israeliId || typeof israeliId !== "string") {
    return NextResponse.json({ error: "נדרשת תעודת זהות" }, { status: 400 });
  }

  const cleanId = normalizeIsraeliId(israeliId);

  const parent = await prisma.parent.findUnique({
    where: { israeliId: cleanId },
  });

  if (!parent) {
    return NextResponse.json(
      { error: "תעודת זהות לא נמצאה במערכת" },
      { status: 404 }
    );
  }

  const response = NextResponse.json({ success: true, parentName: parent.displayName });
  const session = await getIronSession<SessionData>(request, response, {
    password: process.env.SESSION_SECRET || "this-is-a-dev-secret-change-in-production-32chars",
    cookieName: "yitgaber-session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax" as const,
    },
  });

  session.role = "parent";
  session.parentId = parent.id;
  await session.save();

  return response;
}
