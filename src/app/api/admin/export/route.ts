import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateChildPoints } from "@/lib/points";
import ExcelJS from "exceljs";

export const dynamic = "force-dynamic";

export async function GET() {
  const children = await prisma.child.findMany({
    orderBy: [{ grade: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
  });

  const childrenWithPoints = await Promise.all(
    children.map(async (child) => {
      const points = await calculateChildPoints(child.id);
      return {
        name: `${child.firstName} ${child.lastName}`,
        grade: child.grade,
        totalPoints: points.totalPoints,
        percentage: points.percentage,
      };
    })
  );

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("תלמידים");

  sheet.views = [{ rightToLeft: true }];

  sheet.columns = [
    { header: "שם", key: "name", width: 25 },
    { header: "כיתה", key: "grade", width: 12 },
    { header: "סה״כ נקודות", key: "totalPoints", width: 15 },
    { header: "אחוז כללי", key: "percentage", width: 15 },
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
