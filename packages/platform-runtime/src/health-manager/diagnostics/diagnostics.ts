import type {
  HealthCheckResult,
  HealthDiagnostics,
  HealthProviderResult,
  HealthSnapshot,
  HealthStatus,
} from "../interfaces/types";
import { HEALTH_EXTENSION_POINTS } from "../interfaces/types";

export function buildHealthSnapshot(
  status: HealthStatus,
  summary: string,
  providerResults: readonly HealthProviderResult[],
  timestamp: string,
): HealthSnapshot {
  return {
    timestamp,
    status,
    summary,
    providerResults,
    providerCount: providerResults.length,
  };
}

export function buildHealthDiagnostics(input: {
  status: HealthStatus;
  registeredProviders: readonly string[];
  lastExecution: string | undefined;
  failedProviders: readonly string[];
  summary: string;
  snapshotTimestamp: string | undefined;
}): HealthDiagnostics {
  return {
    status: input.status,
    registeredProviders: input.registeredProviders,
    lastExecution: input.lastExecution,
    failedProviders: input.failedProviders,
    summary: input.summary,
    snapshotTimestamp: input.snapshotTimestamp,
    extensionPoints: Object.keys(HEALTH_EXTENSION_POINTS),
  };
}

export function buildFailedProviderResult(
  providerId: string,
  providerName: string,
  errorMessage: string,
  timestamp: string,
): HealthProviderResult {
  return {
    providerId,
    providerName,
    status: "unhealthy",
    severity: "critical",
    timestamp,
    summary: errorMessage,
    metadata: { error: errorMessage },
  };
}

export function toCheckResult(
  status: HealthStatus,
  summary: string,
  providerResults: readonly HealthProviderResult[],
  failedProviders: readonly string[],
  timestamp: string,
): HealthCheckResult {
  return {
    status,
    timestamp,
    summary,
    providerResults,
    failedProviders,
  };
}
