import { NextResponse } from "next/server";

import { getControlPlaneHomeData } from "@/lib/adapters/audit/control-plane-adapter";
import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";

export async function GET(request: Request) {
  const { attach } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  const data = getControlPlaneHomeData();
  return attach(NextResponse.json(data));
}
