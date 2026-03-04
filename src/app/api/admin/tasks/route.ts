import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, icon, color, points } = body;

  if (!name) {
    return NextResponse.json({ error: "שם משימה נדרש" }, { status: 400 });
  }

  const maxOrder = await prisma.task.aggregate({ _max: { sortOrder: true } });
  const task = await prisma.task.create({
    data: {
      name,
      icon: icon || "Star",
      color: color || "#3B82F6",
      points: points || 1,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  return NextResponse.json(task);
}
