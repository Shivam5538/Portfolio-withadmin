import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET ?? "dev-secret-key-changed-to-force-logout-123";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Normalize trailing slash: '/admin/' -> '/admin'
  const cleanPath = pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;

  // 1. Allow static assets, NextAuth auth endpoints, public security endpoints, contact form, favicon, and Next.js internals
  if (
    cleanPath.startsWith("/api/auth") ||
    cleanPath.startsWith("/api/contact") ||
    cleanPath === "/api/admin/forgot-password" ||
    cleanPath === "/api/admin/reset-password" ||
    cleanPath === "/api/admin/confirm-email-change" ||
    cleanPath === "/admin/forgot-password" ||
    cleanPath === "/admin/reset-password" ||
    cleanPath === "/admin/confirm-email-change" ||
    cleanPath.startsWith("/_next") ||
    cleanPath.startsWith("/static") ||
    cleanPath === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Handle /admin and /admin/login explicitly (Always show login page form even with active session)
  if (cleanPath === "/admin" || cleanPath === "/admin/login") {
    return NextResponse.next();
  }

  // 3. Protect all other /admin routes (/admin/dashboard, /admin/projects, etc.)
  if (cleanPath.startsWith("/admin")) {
    const token = await getToken({ req: request, secret });
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Protect write mutations on API endpoints (POST, PUT, DELETE, PATCH)
  if (request.method !== "GET" && cleanPath.startsWith("/api/")) {
    const token = await getToken({ req: request, secret });
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized. Valid admin authentication token required." },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/:path*"],
};
