import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateChildPoints } from "@/lib/points";

export const dynamic = "force-dynamic";

const GRADE_MAP: Record<string, string> = {
  "1": "א",
  "2": "ב",
  "3": "ג",
  "4": "ד",
  "5": "ה",
  "6": "ו",
  "7": "ז",
  "8": "ח",
};

export async function GET(request: NextRequest) {
  const gradeParam = request.nextUrl.searchParams.get("grade");

  if (!gradeParam) {
    return NextResponse.json({ error: "Missing grade parameter" }, { status: 400 });
  }

  const gradeHebrew = GRADE_MAP[gradeParam];
  if (!gradeHebrew) {
    return NextResponse.json({ error: "Invalid grade" }, { status: 400 });
  }

  const children = await prisma.child.findMany({
    where: { grade: gradeHebrew },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const results = await Promise.all(
    children.map(async (child) => {
      const points = await calculateChildPoints(child.id);
      return {
        name: `${child.firstName} ${child.lastName}`,
        totalPoints: points.totalPoints,
      };
    })
  );

  // Sort by points descending
  const sorted = results.sort((a, b) => b.totalPoints - a.totalPoints);

  return NextResponse.json({ grade: gradeHebrew, children: sorted });
}
