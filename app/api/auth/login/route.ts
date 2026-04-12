import { NextResponse } from "next/server";

import { getIdentityAdapter } from "@/lib/adapters/identity";
import { getIdentitySource } from "@/lib/adapters/env";
import { canAccessAdminFromSnapshot } from "@/lib/auth/mode-contract";
import { appendSessionCookie } from "@/lib/auth/session-issuer.server";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";
import { logStructured } from "@/lib/observability/log";

export async function POST(request: Request) {
  const { correlationId, attach } = apiCorrelationFromRequest(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return attach(NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }));
  }
  const email = typeof body === "object" && body && "email" in body ? String((body as { email?: unknown }).email ?? "") : "";
  const password =
    typeof body === "object" && body && "password" in body ? String((body as { password?: unknown }).password ?? "") : "";

  const adapter = getIdentityAdapter();
  const result = await adapter.loginWithPassword(email, password, {
    correlationId,
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  if (!result.ok) {
    logStructured("warn", "identity", "login rejected", { correlationId, kind: adapter.kind });
    return attach(
      NextResponse.json(
        {
          error: result.error,
          ...(result.ssoAuthorizePath ? { ssoAuthorizePath: result.ssoAuthorizePath } : {}),
        },
        { status: 400 },
      ),
    );
  }

  const res = NextResponse.json({
    ok: true as const,
    defaultLandingPath: result.snapshot.defaultLandingPath,
    canAccessAdmin: canAccessAdminFromSnapshot(result.snapshot),
  });
  appendSessionCookie(res, result.snapshot, {
    mode: getIdentitySource(),
    correlationId,
  });
  logStructured("info", "identity", "password login session issued", { correlationId, kind: adapter.kind });
  return attach(res);
}
