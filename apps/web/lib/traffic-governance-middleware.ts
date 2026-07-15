import { NextResponse, type NextRequest } from "next/server";

import {
  buildEdgeTrafficDeniedInit,
  buildEdgeTrafficRequestContext,
  createEdgeTrafficDeniedBody,
  evaluateEdgeTraffic,
  shouldApplyLawTrafficGovernance,
  shouldApplyTrafficGovernance,
} from "@apzhub/platform-security/traffic-edge";

export async function enforceTrafficGovernance(
  request: NextRequest,
  input?: {
    readonly userId?: string;
    readonly tenantId?: string;
  },
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (!shouldApplyTrafficGovernance(pathname) && !shouldApplyLawTrafficGovernance(pathname)) {
    return null;
  }

  const decision = await evaluateEdgeTraffic(
    buildEdgeTrafficRequestContext({
      pathname,
      method: request.method,
      ip:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        "unknown",
      userId: input?.userId,
      tenantId: input?.tenantId ?? request.headers.get("x-tenant-id") ?? undefined,
    }),
  );

  if (!decision.allowed) {
    return NextResponse.json(createEdgeTrafficDeniedBody(), buildEdgeTrafficDeniedInit(decision));
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(decision.headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export { shouldApplyTrafficGovernance, shouldApplyLawTrafficGovernance };
