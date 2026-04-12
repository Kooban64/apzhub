import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getIdentitySource } from "@/lib/adapters/env";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { clearSessionCookie } from "@/lib/auth/session-issuer.server";
import { decodeSessionTransportForServer } from "@/lib/auth/session-transport.server";
import { revokeAuthSessionById } from "@/lib/identity/local-auth-service";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";

export async function POST(request: Request) {
  const { attach } = apiCorrelationFromRequest(request);
  if (getIdentitySource() === "local") {
    const jar = await cookies();
    const raw = jar.get(SESSION_COOKIE_NAME)?.value;
    const snap = decodeSessionTransportForServer(raw);
    if (snap?.authSessionId) {
      await revokeAuthSessionById(snap.authSessionId).catch(() => undefined);
    }
  }
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return attach(res);
}
