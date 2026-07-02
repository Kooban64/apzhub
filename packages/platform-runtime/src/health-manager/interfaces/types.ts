import type { Capability } from "../../capability/types";
import type { CapabilityRegistry } from "../../capability-registry/registry";
import type { RuntimeConfiguration } from "../../configuration-manager/interfaces/types";
import type { CapabilityLifecycleManager } from "../../lifecycle-manager/manager";

/** Overall and per-provider health status. */
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

/** Provider result severity. */
export type HealthSeverity = "info" | "warning" | "critical";

export interface HealthProviderResult {
  readonly providerId: string;
  readonly providerName: string;
  readonly status: HealthStatus;
  readonly severity: HealthSeverity;
  readonly timestamp: string;
  readonly summary: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface HealthProviderContext {
  readonly configuration: RuntimeConfiguration;
  readonly registry: CapabilityRegistry;
  readonly lifecycle: CapabilityLifecycleManager;
  readonly capabilities: readonly Capability[];
}

export interface HealthProvider {
  readonly id: string;
  readonly name: string;
  check(context: HealthProviderContext): HealthProviderResult;
}

export interface HealthCheckResult {
  readonly status: HealthStatus;
  readonly timestamp: string;
  readonly summary: string;
  readonly providerResults: readonly HealthProviderResult[];
  readonly failedProviders: readonly string[];
}

export interface HealthSnapshot {
  readonly timestamp: string;
  readonly status: HealthStatus;
  readonly summary: string;
  readonly providerResults: readonly HealthProviderResult[];
  readonly providerCount: number;
}

export interface HealthDiagnostics {
  readonly status: HealthStatus;
  readonly registeredProviders: readonly string[];
  readonly lastExecution: string | undefined;
  readonly failedProviders: readonly string[];
  readonly summary: string;
  readonly snapshotTimestamp: string | undefined;
  readonly extensionPoints: readonly string[];
}

export interface HealthExtensionPoints {
  readonly databaseProvider: "extension-point";
  readonly redisProvider: "extension-point";
  readonly integrationProviders: "extension-point";
}

export const HEALTH_EXTENSION_POINTS: HealthExtensionPoints = {
  databaseProvider: "extension-point",
  redisProvider: "extension-point",
  integrationProviders: "extension-point",
};
