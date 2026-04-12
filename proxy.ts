/**
 * Next.js 16 request boundary (`proxy`). Keep redirects and matchers here; do not grow ad-hoc
 * “flash UX” via query params elsewhere — prefer a transient shell notification model later.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { canAccessPath } from "@/lib/auth/session-policy";
import { resolveSessionCookieForProxy } from "@/lib/auth/proxy-session-resolution";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/workspace") || pathname.startsWith("/admin") || pathname.startsWith("/profile");
  if (!isProtected) {
    return NextResponse.next();
  }

  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { credential, decoded } = await resolveSessionCookieForProxy(raw);

  if (credential !== "active" || !decoded) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    if (credential === "invalid") {
      url.searchParams.set("reason", "invalid");
    }
    if (credential === "expired") {
      url.searchParams.set("reason", "expired");
    }
    return NextResponse.redirect(url);
  }

  if (!canAccessPath(decoded, pathname)) {
    const url = request.nextUrl.clone();
    if (pathname.startsWith("/admin")) {
      url.pathname = "/workspace";
      url.searchParams.set("denied", "admin");
      return NextResponse.redirect(url);
    }
    url.pathname = "/workspace";
    url.searchParams.set("denied", "route");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/workspace/:path*", "/admin/:path*", "/profile/:path*"],
};
