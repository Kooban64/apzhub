/**
 * Locked operational state vocabulary for Platform Admin control plane.
 * Do not interchange with Online / Good / OK / Working / Ready / Green / Fine.
 */

export const OPS_STATUSES = [
  "healthy",
  "degraded",
  "unavailable",
  "unknown",
  "not_configured",
] as const;

export type OpsStatus = (typeof OPS_STATUSES)[number];

export type OpsStatusField = {
  readonly status: OpsStatus;
  readonly label: string;
  readonly message?: string;
};

export function opsLabel(status: OpsStatus): string {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "degraded":
      return "Degraded";
    case "unavailable":
      return "Unavailable";
    case "unknown":
      return "Unknown";
    case "not_configured":
      return "Not configured";
  }
}

export function opsField(status: OpsStatus, message?: string): OpsStatusField {
  return { status, label: opsLabel(status), message };
}

/** Map heterogeneous health strings into the locked vocabulary. */
export function normalizeOpsStatus(raw: string | undefined | null): OpsStatus {
  if (!raw) return "unknown";
  const s = raw.toLowerCase().trim();
  if (s === "healthy" || s === "ok" || s === "operational" || s === "configured") {
    return "healthy";
  }
  if (s === "degraded" || s === "misconfigured" || s === "warning") {
    return "degraded";
  }
  if (
    s === "unhealthy" ||
    s === "error" ||
    s === "failed" ||
    s === "down" ||
    s === "disabled"
  ) {
    return "unavailable";
  }
  if (s === "not_configured" || s === "not configured" || s === "absent") {
    return "not_configured";
  }
  return "unknown";
}

export function worstOpsStatus(statuses: readonly OpsStatus[]): OpsStatus {
  if (statuses.includes("unavailable")) return "unavailable";
  if (statuses.includes("degraded")) return "degraded";
  if (statuses.includes("unknown")) return "unknown";
  if (statuses.includes("not_configured")) return "not_configured";
  if (statuses.includes("healthy")) return "healthy";
  return "unknown";
}
