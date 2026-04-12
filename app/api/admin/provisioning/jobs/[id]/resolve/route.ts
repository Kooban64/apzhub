import { NextResponse } from "next/server";

import { resolveManual } from "@/lib/adapters/provisioning/provisioning-adapter";
import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { attach } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  const { id } = await context.params;
  const ok = await resolveManual(id);
  if (!ok) {
    return attach(NextResponse.json({ error: "Resolve not allowed for this job." }, { status: 400 }));
  }
  return attach(NextResponse.json({ ok: true as const }));
}
