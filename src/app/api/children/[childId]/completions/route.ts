import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/auth";
import { getIsraelToday, parseDate, isActiveDay } from "@/lib/dates";

export const dynamic = "force-dynamic";

async function verifyParentOwnsChild(parentId: string, childId: string) {
  const child = await prisma.child.findFirst({
    where: {
      id: childId,
      OR: [{ parent1Id: parentId }, { parent2Id: parentId }],
    },
  });
  return child;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  const session = await requireParent();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const child = await verifyParentOwnsChild(session.parentId!, params.childId);
  if (!child) {
    return NextResponse.json({ error: "ילד לא נמצא" }, { status: 404 });
  }

  const dateStr =
    request.nextUrl.searchParams.get("date") || getIsraelToday();
  const date = parseDate(dateStr);

  const tasks = await prisma.task.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const completions = await prisma.taskCompletion.findMany({
    where: {
      childId: params.childId,
      date: date,
    },
  });

  const completedTaskIds = new Set(completions.map((c) => c.taskId));

  const campaign = await prisma.campaign.findUnique({
    where: { id: "singleton" },
  });

  const tasksWithStatus = tasks.map((task) => ({
    ...task,
    isCompleted: completedTaskIds.has(task.id),
  }));

  return NextResponse.json({
    child,
    tasks: tasksWithStatus,
    date: dateStr,
    campaign: campaign
      ? {
          startDate: campaign.startDate,
          activeWeekdays: campaign.activeWeekdays,
          maxBackDays: campaign.maxBackDays,
        }
      : null,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  const session = await requireParent();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const child = await verifyParentOwnsChild(session.parentId!, params.childId);
  if (!child) {
    return NextResponse.json({ error: "ילד לא נמצא" }, { status: 404 });
  }

  const { taskId, date: dateStr } = await request.json();

  if (!taskId || !dateStr) {
    return NextResponse.json({ error: "חסרים נתונים" }, { status: 400 });
  }

  const date = parseDate(dateStr);
  const today = parseDate(getIsraelToday());

  // Don't allow future dates
  if (date > today) {
    return NextResponse.json(
      { error: "לא ניתן לדווח על תאריך עתידי" },
      { status: 400 }
    );
  }

  // Check campaign constraints
  const campaign = await prisma.campaign.findUnique({
    where: { id: "singleton" },
  });

  // Only allow reporting up to maxBackDays in the past
  const maxBackDays = campaign?.maxBackDays ?? 1;
  const earliest = new Date(today);
  earliest.setUTCDate(earliest.getUTCDate() - maxBackDays);
  if (date < earliest) {
    return NextResponse.json(
      { error: `לא ניתן לדווח על תאריך שעבר יותר מ-${maxBackDays} ימים` },
      { status: 400 }
    );
  }

  if (campaign) {
    if (date < campaign.startDate) {
      return NextResponse.json(
        { error: "לא ניתן לדווח לפני תחילת המבצע" },
        { status: 400 }
      );
    }

    if (!isActiveDay(date, campaign.activeWeekdays)) {
      return NextResponse.json(
        { error: "יום זה אינו פעיל במבצע" },
        { status: 400 }
      );
    }
  }

  // Toggle: if exists delete, if not create
  const existing = await prisma.taskCompletion.findUnique({
    where: {
      childId_taskId_date: {
        childId: params.childId,
        taskId,
        date,
      },
    },
  });

  if (existing) {
    await prisma.taskCompletion.delete({ where: { id: existing.id } });
    return NextResponse.json({ isCompleted: false });
  } else {
    await prisma.taskCompletion.create({
      data: {
        childId: params.childId,
        taskId,
        date,
      },
    });
    return NextResponse.json({ isCompleted: true });
  }
}
