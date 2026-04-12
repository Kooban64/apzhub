import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getSessionSnapshot } from "@/lib/auth/get-session-server";
import { resolveSessionCookieForServer } from "@/lib/auth/session-resolution.server";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";

export async function GET(request: Request) {
  const { attach } = apiCorrelationFromRequest(request);
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE_NAME)?.value;
  const { credential } = resolveSessionCookieForServer(raw);
  const snapshot = await getSessionSnapshot();
  return attach(NextResponse.json({ snapshot, credential }));
}
