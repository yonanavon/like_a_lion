import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIsraelToday, parseDate, formatDateStr, countActiveDays, isActiveDay } from "@/lib/dates";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date");
  const todayStr = getIsraelToday();
  const selectedDateStr = dateParam || todayStr;
  const selectedDate = parseDate(selectedDateStr);
  const today = parseDate(todayStr);

  const campaign = await prisma.campaign.findUnique({
    where: { id: "singleton" },
  });

  if (!campaign) {
    return NextResponse.json({ error: "לא הוגדר מבצע" }, { status: 404 });
  }

  const activeTasks = await prisma.task.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const allChildren = await prisma.child.findMany({
    include: { parent1: true, parent2: true },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const totalChildren = allChildren.length;
  const maxPointsPerDay = activeTasks.reduce((sum, t) => sum + t.points, 0);

  // --- Selected day data ---
  const dayCompletions = await prisma.taskCompletion.findMany({
    where: { date: selectedDate },
    include: { task: true },
  });

  // Children who reported at least one task on selected day
  const childrenWhoReported = new Set(dayCompletions.map((c) => c.childId));

  // Per-task stats for selected day
  const taskStats = activeTasks.map((task) => {
    const completions = dayCompletions.filter((c) => c.taskId === task.id);
    return {
      id: task.id,
      name: task.name,
      icon: task.icon,
      color: task.color,
      points: task.points,
      completedCount: completions.length,
      totalChildren,
      percentage: totalChildren > 0 ? Math.round((completions.length / totalChildren) * 100) : 0,
    };
  });

  // Per-child stats for selected day
  const childrenStats = allChildren.map((child) => {
    const childCompletions = dayCompletions.filter((c) => c.childId === child.id);
    const completedTaskIds = new Set(childCompletions.map((c) => c.taskId));
    const dayPoints = childCompletions.reduce((sum, c) => sum + c.task.points, 0);

    return {
      id: child.id,
      firstName: child.firstName,
      lastName: child.lastName,
      grade: child.grade,
      parent1Name: child.parent1.displayName,
      dayPoints,
      maxPointsPerDay,
      dayPercentage: maxPointsPerDay > 0 ? Math.round((dayPoints / maxPointsPerDay) * 100) : 0,
      completedTasks: activeTasks.map((t) => ({
        taskId: t.id,
        completed: completedTaskIds.has(t.id),
      })),
      reported: childCompletions.length > 0,
    };
  });

  // --- Overall campaign stats ---
  const activeDaysSoFar = countActiveDays(campaign.startDate, today, campaign.activeWeekdays);

  const allCompletions = await prisma.taskCompletion.findMany({
    include: { task: true },
  });

  const totalPointsAllChildren = allCompletions.reduce(
    (sum, c) => sum + c.task.points,
    0
  );
  const maxTotalPoints = activeDaysSoFar * maxPointsPerDay * totalChildren;
  const overallPercentage =
    maxTotalPoints > 0
      ? Math.round((totalPointsAllChildren / maxTotalPoints) * 100)
      : 0;

  // Per-child total points for leaderboard
  const childTotalPoints: Record<string, number> = {};
  for (const c of allCompletions) {
    childTotalPoints[c.childId] = (childTotalPoints[c.childId] || 0) + c.task.points;
  }

  const leaderboard = allChildren
    .map((child) => {
      const points = childTotalPoints[child.id] || 0;
      const maxPoints = activeDaysSoFar * maxPointsPerDay;
      return {
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        grade: child.grade,
        totalPoints: points,
        maxPoints,
        percentage: maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0,
      };
    })
    .sort((a, b) => b.percentage - a.percentage || b.totalPoints - a.totalPoints);

  // Grade breakdown
  const gradeMap: Record<string, { total: number; reported: number; points: number; maxPoints: number }> = {};
  for (const child of allChildren) {
    const grade = child.grade || "ללא כיתה";
    if (!gradeMap[grade]) {
      gradeMap[grade] = { total: 0, reported: 0, points: 0, maxPoints: 0 };
    }
    gradeMap[grade].total++;
    if (childrenWhoReported.has(child.id)) {
      gradeMap[grade].reported++;
    }
    gradeMap[grade].points += childTotalPoints[child.id] || 0;
    gradeMap[grade].maxPoints += activeDaysSoFar * maxPointsPerDay;
  }

  const gradeStats = Object.entries(gradeMap)
    .map(([grade, data]) => ({
      grade,
      ...data,
      reportingRate: data.total > 0 ? Math.round((data.reported / data.total) * 100) : 0,
      percentage: data.maxPoints > 0 ? Math.round((data.points / data.maxPoints) * 100) : 0,
    }))
    .sort((a, b) => a.grade.localeCompare(b.grade, "he"));

  // Daily history: reporting rate per active day
  const dailyHistory: { date: string; reported: number; total: number; percentage: number }[] = [];
  const d = new Date(campaign.startDate);
  while (d <= today) {
    if (isActiveDay(d, campaign.activeWeekdays)) {
      const dateStr = formatDateStr(d);
      const dateObj = parseDate(dateStr);
      const dayComps = allCompletions.filter(
        (c) => c.date.getTime() === dateObj.getTime()
      );
      const reportedSet = new Set(dayComps.map((c) => c.childId));
      dailyHistory.push({
        date: dateStr,
        reported: reportedSet.size,
        total: totalChildren,
        percentage: totalChildren > 0 ? Math.round((reportedSet.size / totalChildren) * 100) : 0,
      });
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }

  return NextResponse.json({
    selectedDate: selectedDateStr,
    today: todayStr,
    campaign: {
      startDate: formatDateStr(campaign.startDate),
      activeWeekdays: campaign.activeWeekdays,
      activeDaysSoFar,
    },
    overview: {
      totalChildren,
      reportedToday: childrenWhoReported.size,
      notReportedToday: totalChildren - childrenWhoReported.size,
      reportingRate: totalChildren > 0 ? Math.round((childrenWhoReported.size / totalChildren) * 100) : 0,
      totalPointsAllChildren,
      maxTotalPoints,
      overallPercentage,
      maxPointsPerDay,
      activeTasks: activeTasks.length,
    },
    taskStats,
    childrenStats,
    leaderboard,
    gradeStats,
    dailyHistory,
  });
}
