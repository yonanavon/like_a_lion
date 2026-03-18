import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GRADE_MAP } from "@/lib/grades";
import { getQuizSession } from "@/lib/quiz-session";

export async function POST(request: NextRequest) {
  const { questionId, selectedAnswerIndex, grade } = await request.json();

  if (!questionId || selectedAnswerIndex === undefined || !grade) {
    return NextResponse.json(
      { error: "נדרשים: מזהה שאלה, תשובה, וכיתה" },
      { status: 400 }
    );
  }

  const gradeHebrew = GRADE_MAP[grade];
  if (!gradeHebrew) {
    return NextResponse.json({ error: "כיתה לא תקינה" }, { status: 400 });
  }

  const response = NextResponse.json({});
  const session = await getQuizSession(request, response, grade);

  if (!session.childId) {
    return NextResponse.json({ error: "לא מחובר" }, { status: 401 });
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question || question.grade !== gradeHebrew) {
    return NextResponse.json({ error: "שאלה לא נמצאה" }, { status: 404 });
  }

  // Check if already answered
  const existing = await prisma.questionAnswer.findUnique({
    where: {
      childId_questionId: {
        childId: session.childId,
        questionId,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "כבר ענית על שאלה זו" },
      { status: 409 }
    );
  }

  const isCorrect = selectedAnswerIndex === question.correctAnswerIndex;

  await prisma.questionAnswer.create({
    data: {
      childId: session.childId,
      questionId,
      selectedAnswerIndex,
      isCorrect,
    },
  });

  return NextResponse.json({
    isCorrect,
    correctAnswerIndex: question.correctAnswerIndex,
  });
}
