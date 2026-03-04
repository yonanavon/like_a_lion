import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireParent } from "@/lib/auth";
import { calculateChildPoints } from "@/lib/points";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireParent();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const children = await prisma.child.findMany({
    where: {
      OR: [
        { parent1Id: session.parentId },
        { parent2Id: session.parentId },
      ],
    },
    orderBy: { firstName: "asc" },
  });

  const childrenWithPoints = await Promise.all(
    children.map(async (child) => {
      const points = await calculateChildPoints(child.id);
      return { ...child, ...points };
    })
  );

  return NextResponse.json(childrenWithPoints);
}
