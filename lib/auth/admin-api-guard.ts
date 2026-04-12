import { NextResponse } from "next/server";

import { getSessionSnapshot } from "@/lib/auth/get-session-server";
import { canAccessAdminFromSnapshot } from "@/lib/auth/mode-contract";
import type { SessionSnapshot } from "@/lib/auth/session-types";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";

export async function requireAdminSession(request: Request): Promise<SessionSnapshot | NextResponse> {
  const { attach } = apiCorrelationFromRequest(request);
  const snapshot = await getSessionSnapshot();
  if (!canAccessAdminFromSnapshot(snapshot)) {
    return attach(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
  }
  return snapshot;
}
