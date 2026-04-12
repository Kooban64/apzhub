import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";
import { getProvisioningAttemptSummary } from "@/lib/provisioning/repository/jobs-repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { attach } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  const { id } = await context.params;
  const summary = await getProvisioningAttemptSummary(id);
  if (!summary) {
    return attach(NextResponse.json({ error: "Job not found." }, { status: 404 }));
  }
  return attach(NextResponse.json(summary));
}
