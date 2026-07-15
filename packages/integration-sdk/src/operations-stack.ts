import type { CredentialResolver } from "./auth/credential-resolver";
import type { ConnectionRegistry } from "./connection/registry";
import { createDefaultHealthProvider } from "./health/default-health-provider";
import type { HealthProvider } from "./health/types";
import { createDefaultDiagnosticsProvider } from "./diagnostics/unified-diagnostics";
import type { DiagnosticsProvider } from "./diagnostics/types";
import { createDefaultVersionProvider } from "./version/types";
import type { VersionProvider } from "./version/types";
import { createDefaultLifecycleParticipant } from "./lifecycle/default-lifecycle-participant";
import type { IntegrationLifecycleParticipant } from "./lifecycle/participant-types";
import { createDefaultErrorTranslator } from "./errors/translation/error-translator";
import type { ErrorTranslator } from "./errors/translation/types";
import { createDefaultCircuitBreaker } from "./resilience/circuit-breaker";
import type { CircuitBreaker } from "./resilience/types";
import {
  createDefaultIntegrationMetrics,
  createInMemoryErrorSummaryTracker,
  createInMemoryMetricsProvider,
} from "./observability/metrics/integration-metrics";
import type { ErrorSummaryTracker } from "./observability/metrics/integration-metrics";
import type { IntegrationMetrics } from "./observability/metrics/types";
import type { MetricsProvider } from "./observability/metrics/types";
import { createDefaultIntegrationLogger } from "./observability/logging/integration-logger";
import type { IntegrationLogger } from "./observability/logging/integration-logger";

export interface IntegrationOperationsStack {
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly adapterId?: string;
  readonly versionProvider: VersionProvider;
  readonly healthProvider: HealthProvider;
  readonly diagnosticsProvider: DiagnosticsProvider;
  readonly lifecycleParticipant: IntegrationLifecycleParticipant;
  readonly errorTranslator: ErrorTranslator;
  readonly circuitBreaker: CircuitBreaker;
  readonly metrics: IntegrationMetrics;
  readonly metricsProvider: MetricsProvider;
  readonly errorSummary: ErrorSummaryTracker;
  readonly logger: IntegrationLogger;
}

export interface CreateIntegrationOperationsStackInput {
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly adapterId?: string;
  readonly registry: ConnectionRegistry;
  readonly credentialResolver?: CredentialResolver;
  readonly versionProvider?: VersionProvider;
  readonly errorTranslator?: ErrorTranslator;
  readonly circuitBreaker?: CircuitBreaker;
  readonly metricsProvider?: MetricsProvider;
  readonly metrics?: IntegrationMetrics;
  readonly errorSummary?: ErrorSummaryTracker;
  readonly logger?: IntegrationLogger;
  readonly clock?: { now(): string; nowMs(): number };
}

export function createIntegrationOperationsStack(
  input: CreateIntegrationOperationsStackInput,
): IntegrationOperationsStack {
  const clock = input.clock ?? {
    now: () => new Date().toISOString(),
    nowMs: () => Date.now(),
  };
  const adapterId = input.adapterId ?? `${input.integrationId}-adapter`;
  const versionProvider = input.versionProvider ?? createDefaultVersionProvider();
  const circuitBreaker = input.circuitBreaker ?? createDefaultCircuitBreaker({ clock });
  const metricsProvider = input.metricsProvider ?? createInMemoryMetricsProvider();
  const metrics =
    input.metrics ??
    createDefaultIntegrationMetrics({
      provider: metricsProvider,
      integrationId: input.integrationId,
      adapterId,
      clock,
    });
  const errorSummary = input.errorSummary ?? createInMemoryErrorSummaryTracker(clock);
  const errorTranslator = input.errorTranslator ?? createDefaultErrorTranslator({ clock });
  const logger =
    input.logger ??
    createDefaultIntegrationLogger({
      integrationId: input.integrationId,
      adapterId,
      clock,
    });

  const healthProvider = createDefaultHealthProvider({
    integrationId: input.integrationId,
    capabilityId: input.capabilityId,
    registry: input.registry,
    versionProvider,
    circuitBreaker,
    clock,
  });

  const lifecycleParticipant = createDefaultLifecycleParticipant({
    integrationId: input.integrationId,
    healthProvider,
  });

  const diagnosticsProvider = createDefaultDiagnosticsProvider({
    integrationId: input.integrationId,
    capabilityId: input.capabilityId,
    adapterId,
    registry: input.registry,
    healthProvider,
    versionProvider,
    credentialResolver: input.credentialResolver,
    circuitBreaker,
    metrics,
    errorSummary,
    lifecycleParticipant,
    clock,
  });

  return {
    integrationId: input.integrationId,
    capabilityId: input.capabilityId,
    adapterId,
    versionProvider,
    healthProvider,
    diagnosticsProvider,
    lifecycleParticipant,
    errorTranslator,
    circuitBreaker,
    metrics,
    metricsProvider,
    errorSummary,
    logger,
  };
}
