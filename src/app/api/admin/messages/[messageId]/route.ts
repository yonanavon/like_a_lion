import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  const body = await request.json();
  const { content, isActive } = body;

  const message = await prisma.flashMessage.update({
    where: { id: params.messageId },
    data: {
      ...(content !== undefined && { content }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json(message);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  await prisma.flashMessage.delete({ where: { id: params.messageId } });
  return NextResponse.json({ success: true });
}
