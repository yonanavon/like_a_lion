import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateChildPoints } from "@/lib/points";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET() {
  const [children, activeTasks] = await Promise.all([
    prisma.child.findMany({
      include: { parent1: true, parent2: true },
      orderBy: [{ grade: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.task.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // Fetch all completions grouped by child and task
  const allCompletions = await prisma.taskCompletion.findMany({
    select: { childId: true, taskId: true, task: { select: { points: true } } },
  });

  // Build a map: childId -> taskId -> total points earned
  const completionMap = new Map<string, Map<string, number>>();
  for (const c of allCompletions) {
    if (!completionMap.has(c.childId)) {
      completionMap.set(c.childId, new Map());
    }
    const taskMap = completionMap.get(c.childId)!;
    taskMap.set(c.taskId, (taskMap.get(c.taskId) || 0) + c.task.points);
  }

  const childrenWithPoints = await Promise.all(
    children.map(async (child) => {
      const points = await calculateChildPoints(child.id);
      const taskMap = completionMap.get(child.id);
      const row: Record<string, string | number> = {
        name: `${child.firstName} ${child.lastName}`,
        grade: child.grade,
        childIsraeliId: child.israeliId || "",
        parent1IsraeliId: child.parent1?.israeliId || "",
        parent2IsraeliId: child.parent2?.israeliId || "",
        totalPoints: points.totalPoints,
        percentage: points.percentage,
      };
      for (const task of activeTasks) {
        row[`task_${task.id}`] = taskMap?.get(task.id) || 0;
      }
      return row;
    })
  );

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("תלמידים");

  sheet.views = [{ rightToLeft: true }];

  sheet.columns = [
    { header: "שם", key: "name", width: 25 },
    { header: "כיתה", key: "grade", width: 12 },
    { header: "ת.ז. תלמיד", key: "childIsraeliId", width: 15 },
    { header: "ת.ז. הורה 1", key: "parent1IsraeliId", width: 15 },
    { header: "ת.ז. הורה 2", key: "parent2IsraeliId", width: 15 },
    { header: "סה״כ נקודות", key: "totalPoints", width: 15 },
    { header: "אחוז כללי", key: "percentage", width: 15 },
    ...activeTasks.map((task) => ({
      header: `${task.name} (${task.points} נק׳)`,
      key: `task_${task.id}`,
      width: 18,
    })),
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 12 };
  headerRow.alignment = { horizontal: "center" };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE2E8F0" },
  };

  for (const child of childrenWithPoints) {
    const row = sheet.addRow(child);
    row.getCell("percentage").value = child.percentage / 100;
  }

  // Format percentage column
  sheet.getColumn("percentage").numFmt = "0%";
  // Keep header text (not formatted as %)
  headerRow.getCell("percentage").numFmt = "@";
  headerRow.getCell("percentage").value = "אחוז כללי";

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="students.xlsx"',
    },
  });
}
