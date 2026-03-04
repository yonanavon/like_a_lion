import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateChildPoints } from "@/lib/points";

export const dynamic = "force-dynamic";

export async function GET() {
  const children = await prisma.child.findMany({
    include: { parent1: true, parent2: true },
    orderBy: { lastName: "asc" },
  });

  const childrenWithPoints = await Promise.all(
    children.map(async (child) => {
      const points = await calculateChildPoints(child.id);
      return { ...child, ...points };
    })
  );

  return NextResponse.json(childrenWithPoints);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { firstName, lastName, grade, parent1Id, parent1Name, parent2Id, parent2Name } = body;

  if (!firstName || !lastName || !parent1Id || !parent1Name) {
    return NextResponse.json(
      { error: "שם פרטי, שם משפחה, ת.ז. הורה 1 ושם הורה 1 נדרשים" },
      { status: 400 }
    );
  }

  const cleanParent1Id = parent1Id.replace(/\D/g, "");
  const cleanParent2Id = parent2Id ? parent2Id.replace(/\D/g, "") : null;

  // Upsert parent 1
  const p1 = await prisma.parent.upsert({
    where: { israeliId: cleanParent1Id },
    update: { displayName: parent1Name },
    create: { israeliId: cleanParent1Id, displayName: parent1Name },
  });

  // Upsert parent 2 if provided
  let p2 = null;
  if (cleanParent2Id && parent2Name) {
    p2 = await prisma.parent.upsert({
      where: { israeliId: cleanParent2Id },
      update: { displayName: parent2Name },
      create: { israeliId: cleanParent2Id, displayName: parent2Name },
    });
  }

  const child = await prisma.child.create({
    data: {
      firstName,
      lastName,
      grade: grade || "",
      parent1Id: p1.id,
      parent2Id: p2?.id || null,
    },
    include: { parent1: true, parent2: true },
  });

  return NextResponse.json(child);
}
