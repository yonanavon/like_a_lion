import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const grade = request.nextUrl.searchParams.get("grade");

  if (!grade) {
    return NextResponse.json({ error: "Missing grade parameter" }, { status: 400 });
  }

  const questions = await prisma.question.findMany({
    where: { grade },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(questions);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { text, grade, options, correctAnswerIndex } = body;

  if (!text || !grade || !options || options.length < 2 || correctAnswerIndex === undefined) {
    return NextResponse.json(
      { error: "נדרשים: טקסט שאלה, כיתה, לפחות 2 תשובות, ותשובה נכונה" },
      { status: 400 }
    );
  }

  if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
    return NextResponse.json(
      { error: "אינדקס תשובה נכונה לא תקין" },
      { status: 400 }
    );
  }

  const question = await prisma.question.create({
    data: {
      text,
      grade,
      options,
      correctAnswerIndex,
    },
  });

  return NextResponse.json(question);
}
