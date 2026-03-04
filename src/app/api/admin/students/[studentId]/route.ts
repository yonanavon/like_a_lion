import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  const body = await request.json();
  const { firstName, lastName, grade, parent1Id, parent1Name, parent2Id, parent2Name } = body;

  const updateData: Record<string, unknown> = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (grade !== undefined) updateData.grade = grade;

  if (parent1Id && parent1Name) {
    const cleanId = parent1Id.replace(/\D/g, "");
    const p1 = await prisma.parent.upsert({
      where: { israeliId: cleanId },
      update: { displayName: parent1Name },
      create: { israeliId: cleanId, displayName: parent1Name },
    });
    updateData.parent1Id = p1.id;
  }

  if (parent2Id && parent2Name) {
    const cleanId = parent2Id.replace(/\D/g, "");
    const p2 = await prisma.parent.upsert({
      where: { israeliId: cleanId },
      update: { displayName: parent2Name },
      create: { israeliId: cleanId, displayName: parent2Name },
    });
    updateData.parent2Id = p2.id;
  } else if (parent2Id === "" || parent2Id === null) {
    updateData.parent2Id = null;
  }

  const child = await prisma.child.update({
    where: { id: params.studentId },
    data: updateData,
    include: { parent1: true, parent2: true },
  });

  return NextResponse.json(child);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  await prisma.child.delete({ where: { id: params.studentId } });
  return NextResponse.json({ success: true });
}
