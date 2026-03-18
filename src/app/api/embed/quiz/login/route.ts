import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GRADE_MAP } from "@/lib/grades";
import { normalizeIsraeliId } from "@/lib/auth";
import { getQuizSession } from "@/lib/quiz-session";

export async function POST(request: NextRequest) {
  const { israeliId, grade } = await request.json();

  if (!israeliId || !grade) {
    return NextResponse.json(
      { error: "נדרשים תעודת זהות ומספר כיתה" },
      { status: 400 }
    );
  }

  const gradeHebrew = GRADE_MAP[grade];
  if (!gradeHebrew) {
    return NextResponse.json({ error: "כיתה לא תקינה" }, { status: 400 });
  }

  const normalizedId = normalizeIsraeliId(israeliId);

  const child = await prisma.child.findUnique({
    where: { israeliId: normalizedId },
  });

  if (!child) {
    return NextResponse.json(
      { error: "תעודת זהות לא נמצאה במערכת" },
      { status: 404 }
    );
  }

  if (child.grade !== gradeHebrew) {
    return NextResponse.json(
      { error: "תעודת הזהות לא שייכת לכיתה זו" },
      { status: 403 }
    );
  }

  const response = NextResponse.json({
    success: true,
    studentName: `${child.firstName} ${child.lastName}`,
  });

  const session = await getQuizSession(request, response, grade);
  session.childId = child.id;
  await session.save();

  return response;
}
