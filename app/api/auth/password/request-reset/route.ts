import { NextResponse } from "next/server";

import { getIdentitySource } from "@/lib/adapters/env";
import { requestPasswordResetLocal } from "@/lib/identity/local-auth-service";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";

export async function POST(request: Request) {
  const { correlationId, attach } = apiCorrelationFromRequest(request);
  if (getIdentitySource() !== "local") {
    return attach(NextResponse.json({ error: "Password reset is only available with local identity." }, { status: 404 }));
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return attach(NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }));
  }
  const email =
    typeof body === "object" && body && "email" in body ? String((body as { email?: unknown }).email ?? "") : "";
  const r = await requestPasswordResetLocal(email, { correlationId });
  if (!r.ok) {
    return attach(NextResponse.json({ error: r.error }, { status: r.status }));
  }
  return attach(NextResponse.json({ ok: true as const }));
}
