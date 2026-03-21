import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const [completions, answers] = await Promise.all([
    prisma.taskCompletion.deleteMany({}),
    prisma.questionAnswer.deleteMany({}),
  ]);

  return NextResponse.json({
    deletedCompletions: completions.count,
    deletedAnswers: answers.count,
  });
}
