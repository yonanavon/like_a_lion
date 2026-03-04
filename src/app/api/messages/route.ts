import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const messages = await prisma.flashMessage.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(messages);
}
