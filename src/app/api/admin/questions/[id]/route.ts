import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { text, options, correctAnswerIndex } = body;

  const updateData: Record<string, unknown> = {};
  if (text !== undefined) updateData.text = text;
  if (options !== undefined) updateData.options = options;
  if (correctAnswerIndex !== undefined) updateData.correctAnswerIndex = correctAnswerIndex;

  try {
    const question = await prisma.question.update({
      where: { id: params.id },
      data: updateData,
    });
    return NextResponse.json(question);
  } catch {
    return NextResponse.json({ error: "שאלה לא נמצאה" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.question.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "שאלה לא נמצאה" }, { status: 404 });
  }
}
