import { NextResponse } from "next/server";

import { loadAdminAccessDataWithMeta } from "@/lib/adapters/access/access-adapter";
import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";
import { logStructured } from "@/lib/observability/log";

export async function GET(request: Request) {
  const { correlationId, attach } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  const { data, meta } = await loadAdminAccessDataWithMeta();
  logStructured("debug", "access", "admin access bundle served", { correlationId, origin: meta.origin });
  return attach(NextResponse.json({ ...data, _meta: meta }));
}
