import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const messages = await prisma.flashMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const { content } = await request.json();

  if (!content) {
    return NextResponse.json({ error: "תוכן נדרש" }, { status: 400 });
  }

  const message = await prisma.flashMessage.create({
    data: { content },
  });

  return NextResponse.json(message);
}
