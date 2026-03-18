import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import type { SessionData } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  if (
    pathname === "/login" ||
    pathname === "/admin/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/messages") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, {
    password:
      process.env.SESSION_SECRET ||
      "this-is-a-dev-secret-change-in-production-32chars",
    cookieName: "yitgaber-session",
  });

  // Protect parent routes
  if (pathname.startsWith("/parent") || pathname.startsWith("/api/parent") || pathname.startsWith("/api/children")) {
    if (session.role !== "parent" || !session.parentId) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect admin routes
  if ((pathname.startsWith("/admin") && pathname !== "/admin/login") || pathname.startsWith("/api/admin")) {
    // Questions routes: allow admin or teacher
    const isQuestionsRoute =
      pathname.startsWith("/admin/questions") ||
      pathname.startsWith("/api/admin/questions");

    if (isQuestionsRoute) {
      if (session.role !== "admin" && session.role !== "teacher") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } else {
      if (session.role !== "admin") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
