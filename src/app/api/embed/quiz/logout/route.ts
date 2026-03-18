import { NextRequest, NextResponse } from "next/server";
import { getQuizSession } from "@/lib/quiz-session";

export async function POST(request: NextRequest) {
  const { grade } = await request.json();

  if (!grade) {
    return NextResponse.json({ error: "Missing grade" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  const session = await getQuizSession(request, response, grade);
  session.childId = undefined;
  await session.save();

  return response;
}
