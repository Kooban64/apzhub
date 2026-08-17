/**
 * Platform-wide Provisioning — real governance records only.
 * Never invent queue metrics from entitlement snapshots.
 */

import { desc } from "drizzle-orm";

import { getDb, platformProvisioningRecord } from "@apzhub/config/db";
import { listPlatformTenants } from "@apzhub/platform-identity/server";
import type { TenantListField } from "@/lib/platform-admin/tenants-types";

export type ProvisioningQueueCounts = {
  readonly pending: TenantListField<number>;
  readonly processing: TenantListField<number>;
  readonly failed: TenantListField<number>;
  readonly completed: TenantListField<number>;
};

export type ProvisioningJobRow = {
  readonly provisioningId: string;
  readonly status: string;
  readonly statusLabel: string;
  readonly tenantId: string | null;
  readonly tenantName: string;
  readonly userLabel: string;
  readonly target: string;
  readonly targetCapability: string;
  readonly providerName: string | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly message: string | null;
  readonly attempt: TenantListField<string>;
};

export type PlatformProvisioningPayload = {
  readonly generatedAt: string;
  readonly feed: {
    readonly availability: "ok" | "empty" | "unavailable" | "not_configured";
    readonly message: string;
  };
  readonly counts: ProvisioningQueueCounts;
  readonly jobs: readonly ProvisioningJobRow[];
  readonly retry: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly tabs: readonly string[];
};

function notConfiguredCount(message: string): TenantListField<number> {
  return { availability: "not_configured", value: undefined, message };
}

function okCount(n: number): TenantListField<number> {
  return { availability: "ok", value: n };
}

function statusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "in_progress":
      return "Running";
    case "failed":
      return "Failed";
    case "completed":
      return "Done";
    default:
      return status;
  }
}

function capabilityForTarget(targetType: string, targetKey: string): string {
  const key = targetKey.toLowerCase();
  if (key.includes("support") || key === "zammad") return "Support";
  if (key.includes("project") || key === "plane") return "Projects";
  if (key.includes("time") || key === "kimai") return "Time";
  if (key.includes("workflow") || key === "n8n") return "Workflow";
  if (key.includes("analytic") || key === "metabase") return "Analytics";
  if (key.includes("document") || key.includes("paperless")) return "Documents";
  if (key.includes("qep") || key.includes("qa")) return "Quality";
  if (key.includes("pen") || key.includes("security")) return "Security";
  if (key.includes("source") || key.includes("git")) return "Source";
  if (targetType === "product") return targetKey;
  return targetKey;
}

function providerFromMetadata(
  metadata: Record<string, unknown>,
  targetKey: string,
): string | null {
  const p =
    (typeof metadata.provider === "string" && metadata.provider) ||
    (typeof metadata.implementationProvider === "string" &&
      metadata.implementationProvider) ||
    (typeof metadata.engine === "string" && metadata.engine) ||
    null;
  if (p) return p;
  // Only surface known engine names in diagnostic context when target is the engine id
  const engines = new Set([
    "plane",
    "zammad",
    "kimai",
    "n8n",
    "metabase",
    "paperless",
    "meilisearch",
  ]);
  return engines.has(targetKey.toLowerCase()) ? targetKey : null;
}

export async function buildPlatformAdminProvisioning(): Promise<PlatformProvisioningPayload> {
  const retry = {
    availability: "not_configured" as const,
    message:
      "Provisioning retry operation is not configured on the Platform Admin surface",
  };

  if (!process.env.DATABASE_URL?.trim()) {
    return {
      generatedAt: new Date().toISOString(),
      feed: {
        availability: "not_configured",
        message: "Provisioning job store requires DATABASE_URL",
      },
      counts: {
        pending: notConfiguredCount("Provisioning queue telemetry unavailable"),
        processing: notConfiguredCount("Provisioning queue telemetry unavailable"),
        failed: notConfiguredCount("Provisioning queue telemetry unavailable"),
        completed: notConfiguredCount("Provisioning queue telemetry unavailable"),
      },
      jobs: [],
      retry,
      tabs: ["overview", "queue", "failures", "history"],
    };
  }

  let rows: {
    provisioningId: string;
    scopeType: string;
    scopeKey: string;
    targetType: string;
    targetKey: string;
    status: string;
    message: string | null;
    metadata: Record<string, unknown>;
    startedAt: Date;
    completedAt: Date | null;
  }[] = [];

  try {
    rows = await getDb()
      .select()
      .from(platformProvisioningRecord)
      .orderBy(desc(platformProvisioningRecord.startedAt));
  } catch {
    return {
      generatedAt: new Date().toISOString(),
      feed: {
        availability: "unavailable",
        message: "platform_provisioning_record query failed",
      },
      counts: {
        pending: notConfiguredCount("Provisioning queue telemetry unavailable"),
        processing: notConfiguredCount("Provisioning queue telemetry unavailable"),
        failed: notConfiguredCount("Provisioning queue telemetry unavailable"),
        completed: notConfiguredCount("Provisioning queue telemetry unavailable"),
      },
      jobs: [],
      retry,
      tabs: ["overview", "queue", "failures", "history"],
    };
  }

  if (rows.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      feed: {
        availability: "empty",
        message:
          "No provisioning job records in platform_provisioning_record. Queue metrics are not invented from entitlement state.",
      },
      counts: {
        pending: okCount(0),
        processing: okCount(0),
        failed: okCount(0),
        completed: okCount(0),
      },
      jobs: [],
      retry,
      tabs: ["overview", "queue", "failures", "history"],
    };
  }

  const tenants = await listPlatformTenants().catch(() => []);
  const tenantName = new Map(tenants.map((t) => [t.tenantId, t.name]));

  const pending = rows.filter((r) => r.status === "pending").length;
  const processing = rows.filter((r) => r.status === "in_progress").length;
  const failed = rows.filter((r) => r.status === "failed").length;
  const completed = rows.filter((r) => r.status === "completed").length;

  const jobs: ProvisioningJobRow[] = rows.slice(0, 100).map((r) => {
    const meta = (r.metadata ?? {}) as Record<string, unknown>;
    const tenantId = r.scopeType === "tenant" ? r.scopeKey : null;
    const userLabel =
      (typeof meta.userName === "string" && meta.userName) ||
      (typeof meta.userId === "string" && meta.userId) ||
      "—";
    const attemptRaw = meta.attempt ?? meta.attempts;
    return {
      provisioningId: r.provisioningId,
      status: r.status,
      statusLabel: statusLabel(r.status),
      tenantId,
      tenantName: tenantId ? (tenantName.get(tenantId) ?? tenantId) : r.scopeKey,
      userLabel,
      target: r.targetKey,
      targetCapability: capabilityForTarget(r.targetType, r.targetKey),
      providerName: providerFromMetadata(meta, r.targetKey),
      startedAt: r.startedAt?.toISOString() ?? null,
      completedAt: r.completedAt?.toISOString() ?? null,
      message: r.message,
      attempt:
        typeof attemptRaw === "number" || typeof attemptRaw === "string"
          ? { availability: "ok", value: String(attemptRaw) }
          : {
              availability: "not_configured",
              value: "Not configured",
              message: "Attempt count not stored on this record",
            },
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    feed: {
      availability: "ok",
      message: "Loaded from platform_provisioning_record",
    },
    counts: {
      pending: okCount(pending),
      processing: okCount(processing),
      failed: okCount(failed),
      completed: okCount(completed),
    },
    jobs,
    retry,
    tabs: ["overview", "queue", "failures", "history"],
  };
}
