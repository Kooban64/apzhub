import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { toLaunchEventDto } from "@/lib/launch/launch-event-api";
import { listRecentLaunchEvents } from "@/lib/launch/repository/launch-events-repository";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";

export async function GET(request: Request) {
  const { attach } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  const url = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") ?? "100") || 100));
  const rows = await listRecentLaunchEvents({ limit });
  return attach(NextResponse.json({ items: rows.map(toLaunchEventDto) }));
}
