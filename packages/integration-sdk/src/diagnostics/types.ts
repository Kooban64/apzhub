import type { IntegrationRequestContext } from "../types";
import type { AuthenticationDiagnostics } from "../auth/auth-diagnostics";
import type { ConnectionDiagnostics } from "../connection/connection-diagnostics";
import type { VersionCompatibilityStatus } from "../types";
import type {
  IntegrationErrorSummary,
  IntegrationRegistrationStatus,
  IntegrationVersionDiagnostics,
} from "./runtime-types";
import type { CircuitBreakerDiagnostics } from "../resilience/types";
import type { IntegrationMetricsSummary } from "../observability/metrics/types";

/** Operational diagnostics payload for bootstrap and control plane extensions. */
export interface IntegrationDiagnostics {
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly tenantId?: string;
  readonly connectionConfigured: boolean;
  readonly authenticationPresent: boolean;
  readonly engineVersion?: string;
  readonly versionCompatibility: VersionCompatibilityStatus;
  readonly healthStatus: IntegrationHealthStatus;
  readonly lastSuccessfulRequestAt?: string;
  readonly correlationId: string;
  readonly observedAt: string;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
  readonly connection?: ConnectionDiagnostics;
  readonly authentication?: AuthenticationDiagnostics;
  /** Full structured health result from the latest probe. */
  readonly health?: IntegrationHealth;
  /** Circuit breaker operational snapshot. */
  readonly circuitBreaker?: CircuitBreakerDiagnostics;
  /** Aggregated request/error metrics summary. */
  readonly metrics?: IntegrationMetricsSummary;
  /** Recent error category summary for operators. */
  readonly errors?: IntegrationErrorSummary;
  /** Integration registration and lifecycle status. */
  readonly registration?: IntegrationRegistrationStatus;
  /** Version probe summary block. */
  readonly version?: IntegrationVersionDiagnostics;
  /** @deprecated Legacy placeholder flag — absent on OSS-100-03+ unified diagnostics */
  readonly placeholder?: boolean;
}

export type IntegrationHealthStatus =
  "healthy" | "degraded" | "unavailable" | "disabled";

export type IntegrationHealthCheckStatus = "pass" | "warn" | "fail";

export interface IntegrationHealthCheck {
  readonly name: string;
  readonly status: IntegrationHealthCheckStatus;
  readonly message?: string;
  readonly durationMs?: number;
}

/** Structured health result for operations control plane reporting. */
export interface IntegrationHealth {
  readonly status: IntegrationHealthStatus;
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly tenantId?: string;
  readonly checks: readonly IntegrationHealthCheck[];
  readonly observedAt: string;
  readonly correlationId: string;
}

export interface DiagnosticsCollectContext {
  readonly context: IntegrationRequestContext;
  readonly integrationId: string;
  readonly capabilityId?: string;
}

export interface DiagnosticsProvider {
  collect(input: DiagnosticsCollectContext): Promise<IntegrationDiagnostics>;
}
