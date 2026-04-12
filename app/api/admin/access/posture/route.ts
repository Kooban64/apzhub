import { NextResponse } from "next/server";

import { getAdminAccessData } from "@/lib/adapters/access/access-adapter";
import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { readMatrixPostureFromModel } from "@/lib/launch/workspace-launch-bridge";
import { workspaceServiceIdSchema } from "@/lib/workspace/workspace-config";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";

export async function GET(request: Request) {
  const { attach } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? "";
  const serviceIdRaw = url.searchParams.get("serviceId") ?? "";
  const serviceParsed = workspaceServiceIdSchema.safeParse(serviceIdRaw);
  if (!userId.trim() || !serviceParsed.success) {
    return attach(NextResponse.json({ error: "userId and valid serviceId are required." }, { status: 400 }));
  }
  let data;
  try {
    data = await getAdminAccessData();
  } catch {
    return attach(
      NextResponse.json({ error: "Access catalog could not be loaded. Check database connectivity and logs." }, { status: 503 }),
    );
  }
  const posture = readMatrixPostureFromModel(data, userId.trim(), serviceParsed.data);
  return attach(NextResponse.json(posture));
}
