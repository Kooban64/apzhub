export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { getEnv } from "@apzhub/config";
import { getSharedPlatformLifecycleManager } from "@apzhub/platform-lifecycle/server";
import { buildOperationsControlPlaneSnapshot } from "@apzhub/platform-operations/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import { loadConsolidatedOperationalDiagnostics } from "@/lib/operational-diagnostics";
import { ensurePlatformRuntimeReady } from "@/lib/runtime-init";

/** Canonical Platform Operations Control Plane diagnostics (PRH-008). */
export async function GET(): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute();
  if (!guard.ok) {
    return guard.response as NextResponse;
  }

  const env = getEnv();
  const bootstrap = await ensurePlatformRuntimeReady().catch(() => null);
  const consolidated = await loadConsolidatedOperationalDiagnostics();

  const snapshot = buildOperationsControlPlaneSnapshot({
    consolidated,
    bootstrapReady: bootstrap?.success ?? false,
    platformVersion: env.PLATFORM_VERSION,
    buildNumber: env.BUILD_NUMBER,
    environment: env.NODE_ENV,
    productStatuses: {
      "law-platform": consolidated.lawPlatform ? "healthy" : "degraded",
      "trust-accounting": consolidated.trustAccounting ? "healthy" : "degraded",
    },
    lifecycleRuntime: getSharedPlatformLifecycleManager().getRuntimeState(),
  });

  return NextResponse.json({ data: snapshot });
}
