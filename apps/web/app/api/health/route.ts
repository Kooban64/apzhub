export const runtime = "nodejs";

import { checkDatabaseHealth, ensureLocalSecretsLoaded, getEnv } from "@apzhub/config";
import { probePlatformEmailHealth } from "@apzhub/platform-email/server";
import { checkRedisHealth } from "@apzhub/shared";
import type { PlatformHealthResponse } from "@apzhub/types";
import { NextResponse } from "next/server";

import { ensurePlatformRuntimeReady } from "@/lib/runtime-init";
import { getSharedPlatformSecurityService } from "@apzhub/platform-security";
import { loadActionRegistryHealthSummary } from "@/lib/command-hydration";
import {
  loadEventFrameworkHealthSummary,
  loadNotificationFrameworkHealthSummary,
} from "@/lib/event-notification-hydration";
import { loadKnowledgeHealthSummary } from "@/lib/knowledge-hydration";
import {
  loadActivityFrameworkHealthSummary,
  loadTimelineFrameworkHealthSummary,
} from "@/lib/activity-timeline-hydration";
import { getCoreQePersistenceHealth } from "@/lib/qep/persistence/resolve-core-qe-persistence";

export async function GET() {
  ensureLocalSecretsLoaded();
  const env = getEnv();
  const [
    database,
    redis,
    email,
    bootstrap,
    commands,
    knowledge,
    events,
    notifications,
    activities,
    timelines,
  ] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
    probePlatformEmailHealth().catch(() => ({
      configured: false,
      status: "unconfigured" as const,
      message: "probe_failed",
      checkedAt: new Date().toISOString(),
    })),
    ensurePlatformRuntimeReady().catch(() => null),
    loadActionRegistryHealthSummary().catch(() => undefined),
    loadKnowledgeHealthSummary().catch(() => undefined),
    loadEventFrameworkHealthSummary().catch(() => undefined),
    loadNotificationFrameworkHealthSummary().catch(() => undefined),
    loadActivityFrameworkHealthSummary().catch(() => undefined),
    loadTimelineFrameworkHealthSummary().catch(() => undefined),
  ]);

  const dependencies = {
    database: {
      status: database.ok ? ("healthy" as const) : ("unhealthy" as const),
      latencyMs: database.latencyMs,
      message: database.message,
    },
    redis: {
      status: redis.ok ? ("healthy" as const) : ("unhealthy" as const),
      latencyMs: redis.latencyMs,
      message: redis.message,
    },
    email: {
      status: email.status,
      configured: email.configured,
      host: email.host,
      port: email.port,
      from: email.from,
      message: email.message,
      checkedAt: email.checkedAt,
    },
  };

  const runtimeDiagnostics = bootstrap?.diagnostics;
  const runtimeHealthy = bootstrap?.success ?? false;

  const allHealthy = database.ok && redis.ok && runtimeHealthy;
  const anyDown = !database.ok || !redis.ok || !runtimeHealthy;

  const securityService = getSharedPlatformSecurityService();
  const securityDiagnostics =
    securityService.securityDiagnostics.getSecurityDiagnostics();

  const body: PlatformHealthResponse = {
    status: allHealthy ? "healthy" : anyDown ? "unhealthy" : "degraded",
    platformVersion: env.PLATFORM_VERSION,
    buildNumber: env.BUILD_NUMBER,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    dependencies,
    runtime: runtimeDiagnostics
      ? {
          status:
            runtimeDiagnostics.status === "ready" ||
            runtimeDiagnostics.status === "degraded"
              ? runtimeDiagnostics.status === "degraded"
                ? "degraded"
                : "healthy"
              : "unhealthy",
          platformReady: runtimeDiagnostics.platformReady,
          registryCount: runtimeDiagnostics.registryCount,
          capabilityCount: runtimeDiagnostics.capabilityCount,
          startupDurationMs: runtimeDiagnostics.startupDurationMs,
          healthSummary: runtimeDiagnostics.health.summary,
        }
      : undefined,
    commands,
    knowledge,
    events,
    notifications,
    activities,
    timelines,
    security: {
      environmentValid: securityDiagnostics.environment.valid,
      rateLimit: {
        backend: securityDiagnostics.rateLimit.backend,
        enabled: securityDiagnostics.rateLimit.enabled,
      },
    },
    // APZQEP-151: Core QE persistence provider (Caps A–F)
    coreQePersistence: getCoreQePersistenceHealth(),
  } as PlatformHealthResponse & {
    coreQePersistence: ReturnType<typeof getCoreQePersistenceHealth>;
  };

  return NextResponse.json(body, {
    status: allHealthy ? 200 : 503,
  });
}
