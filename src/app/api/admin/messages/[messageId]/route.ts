import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  const body = await request.json();
  const { content, isActive } = body;

  try {
    const message = await prisma.flashMessage.update({
      where: { id: params.messageId },
      data: {
        ...(content !== undefined && { content }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "מבזק לא נמצא" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    await prisma.flashMessage.delete({ where: { id: params.messageId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "מבזק לא נמצא" }, { status: 404 });
  }
}
