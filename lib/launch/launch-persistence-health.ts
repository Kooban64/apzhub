import type { AdapterHealthResult } from "@/lib/adapters/adapter-health-types";
import { getLaunchSource } from "@/lib/adapters/env";
import { isProvisioningEngineConfigured } from "@/lib/provisioning/service/provisioning-service";

/**
 * Admin health row for Postgres `launch_events` (append-only telemetry).
 * Sync-only: does not ping the DB (merge strip stays synchronous); env heuristics + migrate reminder.
 */
export function getLaunchPersistenceHealth(): AdapterHealthResult {
  const db = isProvisioningEngineConfigured();
  const launchReal = getLaunchSource() === "real";

  if (!launchReal) {
    return {
      domain: "launch_persistence",
      label: "Launch events (DB)",
      signal: "healthy",
      detail: "Launch source is mock; JWT/OIDC mint routes are stubs and launch_events writes are minimal.",
    };
  }

  if (!db) {
    return {
      domain: "launch_persistence",
      label: "Launch events (DB)",
      signal: "degraded",
      detail:
        "APZHUB_LAUNCH_SOURCE=real but no database URL is configured; launch logging uses tryInsertLaunchEvent (errors logged only).",
    };
  }

  return {
    domain: "launch_persistence",
    label: "Launch events (DB)",
    signal: "healthy",
    detail:
      "Postgres configured for launch_events. Run npm run db:migrate (includes 0004_launch_events) before relying on admin /admin/launch.",
  };
}
