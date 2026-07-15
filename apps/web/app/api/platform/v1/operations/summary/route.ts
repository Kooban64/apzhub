export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { checkDatabaseHealth, getEnv } from "@apzhub/config";
import { getDb, user } from "@apzhub/config/db";
import { getSharedAuthorizationService } from "@apzhub/platform-authorization";
import { Runtime } from "@apzhub/platform-runtime/server";
import { checkRedisHealth } from "@apzhub/shared";
import type { PlatformHealthResponse } from "@apzhub/types";
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
import {
  getPlatformTenantDiagnostics,
  getSharedTenantManagementService,
  listPlatformTenants,
} from "@apzhub/platform-identity/server";

import { ensurePlatformRuntimeReady } from "@/lib/runtime-init";
import { loadConsolidatedOperationalDiagnostics } from "@/lib/operational-diagnostics";
import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import { getSharedPlatformSecurityService } from "@apzhub/platform-security";

export async function GET(): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute();
  if (!guard.ok) {
    return guard.response as NextResponse;
  }

  const env = getEnv();

  const [
    database,
    redis,
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
    ensurePlatformRuntimeReady().catch(() => null),
    loadActionRegistryHealthSummary().catch(() => undefined),
    loadKnowledgeHealthSummary().catch(() => undefined),
    loadEventFrameworkHealthSummary().catch(() => undefined),
    loadNotificationFrameworkHealthSummary().catch(() => undefined),
    loadActivityFrameworkHealthSummary().catch(() => undefined),
    loadTimelineFrameworkHealthSummary().catch(() => undefined),
  ]);

  const runtimeHealthy = bootstrap?.success ?? false;
  const allHealthy = database.ok && redis.ok && runtimeHealthy;
  const securityService = getSharedPlatformSecurityService();
  const securityDiagnostics = securityService.securityDiagnostics.getSecurityDiagnostics();
  const resilience = await securityService.resilience.getResilienceSnapshot({
    runtimeReady: runtimeHealthy,
  });
  const consolidatedDiagnostics = await loadConsolidatedOperationalDiagnostics();

  const health: PlatformHealthResponse = {
    status: allHealthy ? "healthy" : "unhealthy",
    platformVersion: env.PLATFORM_VERSION,
    buildNumber: env.BUILD_NUMBER,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    dependencies: {
      database: {
        status: database.ok ? "healthy" : "unhealthy",
        latencyMs: database.latencyMs,
        message: database.message,
      },
      redis: {
        status: redis.ok ? "healthy" : "unhealthy",
        latencyMs: redis.latencyMs,
        message: redis.message,
      },
    },
    runtime: bootstrap?.diagnostics
      ? {
          status: bootstrap.diagnostics.platformReady ? "healthy" : "degraded",
          platformReady: bootstrap.diagnostics.platformReady,
          registryCount: bootstrap.diagnostics.registryCount,
          capabilityCount: bootstrap.diagnostics.capabilityCount,
          startupDurationMs: bootstrap.diagnostics.startupDurationMs,
          healthSummary: bootstrap.diagnostics.health.summary,
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
  };

  const authService = getSharedAuthorizationService();
  let tenantCount = getSharedTenantManagementService().listTenants().length;
  let userCount = 0;

  if (process.env.DATABASE_URL) {
    try {
      const postgresTenants = await listPlatformTenants();
      tenantCount = postgresTenants.length;
      const users = await getDb().select({ id: user.id }).from(user);
      userCount = users.length;
    } catch {
      // Use in-memory counts when database unavailable.
    }
  }

  let identityDiagnostics: Record<string, unknown> | null = null;
  let authorizationDiagnostics: Record<string, unknown> | null = null;

  try {
    const postgresTenantDiagnostics = process.env.DATABASE_URL
      ? await getPlatformTenantDiagnostics()
      : null;
    identityDiagnostics = {
      inMemory: getSharedTenantManagementService().getDiagnostics(),
      postgres: postgresTenantDiagnostics,
    };
  } catch {
    identityDiagnostics = null;
  }

  authorizationDiagnostics = {
    inMemory: authService.getDiagnostics(),
  };

  const registry = bootstrap?.success ? Runtime.registry() : null;

  return NextResponse.json({
    data: {
      health,
      tenants: { count: tenantCount },
      users: { count: userCount },
      roles: { count: authService.listRoles().length },
      permissions: { count: authService.listPermissions().length },
      modules: { count: registry?.getModules().length ?? 0 },
      services: { count: registry?.getServices().length ?? 0 },
      products: {
        count:
          registry?.getServices().filter((item) => item.metadata.category === "product")
            .length ?? 0,
      },
      identityDiagnostics,
      authorizationDiagnostics,
      securitySummary: {
        status: resilience.health.status,
        security: securityDiagnostics,
        resilience,
      },
      consolidatedDiagnostics,
      generatedAt: new Date().toISOString(),
    },
  });
}
