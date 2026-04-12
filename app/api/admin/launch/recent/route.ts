import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { toLaunchEventDto } from "@/lib/launch/launch-event-api";
import { listRecentLaunchFailures } from "@/lib/launch/repository/launch-events-repository";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";

export async function GET(request: Request) {
  const { attach } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  const rows = await listRecentLaunchFailures({ limit: 50 });
  return attach(NextResponse.json({ items: rows.map(toLaunchEventDto) }));
}
