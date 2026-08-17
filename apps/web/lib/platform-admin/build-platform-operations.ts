/**
 * Platform Admin — Operations (APZ capability language).
 * Provider failures translate into capability impact — never show Plane/Zammad here.
 */

import { checkDatabaseHealth, getEnv } from "@apzhub/config";
import { checkRedisHealth } from "@apzhub/shared";

import {
  loadActivityFrameworkHealthSummary,
  loadTimelineFrameworkHealthSummary,
} from "@/lib/activity-timeline-hydration";
import { loadEventFrameworkHealthSummary } from "@/lib/event-notification-hydration";
import { loadNotificationFrameworkHealthSummary } from "@/lib/event-notification-hydration";
import { ensurePlatformRuntimeReady } from "@/lib/runtime-init";
import {
  listIntegrationManifestsFromDisk,
  providerConnectionPosture,
} from "@/lib/platform-admin/integration-manifests";
import {
  normalizeOpsStatus,
  opsField,
  worstOpsStatus,
  type OpsStatus,
  type OpsStatusField,
} from "@/lib/platform-admin/ops-status";
import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";

export type OperationsCapabilityRow = {
  readonly id: string;
  readonly label: string;
  readonly health: OpsStatusField;
  readonly providerHint?: string;
};

export type OperationsIssue = {
  readonly severity: "warning" | "error";
  readonly title: string;
  readonly detail: string;
  readonly href?: string;
};

export type PlatformOperationsPayload = {
  readonly generatedAt: string;
  readonly environment: string;
  readonly core: readonly OperationsCapabilityRow[];
  readonly products: readonly OperationsCapabilityRow[];
  readonly issues: readonly OperationsIssue[];
  readonly note: string;
};

function mapRuntime(status: string | undefined): OpsStatus {
  return normalizeOpsStatus(status);
}

function capabilityFromProviderHealth(
  capability: string,
  providerId: string,
): OpsStatusField {
  const posture = providerConnectionPosture(providerId);
  if (!posture.connectionConfigured && !posture.authConfigured) {
    return opsField(
      "not_configured",
      `${capability} implementation provider connection not configured`,
    );
  }
  // Configured provider without live probe → Unknown (shows as Health unavailable pattern)
  return opsField(
    "unknown",
    `${capability} depends on ${providerId}; live health probe unavailable in Platform Admin`,
  );
}

export async function buildPlatformAdminOperations(): Promise<PlatformOperationsPayload> {
  const env = getEnv();
  const generatedAt = new Date().toISOString();

  const [database, redis, bootstrap, notifications, events, activities, timelines] =
    await Promise.all([
      checkDatabaseHealth().catch(() => null),
      checkRedisHealth().catch(() => null),
      ensurePlatformRuntimeReady().catch(() => null),
      loadNotificationFrameworkHealthSummary().catch(() => undefined),
      loadEventFrameworkHealthSummary().catch(() => undefined),
      loadActivityFrameworkHealthSummary().catch(() => undefined),
      loadTimelineFrameworkHealthSummary().catch(() => undefined),
    ]);

  const identity: OpsStatusField = database?.ok
    ? opsField("healthy", "Database reachable")
    : opsField("unavailable", database?.message ?? "Database health check failed");

  const search: OpsStatusField = opsField(
    "unknown",
    "Search capability health feed not wired into Platform Admin Operations",
  );

  const notificationsHealth: OpsStatusField = notifications
    ? opsField(mapRuntime(notifications.status), "Notification framework")
    : opsField("unknown", "Notification framework summary unavailable");

  const activity: OpsStatusField = activities
    ? opsField(mapRuntime(activities.status), "Activity framework")
    : opsField("unknown", "Activity framework summary unavailable");

  const command: OpsStatusField = opsField(
    "not_configured",
    "Command palette health not configured for Operations",
  );

  const personalisation: OpsStatusField = opsField(
    "not_configured",
    "Personalisation health not configured for Operations",
  );

  const realtime: OpsStatusField = redis?.ok
    ? opsField("healthy", "Redis reachable (realtime dependency)")
    : opsField("unavailable", "Redis health check failed");

  const audit: OpsStatusField = opsField(
    "not_configured",
    "Audit subsystem health not configured for Operations",
  );

  const eventBus: OpsStatusField = events
    ? opsField(mapRuntime(events.status), "Event framework")
    : opsField("unknown", "Event framework summary unavailable");

  void timelines;
  void bootstrap;
  void eventBus;

  const core: OperationsCapabilityRow[] = [
    { id: "identity", label: "Identity", health: identity },
    { id: "search", label: "Search", health: search },
    { id: "notifications", label: "Notifications", health: notificationsHealth },
    { id: "activity", label: "Activity", health: activity },
    { id: "command", label: "Command", health: command },
    { id: "personalisation", label: "Personalisation", health: personalisation },
    { id: "realtime", label: "Realtime", health: realtime },
    { id: "audit", label: "Audit", health: audit },
  ];

  const manifests = listIntegrationManifestsFromDisk();
  const byCap = new Map<string, string>();
  for (const m of manifests) {
    const tags = m.tags.map((t) => t.toLowerCase());
    if (tags.includes("projects")) byCap.set("projects", m.id);
    if (tags.includes("support")) byCap.set("support", m.id);
    if (tags.includes("time")) byCap.set("time", m.id);
    if (tags.includes("workflow")) byCap.set("workflow", m.id);
    if (tags.includes("analytics")) byCap.set("analytics", m.id);
    if (tags.includes("documents")) byCap.set("documents", m.id);
  }

  const productDefs: { id: string; label: string; providerId?: string }[] = [
    { id: "projects", label: "Projects", providerId: byCap.get("projects") },
    { id: "support", label: "Support", providerId: byCap.get("support") },
    { id: "time", label: "Time", providerId: byCap.get("time") },
    { id: "workflow", label: "Workflow", providerId: byCap.get("workflow") },
    { id: "analytics", label: "Analytics", providerId: byCap.get("analytics") },
    { id: "knowledge", label: "Knowledge" },
    { id: "documents", label: "Documents", providerId: byCap.get("documents") },
    { id: "quality", label: "Quality" },
    { id: "security", label: "Security" },
    { id: "source", label: "Source" },
  ];

  const products: OperationsCapabilityRow[] = productDefs.map((p) => {
    if (p.providerId) {
      const health = capabilityFromProviderHealth(p.label, p.providerId);
      return {
        id: p.id,
        label: p.label,
        health,
        providerHint: p.providerId,
      };
    }
    return {
      id: p.id,
      label: p.label,
      health: opsField(
        "not_configured",
        `${p.label} implementation provider mapping or health feed not configured`,
      ),
    };
  });

  const issues: OperationsIssue[] = [];

  for (const p of products) {
    if (p.health.status === "degraded" || p.health.status === "unavailable") {
      issues.push({
        severity: p.health.status === "unavailable" ? "error" : "warning",
        title: `${p.label} capability ${p.health.label}`,
        detail: p.health.message ?? "See Providers for implementation detail",
        href: p.providerHint
          ? `${PLATFORM_ADMIN_BASE}/providers/${encodeURIComponent(p.providerHint)}`
          : `${PLATFORM_ADMIN_BASE}/providers`,
      });
    }
  }

  issues.push({
    severity: "warning",
    title: "Provisioning telemetry incomplete",
    detail:
      "Operational queue status is only shown when platform_provisioning_record has rows — never invented from entitlements.",
    href: `${PLATFORM_ADMIN_BASE}/provisioning`,
  });

  const unknownProducts = products.filter((p) => p.health.status === "unknown");
  if (unknownProducts.length > 0) {
    issues.push({
      severity: "warning",
      title: "Provider health probes unavailable",
      detail: `${unknownProducts.map((p) => p.label).join(", ")} — configured providers without live Platform Admin probes`,
      href: `${PLATFORM_ADMIN_BASE}/providers`,
    });
  }

  void worstOpsStatus;

  return {
    generatedAt,
    environment: env.NODE_ENV ?? "unknown",
    core,
    products,
    issues,
    note: "Operations uses APZ capability names. Implementation providers are revealed only under Providers.",
  };
}
