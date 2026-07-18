import type { IntegrationRequestContext } from "../types";
import type { IntegrationHealth, IntegrationHealthCheck } from "../diagnostics/types";

export const STANDARD_HEALTH_CHECK_NAMES = [
  "configuration",
  "connectivity",
  "authentication",
  "authorization",
  "version",
  "circuit_breaker",
] as const;

export type StandardHealthCheckName = (typeof STANDARD_HEALTH_CHECK_NAMES)[number];

export const CRITICAL_HEALTH_CHECK_NAMES: readonly StandardHealthCheckName[] = [
  "configuration",
  "connectivity",
  "authentication",
] as const;

export interface HealthCheckContext {
  readonly context: IntegrationRequestContext;
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly connectionId?: string;
}

export interface HealthProvider {
  check(input: HealthCheckContext): Promise<IntegrationHealth>;
}

export interface HealthCheckDefinition {
  readonly name: StandardHealthCheckName | string;
  readonly critical?: boolean;
  readonly run: (
    input: HealthCheckContext,
  ) => Promise<IntegrationHealthCheck> | IntegrationHealthCheck;
}

export interface AggregateHealthChecksInput {
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly tenantId?: string;
  readonly correlationId: string;
  readonly checks: readonly IntegrationHealthCheck[];
  readonly observedAt: string;
  readonly disabled?: boolean;
}
