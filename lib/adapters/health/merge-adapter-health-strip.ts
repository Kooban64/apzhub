import type { AdapterHealthResult } from "@/lib/adapters/adapter-health-types";
import { getAccessAdapter } from "@/lib/adapters/access/access-adapter";
import { getAuditAdapterHealth } from "@/lib/adapters/audit/audit-adapter-health";
import { getCatalogAdapterHealth } from "@/lib/adapters/catalog/catalog-adapter-health";
import { getIdentityAdapter } from "@/lib/adapters/identity";
import { getLaunchAdapterHealth } from "@/lib/adapters/launch/launch-target-adapter";
import { getLaunchPersistenceHealth } from "@/lib/launch/launch-persistence-health";
import { getProfileAdapter } from "@/lib/adapters/profile/profile-adapter";
import { getProvisioningSource } from "@/lib/adapters/env";
import { getProvisioningAdapter } from "@/lib/adapters/provisioning/provisioning-adapter";
import { getProvisioningConnectorHealthAdapterResults } from "@/lib/provisioning/connectors/registry";
import { isProvisioningEngineConfigured } from "@/lib/provisioning/service/provisioning-service";
import type { AdminHealthStrip } from "@/lib/admin/contracts/health";
import type { AdminHealthSubsystemRow } from "@/lib/admin/contracts/health";

function signalToSubsystemStatus(
  signal: AdapterHealthResult["signal"],
): "ok" | "degraded" | "down" | "unknown" {
  switch (signal) {
    case "healthy":
      return "ok";
    case "degraded":
      return "degraded";
    case "misconfigured":
      return "down";
    default:
      return "unknown";
  }
}

function collectAdapterHealthResults(): AdapterHealthResult[] {
  const core: AdapterHealthResult[] = [
    getIdentityAdapter().getHealth(),
    getProfileAdapter().getHealth(),
    getAccessAdapter().getHealth(),
    getProvisioningAdapter().getHealth(),
  ];
  if (getProvisioningSource() === "real" && isProvisioningEngineConfigured()) {
    core.push(...getProvisioningConnectorHealthAdapterResults());
  }
  core.push(getLaunchAdapterHealth(), getLaunchPersistenceHealth(), getAuditAdapterHealth(), getCatalogAdapterHealth());
  return core;
}

function severityRank(s: AdminHealthSubsystemRow["status"]): number {
  switch (s) {
    case "down":
      return 3;
    case "degraded":
      return 2;
    case "unknown":
      return 1;
    default:
      return 0;
  }
}

/** Merge live adapter checks into the admin health strip (replaces prior `adapter_*` rows each call). */
export function mergeAdapterHealthIntoStrip(base: AdminHealthStrip): AdminHealthStrip {
  const results = collectAdapterHealthResults();
  const adapterRows: AdminHealthSubsystemRow[] = results.map((r) => ({
    id: `adapter_${r.domain}`,
    name: r.label ?? `${r.domain} adapter`,
    status: signalToSubsystemStatus(r.signal),
    detail: r.detail,
  }));

  const stripped = base.subsystems.filter((s) => !s.id.startsWith("adapter_"));
  const combined = [...stripped, ...adapterRows];

  let worst = severityRank(base.overall);
  for (const row of adapterRows) {
    worst = Math.max(worst, severityRank(row.status));
  }

  const overall: AdminHealthStrip["overall"] =
    worst >= 3 ? "down" : worst >= 2 ? "degraded" : base.overall === "down" ? "down" : base.overall;

  return {
    overall,
    headline: base.headline,
    subsystems: combined,
  };
}
