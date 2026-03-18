import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: params.id },
    });

    if (!question) {
      return NextResponse.json({ error: "שאלה לא נמצאה" }, { status: 404 });
    }

    const updated = await prisma.question.update({
      where: { id: params.id },
      data: { isArchived: !question.isArchived },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "שגיאה" }, { status: 500 });
  }
}
