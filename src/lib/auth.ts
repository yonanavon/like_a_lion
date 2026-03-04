import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  role?: "parent" | "admin";
  parentId?: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || "this-is-a-dev-secret-change-in-production-32chars",
  cookieName: "yitgaber-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireParent() {
  const session = await getSession();
  if (session.role !== "parent" || !session.parentId) {
    return null;
  }
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (session.role !== "admin") {
    return null;
  }
  return session;
}
