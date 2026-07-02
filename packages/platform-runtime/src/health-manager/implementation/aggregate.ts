import type { HealthProviderResult, HealthStatus } from "../interfaces/types";

const STATUS_PRIORITY: Readonly<Record<HealthStatus, number>> = {
  healthy: 1,
  unknown: 2,
  degraded: 3,
  unhealthy: 4,
};

export function aggregateHealthStatus(
  results: readonly HealthProviderResult[],
): HealthStatus {
  if (results.length === 0) {
    return "unknown";
  }

  let worst: HealthStatus = "healthy";

  for (const result of results) {
    if (STATUS_PRIORITY[result.status] > STATUS_PRIORITY[worst]) {
      worst = result.status;
    }
  }

  return worst;
}

export function buildHealthSummary(
  status: HealthStatus,
  results: readonly HealthProviderResult[],
  failedProviders: readonly string[],
): string {
  const healthyCount = results.filter((result) => result.status === "healthy").length;

  if (failedProviders.length > 0) {
    return `Runtime health ${status}: ${healthyCount}/${results.length} provider(s) healthy; ${failedProviders.length} provider failure(s)`;
  }

  return `Runtime health ${status}: ${healthyCount}/${results.length} provider(s) healthy`;
}

export function mapHealthStatusToLifecycleTarget(
  status: HealthStatus,
): "healthy" | "degraded" | "failed" | null {
  switch (status) {
    case "healthy":
      return "healthy";
    case "degraded":
      return "degraded";
    case "unhealthy":
      return "failed";
    default:
      return null;
  }
}

export function mapHealthStatusToCapabilityHealth(
  status: HealthStatus,
): "healthy" | "degraded" | "unhealthy" | "unknown" {
  switch (status) {
    case "healthy":
      return "healthy";
    case "degraded":
      return "degraded";
    case "unhealthy":
      return "unhealthy";
    default:
      return "unknown";
  }
}
