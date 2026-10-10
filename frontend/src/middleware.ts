import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hasSession =
    request.cookies.get("access_token")?.value

  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/" || pathname === "/register";

  const isProtectedPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/expense") ||
    pathname.startsWith("/savings");

  // Not logged in, trying to open a protected page -> go to login
  if (!hasSession && isProtectedPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Already logged in, opening login/register -> go to dashboard
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/register",
    "/dashboard/:path*",
    "/expense/:path*",
    "/savings/:path*",
  ],
};
