import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token");
  const { pathname } = req.nextUrl;

  // ✅ allow public routes + ALL APIs
  if (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // ❌ protect pages only
  if (!token) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};