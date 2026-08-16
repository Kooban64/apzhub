import { NextResponse, type NextRequest } from "next/server";

import { resolveMiddlewareSession } from "@apzhub/auth/middleware-session";

import { applyMarketingHostRewrite } from "./lib/marketing/host-rewrite";
import {
  enforceTrafficGovernance,
  shouldApplyLawTrafficGovernance,
  shouldApplyTrafficGovernance,
} from "./lib/traffic-governance-middleware";

const publicPaths = [
  "/",
  "/pricing",
  "/marketplace",
  "/build",
  "/onboarding",
  "/checkout",
  "/solutions",
  "/products",
  "/invite",
  "/contact",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify",
  "/api/health",
  "/qa",
  "/pentest",
  "/productivity",
  "/services",
  "/industries",
  "/case-studies",
  "/resources",
  "/about",
  "/methodology",
];

function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/legal/")) {
    return true;
  }

  if (
    publicPaths.some((p) => {
      if (p === "/") return pathname === "/";
      return pathname === p || pathname.startsWith(`${p}/`);
    })
  ) {
    return true;
  }

  if (pathname === "/api/v1/billing/catalogue") {
    return true;
  }

  if (pathname === "/api/law/v1/health" || pathname.startsWith("/api/law/v1/openapi")) {
    return true;
  }

  if (
    pathname === "/api/v1/health" ||
    pathname === "/api/v1/readiness" ||
    pathname.startsWith("/api/v1/openapi")
  ) {
    return true;
  }

  if (pathname.startsWith("/api/v1/")) {
    return true;
  }

  if (pathname === "/api/docs" || pathname.startsWith("/api/docs/")) {
    return true;
  }

  if (pathname === "/api/platform/v1/security/csp-report") {
    return true;
  }

  if (pathname === "/docs" || pathname.startsWith("/docs/")) {
    return true;
  }

  if (pathname.startsWith("/specs/collections")) {
    return true;
  }

  return false;
}

async function applySharedTrafficGovernance(
  request: NextRequest,
  input?: { readonly userId?: string; readonly tenantId?: string },
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (
    !shouldApplyTrafficGovernance(pathname) &&
    !shouldApplyLawTrafficGovernance(pathname)
  ) {
    return null;
  }

  if (pathname.startsWith("/api/law/") && !isPublicPath(pathname)) {
    return null;
  }

  return enforceTrafficGovernance(request, input);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const trafficResponse = await applySharedTrafficGovernance(request);
  if (trafficResponse) {
    return trafficResponse;
  }

  const hostRewrite = applyMarketingHostRewrite(request);

  if (isPublicPath(pathname)) {
    return hostRewrite ?? NextResponse.next();
  }

  // Product-host rewritten paths under /qa or /pentest are public marketing.
  if (hostRewrite) {
    return hostRewrite;
  }

  const sessionResult = await resolveMiddlewareSession(request);
  if (sessionResult.kind === "none") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  // Transient get-session failures (rate limit / 5xx / hairpin): keep cookies
  // and allow the page — route handlers re-check auth authoritatively.
  if (sessionResult.kind === "transient") {
    return NextResponse.next();
  }

  const session = sessionResult.session;
  const authenticatedTraffic = await applySharedTrafficGovernance(request, {
    userId: session.user?.id,
    tenantId: session.tenantId,
  });
  if (authenticatedTraffic) {
    return authenticatedTraffic;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
