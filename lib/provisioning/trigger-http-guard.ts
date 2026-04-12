import { NextResponse } from "next/server";

import { getProvisioningSource } from "@/lib/adapters/env";
import { isProvisioningEngineConfigured } from "@/lib/provisioning/service/provisioning-service";

/** Shared guard for access→provisioning POST routes. */
export function provisioningTriggersUnavailableResponse(): NextResponse | null {
  if (getProvisioningSource() !== "real") {
    return NextResponse.json(
      { error: "Access provisioning triggers require APZHUB_PROVISIONING_SOURCE=real." },
      { status: 400 },
    );
  }
  if (!isProvisioningEngineConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }
  return null;
}
