import { getIronSession } from "iron-session";
import type { NextRequest } from "next/server";

export interface QuizSessionData {
  childId?: string;
}

const sessionPassword =
  process.env.SESSION_SECRET ||
  "this-is-a-dev-secret-change-in-production-32chars";

export async function getQuizSession(
  request: NextRequest,
  response: Response,
  gradeNumber: string
) {
  return getIronSession<QuizSessionData>(request, response, {
    password: sessionPassword,
    cookieName: `quiz-student-grade-${gradeNumber}`,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax" as const,
    },
  });
}
