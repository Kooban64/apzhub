import { NextResponse } from "next/server";

import { getProvisioningSource } from "@/lib/adapters/env";
import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";
import { isProvisioningEngineConfigured } from "@/lib/provisioning/service/provisioning-service";
import { runProvisioningWorkerTick } from "@/lib/provisioning/worker/runner";

/** Process at most one queued job (admin-gated dev / ops helper). */
export async function POST(_request: Request) {
  const { attach } = apiCorrelationFromRequest(_request);
  const gate = await requireAdminSession(_request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  if (getProvisioningSource() !== "real") {
    return attach(NextResponse.json({ error: "Worker tick requires APZHUB_PROVISIONING_SOURCE=real." }, { status: 400 }));
  }
  if (!isProvisioningEngineConfigured()) {
    return attach(NextResponse.json({ error: "Database not configured." }, { status: 503 }));
  }
  const ran = await runProvisioningWorkerTick();
  return attach(NextResponse.json({ ran }));
}
