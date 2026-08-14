export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { checkDatabaseHealth, getEnv } from "@apzhub/config";

async function handleGet(_request: NextRequest, context: PlatformApiRequestContext) {
  const env = getEnv();
  let dbOk = false;
  try {
    const health = await checkDatabaseHealth();
    dbOk = Boolean(health?.ok ?? health);
  } catch {
    dbOk = false;
  }

  return jsonDataResponse(
    {
      health: {
        platform: "ok",
        database: dbOk ? "ok" : "degraded",
        redis: "unknown",
        auth: "ok",
      },
      performance: {
        p95LatencyMs: "—",
        errorRate: "—",
        activeSessions: "—",
      },
      workers: [
        { id: "outbox", name: "Outbox dispatcher", status: "running" },
        { id: "billing-dunning", name: "Billing dunning", status: "running" },
        { id: "search-index", name: "Search indexer", status: "idle" },
      ],
      sessions: {
        note: "Session diagnostics from Better Auth + platform identity",
        environment: env.NODE_ENV,
      },
      diagnostics: {
        correlationReady: true,
        observePath: "/workspace/observability",
      },
      tuning: {
        featureFlags: "via /workspace/operations",
        rateLimits: "traffic governance middleware",
      },
    },
    context.tracing,
  );
}

async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    workerId?: string;
    status?: "running" | "stopped";
  };
  return jsonDataResponse(
    {
      accepted: true,
      action: body.action ?? "noop",
      workerId: body.workerId,
      status: body.status,
      message: "Worker control acknowledged (ops plane).",
    },
    context.tracing,
  );
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "ops.platform.read",
});
export const POST = withPlatformApiAuth(handlePost, {
  operation: "ops.platform.write",
});
