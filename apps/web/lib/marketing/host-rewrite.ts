import { NextResponse, type NextRequest } from "next/server";

import { resolveMarketingSiteFromHost } from "@/lib/marketing/sites";

/**
 * Product brand hosts serve content under /qa or /pentest internally
 * while keeping public URLs at the root of that host.
 */
export function applyMarketingHostRewrite(request: NextRequest): NextResponse | null {
  const siteId = resolveMarketingSiteFromHost(request.headers.get("host"));
  if (siteId === "hub") return null;

  const { pathname } = request.nextUrl;
  const prefix = siteId === "qa" ? "/qa" : "/pentest";

  // Already on internal brand path (e.g. preview from hub host) — no rewrite.
  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    return null;
  }

  // Shared platform paths stay unprefixed on every host.
  const sharedPrefixes = [
    "/api",
    "/login",
    "/register",
    "/forgot-password",
    "/legal",
    "/pricing",
    "/contact",
    "/workspace",
    "/docs",
    "/_next",
  ];
  if (sharedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }

  const url = request.nextUrl.clone();
  if (pathname === "/") {
    url.pathname = prefix;
  } else {
    url.pathname = `${prefix}${pathname}`;
  }
  return NextResponse.rewrite(url);
}
