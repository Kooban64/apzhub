import type { IntegrationErrorCategory } from "../errors/types";
import type { IntegrationHealth } from "./types";
import type { CircuitBreakerDiagnostics } from "../resilience/types";
import type { IntegrationMetricsSummary } from "../observability/metrics/types";
import type { IntegrationLifecycleState } from "../lifecycle/types";

export interface IntegrationErrorSummary {
  readonly totalErrors: number;
  readonly errorsByCategory: Readonly<
    Partial<Record<IntegrationErrorCategory, number>>
  >;
  readonly lastErrorAt?: string;
  readonly lastErrorCode?: string;
  readonly lastErrorCategory?: IntegrationErrorCategory;
}

export interface IntegrationRegistrationStatus {
  readonly registered: boolean;
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly adapterId?: string;
  readonly lifecycleState?: IntegrationLifecycleState;
}

export interface IntegrationVersionDiagnostics {
  readonly engineVersion?: string;
  readonly versionCompatibility: import("../types").VersionCompatibilityStatus;
}

export interface IntegrationRuntimeDiagnosticsExtensions {
  readonly health?: IntegrationHealth;
  readonly circuitBreaker?: CircuitBreakerDiagnostics;
  readonly metrics?: IntegrationMetricsSummary;
  readonly errors?: IntegrationErrorSummary;
  readonly registration?: IntegrationRegistrationStatus;
  readonly version?: IntegrationVersionDiagnostics;
}

export interface BuildRuntimeDiagnosticsExtensionsInput {
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly adapterId?: string;
  readonly tenantId?: string;
  readonly engineVersion?: string;
  readonly versionCompatibility?: import("../types").VersionCompatibilityStatus;
  readonly health?: IntegrationHealth;
  readonly circuitBreaker?: CircuitBreakerDiagnostics;
  readonly metrics?: IntegrationMetricsSummary;
  readonly errors?: IntegrationErrorSummary;
  readonly lifecycleState?: IntegrationLifecycleState;
  readonly connectionRegistered?: boolean;
}

export function buildRuntimeDiagnosticsExtensions(
  input: BuildRuntimeDiagnosticsExtensionsInput,
): IntegrationRuntimeDiagnosticsExtensions {
  return {
    health: input.health,
    circuitBreaker: input.circuitBreaker,
    metrics: input.metrics,
    errors: input.errors,
    registration: {
      registered: input.connectionRegistered ?? false,
      integrationId: input.integrationId,
      capabilityId: input.capabilityId,
      adapterId: input.adapterId,
      lifecycleState: input.lifecycleState,
    },
    version: {
      engineVersion: input.engineVersion,
      versionCompatibility: input.versionCompatibility ?? "not_checked",
    },
  };
}
