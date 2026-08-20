import { checkDatabaseHealth, getEnv } from "@apzhub/config";
import { getDb, user } from "@apzhub/config/db";
import { listPlatformTenants } from "@apzhub/platform-identity/server";
import { checkRedisHealth } from "@apzhub/shared";

import { ensurePlatformRuntimeReady } from "@/lib/runtime-init";
import {
  loadActivityFrameworkHealthSummary,
  loadTimelineFrameworkHealthSummary,
} from "@/lib/activity-timeline-hydration";
import { loadEventFrameworkHealthSummary } from "@/lib/event-notification-hydration";
import { loadNotificationFrameworkHealthSummary } from "@/lib/event-notification-hydration";
import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";
import type {
  CapabilityHealthStatus,
  FieldAvailability,
  MetricField,
  OverviewWindow,
  PlatformAdminOverview,
} from "@/lib/platform-admin/overview-types";

function metricUnavailable<T = number>(message: string): MetricField<T> {
  return { availability: "unavailable", message };
}

function metricOk<T>(value: T): MetricField<T> {
  return { availability: "ok", value };
}

function mapDepStatus(status: string | undefined): CapabilityHealthStatus {
  if (!status) return "unavailable";
  if (status === "healthy" || status === "ok") return "healthy";
  if (status === "degraded") return "degraded";
  if (status === "unhealthy" || status === "error") return "unhealthy";
  return "unavailable";
}

function overallFromParts(
  parts: readonly CapabilityHealthStatus[],
): MetricField<"operational" | "degraded" | "unhealthy" | "unknown"> {
  if (parts.length === 0 || parts.every((p) => p === "unavailable")) {
    return {
      availability: "unavailable",
      value: "unknown",
      message: "Insufficient health signals",
    };
  }
  if (parts.some((p) => p === "unhealthy")) {
    return metricOk("unhealthy");
  }
  if (parts.some((p) => p === "degraded")) {
    return metricOk("degraded");
  }
  if (parts.some((p) => p === "healthy")) {
    return metricOk("operational");
  }
  return { availability: "unavailable", value: "unknown" };
}

/**
 * Build Overview payload from live platform sources.
 * Never invents commercial, provisioning, attention, or provider metrics.
 */
export async function buildPlatformAdminOverview(
  window: OverviewWindow = "24h",
): Promise<PlatformAdminOverview> {
  const env = getEnv();
  const generatedAt = new Date().toISOString();

  const [database, redis, bootstrap, notifications, events, activities, timelines] =
    await Promise.all([
      checkDatabaseHealth().catch(() => ({
        ok: false,
        latencyMs: 0,
        message: "check failed",
      })),
      checkRedisHealth().catch(() => ({
        ok: false,
        latencyMs: 0,
        message: "check failed",
      })),
      ensurePlatformRuntimeReady().catch(() => null),
      loadNotificationFrameworkHealthSummary().catch(() => undefined),
      loadEventFrameworkHealthSummary().catch(() => undefined),
      loadActivityFrameworkHealthSummary().catch(() => undefined),
      loadTimelineFrameworkHealthSummary().catch(() => undefined),
    ]);

  let tenantCount: number | null = null;
  let active = 0;
  let suspended = 0;
  let provisioningStatusCount = 0;
  let tenantsAvailability: FieldAvailability = "unavailable";
  let tenantsMessage: string | undefined = "Tenant directory unavailable";

  try {
    const tenants = await listPlatformTenants();
    tenantCount = tenants.length;
    tenantsAvailability = tenants.length === 0 ? "empty" : "ok";
    tenantsMessage = undefined;
    for (const t of tenants) {
      if (t.status === "active") active += 1;
      else if (t.status === "suspended" || t.status === "archived") suspended += 1;
      else if (t.status === "provisioning") provisioningStatusCount += 1;
    }
  } catch {
    tenantsAvailability = "error";
    tenantsMessage = "Failed to load tenants";
  }

  let userCount: number | null = null;
  let usersAvailability: FieldAvailability = "unavailable";
  let usersMessage: string | undefined = "User directory unavailable";
  if (process.env.DATABASE_URL) {
    try {
      const users = await getDb().select({ id: user.id }).from(user);
      userCount = users.length;
      usersAvailability = "ok";
      usersMessage = undefined;
    } catch {
      usersAvailability = "error";
      usersMessage = "Failed to load users";
    }
  }

  const identityStatus: CapabilityHealthStatus =
    database.ok && (bootstrap?.success ?? false)
      ? "healthy"
      : database.ok
        ? "degraded"
        : "unhealthy";

  const notificationsStatus = notifications
    ? mapDepStatus(
        typeof notifications === "object" &&
          notifications !== null &&
          "status" in notifications
          ? String((notifications as { status?: string }).status)
          : undefined,
      )
    : "unavailable";

  const activityStatus = activities
    ? mapDepStatus(
        typeof activities === "object" && activities !== null && "status" in activities
          ? String((activities as { status?: string }).status)
          : undefined,
      )
    : timelines
      ? mapDepStatus(
          typeof timelines === "object" && timelines !== null && "status" in timelines
            ? String((timelines as { status?: string }).status)
            : undefined,
        )
      : "unavailable";

  const eventsOk = Boolean(events);
  const realtimeStatus: CapabilityHealthStatus = redis.ok
    ? eventsOk
      ? "healthy"
      : "degraded"
    : "unavailable";

  // Capability names only — never provider implementation names on Overview.
  const capabilities = [
    {
      id: "identity",
      label: "Identity",
      status: identityStatus,
      message: database.ok ? undefined : database.message,
    },
    {
      id: "search",
      label: "Search",
      status: "unavailable" as const,
      message: "Platform search health is not exposed on this surface yet",
    },
    {
      id: "notifications",
      label: "Notifications",
      status: notificationsStatus,
    },
    {
      id: "activity",
      label: "Activity",
      status: activityStatus,
    },
    {
      id: "provisioning",
      label: "Provisioning",
      status: "unavailable" as const,
      message: "Provisioning queue metrics are not configured for Overview",
    },
    {
      id: "realtime",
      label: "Realtime",
      status: realtimeStatus,
      message: redis.ok ? undefined : "Redis unavailable",
    },
  ];

  const overall = overallFromParts(capabilities.map((c) => c.status));

  // Trial / commercial rollups are not yet a platform-admin aggregate API.
  const trialField = metricUnavailable(
    "Trial counts require commercial subscription aggregate (not configured)",
  );
  const provisioningIssuesField =
    tenantsAvailability === "ok" || tenantsAvailability === "empty"
      ? metricOk(provisioningStatusCount)
      : { availability: tenantsAvailability, message: tenantsMessage };

  return {
    generatedAt,
    window,
    environment: env.NODE_ENV,
    platformVersion: env.PLATFORM_VERSION ?? "—",
    platformStatus: {
      overall,
      tenants:
        tenantCount === null
          ? { availability: tenantsAvailability, message: tenantsMessage }
          : metricOk(tenantCount),
      users:
        userCount === null
          ? { availability: usersAvailability, message: usersMessage }
          : metricOk(userCount),
      providers: metricUnavailable(
        "Provider inventory is reserved for the Providers surface",
      ),
      warnings: metricUnavailable("Platform warning aggregate is not configured"),
    },
    tenants: {
      availability: tenantsAvailability,
      active:
        tenantsAvailability === "ok" || tenantsAvailability === "empty"
          ? metricOk(active)
          : { availability: tenantsAvailability, message: tenantsMessage },
      trial: trialField,
      suspended:
        tenantsAvailability === "ok" || tenantsAvailability === "empty"
          ? metricOk(suspended)
          : { availability: tenantsAvailability, message: tenantsMessage },
      provisioningIssues: provisioningIssuesField,
      href: `${PLATFORM_ADMIN_BASE}/tenants`,
    },
    platformHealth: {
      availability: "ok",
      capabilities,
    },
    provisioning: {
      availability: "not_configured",
      pending: metricUnavailable("Not configured"),
      processing: metricUnavailable("Not configured"),
      failed: metricUnavailable("Not configured"),
      completedToday: metricUnavailable("Not configured"),
      href: `${PLATFORM_ADMIN_BASE}/provisioning`,
      message:
        "Identity/product/provider provisioning queue is not wired to Platform Admin Overview yet",
    },
    billing: {
      availability: "not_configured",
      monthlyRevenue: metricUnavailable<string>(
        "Platform billing rollup not configured",
      ),
      outstanding: metricUnavailable<string>("Platform billing rollup not configured"),
      failedPayments: metricUnavailable("Platform billing rollup not configured"),
      renewals30d: metricUnavailable("Platform billing rollup not configured"),
      href: `${PLATFORM_ADMIN_BASE}/billing`,
      message:
        "Existing billing APIs are tenant-scoped; platform-wide commercial rollup is not available",
    },
    attention: {
      availability: "not_configured",
      items: [],
      href: `${PLATFORM_ADMIN_BASE}/incidents`,
      message: "Attention/issues aggregate is not configured",
    },
    activity: {
      availability: "not_configured",
      items: [],
      href: `${PLATFORM_ADMIN_BASE}/audit`,
      message:
        "Platform activity timeline for Overview is not configured (Audit screen comes later)",
    },
  };
}
