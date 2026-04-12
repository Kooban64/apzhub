import { NextResponse } from "next/server";

import { appendControlPlaneAuditEvent } from "@/lib/adapters/audit/control-plane-adapter";
import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";
import { logStructured } from "@/lib/observability/log";

export async function POST(request: Request) {
  const { correlationId, attach } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return attach(NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }));
  }
  try {
    const ev = appendControlPlaneAuditEvent(body, { correlationId });
    logStructured("info", "audit", "audit event appended", { correlationId, id: ev.id });
    return attach(NextResponse.json({ ok: true as const, event: ev }));
  } catch {
    return attach(NextResponse.json({ error: "Invalid audit event payload." }, { status: 400 }));
  }
}
