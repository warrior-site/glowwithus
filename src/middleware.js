import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token"); // your auth cookie
  const { pathname } = req.nextUrl;

  // ✅ allow public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // ❌ block everything else if not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
}

// ✅ apply to ALL routes except static files
export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};