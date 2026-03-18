import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GRADE_MAP } from "@/lib/grades";
import { getQuizSession } from "@/lib/quiz-session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const gradeParam = request.nextUrl.searchParams.get("grade");

  if (!gradeParam) {
    return NextResponse.json({ error: "Missing grade parameter" }, { status: 400 });
  }

  const gradeHebrew = GRADE_MAP[gradeParam];
  if (!gradeHebrew) {
    return NextResponse.json({ error: "Invalid grade" }, { status: 400 });
  }

  const questions = await prisma.question.findMany({
    where: { grade: gradeHebrew, isArchived: false },
    orderBy: { createdAt: "asc" },
  });

  // Check if student is logged in
  const response = NextResponse.json({});
  const session = await getQuizSession(request, response, gradeParam);

  let studentName: string | null = null;
  let quizPoints = 0;
  const answeredMap: Record<string, { selectedAnswerIndex: number; isCorrect: boolean }> = {};

  if (session.childId) {
    const child = await prisma.child.findUnique({
      where: { id: session.childId },
    });

    if (child) {
      studentName = `${child.firstName} ${child.lastName}`;

      const answers = await prisma.questionAnswer.findMany({
        where: { childId: session.childId },
      });

      for (const a of answers) {
        answeredMap[a.questionId] = {
          selectedAnswerIndex: a.selectedAnswerIndex,
          isCorrect: a.isCorrect,
        };
        if (a.isCorrect) quizPoints++;
      }
    } else {
      // Child was deleted, clear session
      session.childId = undefined;
      await session.save();
    }
  }

  const questionsForClient = questions.map((q) => {
    const answered = answeredMap[q.id];
    if (answered) {
      // Already answered: include correct answer for feedback
      return {
        id: q.id,
        text: q.text,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        answered: true,
        selectedAnswerIndex: answered.selectedAnswerIndex,
        isCorrect: answered.isCorrect,
      };
    }
    // Not answered: hide correct answer (anti-cheat)
    return {
      id: q.id,
      text: q.text,
      options: q.options,
      answered: false,
    };
  });

  const result = {
    grade: gradeHebrew,
    totalQuestions: questions.length,
    loggedIn: !!session.childId,
    studentName,
    quizPoints,
    questions: session.childId ? questionsForClient : [],
  };

  return NextResponse.json(result);
}
