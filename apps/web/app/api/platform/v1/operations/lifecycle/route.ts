export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { getEnv } from "@apzhub/config";
import {
  getSharedPlatformLifecycleManager,
  type LifecycleOperatorAction,
} from "@apzhub/platform-lifecycle/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import { loadConsolidatedOperationalDiagnostics } from "@/lib/operational-diagnostics";
import { ensurePlatformRuntimeReady } from "@/lib/runtime-init";

function buildLifecycleInput(
  consolidated: Awaited<ReturnType<typeof loadConsolidatedOperationalDiagnostics>>,
  bootstrapReady: boolean,
) {
  const env = getEnv();
  return {
    consolidated,
    bootstrapReady,
    platformVersion: env.PLATFORM_VERSION,
    buildNumber: env.BUILD_NUMBER,
    environment: env.NODE_ENV,
    productStatuses: {
      "law-platform": consolidated.lawPlatform ? "healthy" : "degraded",
      "trust-accounting": consolidated.trustAccounting ? "healthy" : "degraded",
    },
  } as const;
}

/** Canonical Platform Lifecycle snapshot and operator actions (PRH-009). */
export async function GET(): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute();
  if (!guard.ok) {
    return guard.response as NextResponse;
  }

  const bootstrap = await ensurePlatformRuntimeReady().catch(() => null);
  const consolidated = await loadConsolidatedOperationalDiagnostics();
  const manager = getSharedPlatformLifecycleManager();
  const snapshot = manager.snapshot(
    buildLifecycleInput(consolidated, bootstrap?.success ?? false),
  );

  return NextResponse.json({ data: snapshot });
}

const ALLOWED_ACTIONS = new Set<LifecycleOperatorAction>([
  "enter-maintenance",
  "exit-maintenance",
  "begin-shutdown",
  "complete-shutdown",
  "begin-recovery",
]);

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute();
  if (!guard.ok) {
    return guard.response as NextResponse;
  }

  let body: { action?: string };
  try {
    body = (await request.json()) as { action?: string };
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "JSON body required." } },
      { status: 400 },
    );
  }

  const action = body.action as LifecycleOperatorAction | undefined;
  if (!action || !ALLOWED_ACTIONS.has(action)) {
    return NextResponse.json(
      { error: { code: "INVALID_ACTION", message: "Unsupported lifecycle action." } },
      { status: 400 },
    );
  }

  const bootstrap = await ensurePlatformRuntimeReady().catch(() => null);
  const consolidated = await loadConsolidatedOperationalDiagnostics();
  const manager = getSharedPlatformLifecycleManager();
  const result = manager.applyAction(
    action,
    buildLifecycleInput(consolidated, bootstrap?.success ?? false),
  );
  const snapshot = manager.snapshot(
    buildLifecycleInput(consolidated, bootstrap?.success ?? false),
  );

  return NextResponse.json({ data: { result, snapshot } });
}
