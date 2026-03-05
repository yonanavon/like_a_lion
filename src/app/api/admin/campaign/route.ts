import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const campaign = await prisma.campaign.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      startDate: new Date(),
      activeWeekdays: [0, 1, 2, 3, 4, 5],
    },
  });

  return NextResponse.json(campaign);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { startDate, activeWeekdays } = body;

  const campaign = await prisma.campaign.upsert({
    where: { id: "singleton" },
    update: {
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(activeWeekdays !== undefined && { activeWeekdays }),
    },
    create: {
      id: "singleton",
      startDate: startDate ? new Date(startDate) : new Date(),
      activeWeekdays: activeWeekdays || [0, 1, 2, 3, 4, 5],
    },
  });

  return NextResponse.json(campaign);
}
