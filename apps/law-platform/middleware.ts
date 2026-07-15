import { NextResponse, type NextRequest } from "next/server";

import { fetchMiddlewareSession } from "@apzhub/auth/middleware-session";

import { enforceTrafficGovernance } from "./lib/traffic-governance-middleware";
import { shouldApplyTrafficGovernance } from "@apzhub/platform-security/traffic-edge";

const publicPaths = ["/login", "/register", "/forgot-password", "/api/health"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldApplyTrafficGovernance(pathname)) {
    const trafficResponse = await enforceTrafficGovernance(request);
    if (trafficResponse) {
      return trafficResponse;
    }
  }

  if (publicPaths.some((p) => pathname === p || pathname.startsWith("/api/auth"))) {
    return NextResponse.next();
  }

  if (pathname === "/api/platform/v1/security/csp-report") {
    return NextResponse.next();
  }

  const session = await fetchMiddlewareSession(request);
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (shouldApplyTrafficGovernance(pathname)) {
    const trafficResponse = await enforceTrafficGovernance(request, {
      userId: session.user?.id,
      tenantId: session.tenantId,
    });
    if (trafficResponse) {
      return trafficResponse;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
