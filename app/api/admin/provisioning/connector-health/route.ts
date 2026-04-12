import { NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/auth/admin-api-guard";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";
import {
  getProvisioningConnectorHealthAdapterResults,
  listConnectors,
} from "@/lib/provisioning/connectors/registry";

/**
 * Diagnostics: connector registry metadata + mapped adapter-health rows (same shape as admin strip).
 */
export async function GET(request: Request) {
  const { attach } = apiCorrelationFromRequest(request);
  const gate = await requireAdminSession(request);
  if (gate instanceof NextResponse) {
    return gate;
  }
  return attach(
    NextResponse.json({
      connectors: listConnectors(),
      healthRows: getProvisioningConnectorHealthAdapterResults(),
    }),
  );
}
