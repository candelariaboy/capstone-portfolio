/**
 * Next.js Middleware for route protection
 * Verifies student_id exists in session before accessing dashboard routes
 */

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // Get student_id from URL searchParams (passed from landing page)
    const studentId = request.nextUrl.searchParams.get("student_id");

    // Check if student_id exists in request cookies or searchParams
    const sessionCookie = request.cookies.get("student_id");
    const hasValidSession = studentId || sessionCookie?.value;

    if (!hasValidSession) {
      // Redirect to landing page if no valid session
      const response = NextResponse.redirect(new URL("/", request.url));
      // Clear any invalid cookies
      response.cookies.delete("student_id");
      return response;
    }

    // If student_id in URL, set it as a cookie for future requests
    if (studentId && !sessionCookie) {
      const response = NextResponse.next();
      response.cookies.set("student_id", studentId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
      });
      return response;
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes - handled separately)
     * - public (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|public).*)",
  ],
};
