import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const body = await request.json();
  const { name, icon, color, points, isActive, sortOrder } = body;

  const task = await prisma.task.update({
    where: { id: params.taskId },
    data: {
      ...(name !== undefined && { name }),
      ...(icon !== undefined && { icon }),
      ...(color !== undefined && { color }),
      ...(points !== undefined && { points }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  await prisma.task.delete({ where: { id: params.taskId } });
  return NextResponse.json({ success: true });
}
