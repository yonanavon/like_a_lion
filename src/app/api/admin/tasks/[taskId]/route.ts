import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const body = await request.json();
  const { name, icon, color, points, isActive, sortOrder } = body;

  try {
    const task = await prisma.task.update({
      where: { id: params.taskId },
      data: {
        ...(name !== undefined && { name }),
        ...(icon !== undefined && { icon }),
        ...(color !== undefined && { color }),
        ...(points !== undefined && { points: Math.max(1, points) }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "משימה לא נמצאה" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    await prisma.task.delete({ where: { id: params.taskId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "משימה לא נמצאה" }, { status: 404 });
  }
}
