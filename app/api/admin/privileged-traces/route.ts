import { NextResponse } from "next/server";

import { getPrivilegedTracesData } from "@/lib/adapters/audit/control-plane-adapter";
import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";

export async function GET(request: Request) {
  const { attach } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  const items = getPrivilegedTracesData();
  return attach(NextResponse.json({ items }));
}
