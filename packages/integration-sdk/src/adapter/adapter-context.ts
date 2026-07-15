import {
  DefaultAuthenticationProvider,
  DefaultCredentialResolver,
  InMemorySecretProvider,
} from "../auth";
import type { AuthenticationProvider } from "../auth/types";
import type { SecretProvider } from "../auth/secret-provider";
import { createConnectionManager } from "../connection/connection-manager";
import type { ConnectionManager } from "../connection/connection-manager";
import type { ConnectionRegistry } from "../connection/registry";
import { InMemoryConnectionRegistry } from "../connection/registry";
import type { DiagnosticsProvider } from "../diagnostics/types";
import type { ErrorTranslator } from "../errors/translation/types";
import type { HealthProvider } from "../health/types";
import type { IntegrationLifecycleParticipant } from "../lifecycle/participant-types";
import type { IntegrationLogger } from "../observability/logging/integration-logger";
import type { ErrorSummaryTracker } from "../observability/metrics/integration-metrics";
import type { IntegrationMetrics, MetricsProvider } from "../observability/metrics/types";
import { createIntegrationOperationsStack } from "../operations-stack";
import type { IntegrationOperationsStack } from "../operations-stack";
import type { CircuitBreaker } from "../resilience/types";
import type { VersionProvider } from "../version/types";
import type { IntegrationCapabilityId } from "./capability-types";
import type { AdapterBootstrapConfiguration } from "./manifest-types";

export interface AdapterClock {
  now(): string;
  nowMs(): number;
}

/** Strongly typed runtime dependency container for every adapter instance. */
export interface AdapterContext {
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly adapterId: string;
  readonly declaredCapabilities: readonly IntegrationCapabilityId[];
  readonly authenticationProvider: AuthenticationProvider;
  readonly connectionManager: ConnectionManager;
  readonly connectionRegistry: ConnectionRegistry;
  readonly healthProvider: HealthProvider;
  readonly diagnosticsProvider: DiagnosticsProvider;
  readonly versionProvider: VersionProvider;
  readonly errorTranslator: ErrorTranslator;
  readonly circuitBreaker: CircuitBreaker;
  readonly metrics: IntegrationMetrics;
  readonly metricsProvider: MetricsProvider;
  readonly errorSummary: ErrorSummaryTracker;
  readonly logger: IntegrationLogger;
  readonly lifecycleParticipant: IntegrationLifecycleParticipant;
  readonly operationsStack: IntegrationOperationsStack;
  readonly clock: AdapterClock;
}

export interface BuildAdapterContextInput {
  readonly configuration: AdapterBootstrapConfiguration;
  readonly registry?: ConnectionRegistry;
  readonly secretProvider?: SecretProvider;
  readonly authenticationProvider?: AuthenticationProvider;
  readonly connectionManager?: ConnectionManager;
  readonly operationsStack?: IntegrationOperationsStack;
  readonly clock?: AdapterClock;
}

const defaultClock: AdapterClock = {
  now: () => new Date().toISOString(),
  nowMs: () => Date.now(),
};

export function buildAdapterContext(input: BuildAdapterContextInput): AdapterContext {
  const { manifest } = input.configuration;
  const clock = input.clock ?? defaultClock;
  const registry = input.registry ?? new InMemoryConnectionRegistry(clock);

  const secretProvider =
    input.secretProvider ??
    new InMemorySecretProvider({
      secrets: {},
    });
  const credentialResolver = new DefaultCredentialResolver({ secretProvider });
  const authenticationProvider =
    input.authenticationProvider ??
    new DefaultAuthenticationProvider({
      credentialResolver,
    });

  const operationsStack =
    input.operationsStack ??
    createIntegrationOperationsStack({
      integrationId: manifest.integrationId,
      capabilityId: manifest.capabilityId,
      adapterId: manifest.adapterId,
      registry,
      credentialResolver,
      clock,
    });

  const connectionManager =
    input.connectionManager ??
    createConnectionManager({
      registry,
      authenticationProvider,
      clock,
    });

  return {
    integrationId: manifest.integrationId,
    capabilityId: manifest.capabilityId,
    adapterId: manifest.adapterId,
    declaredCapabilities: manifest.declaredCapabilities,
    authenticationProvider,
    connectionManager,
    connectionRegistry: registry,
    healthProvider: operationsStack.healthProvider,
    diagnosticsProvider: operationsStack.diagnosticsProvider,
    versionProvider: operationsStack.versionProvider,
    errorTranslator: operationsStack.errorTranslator,
    circuitBreaker: operationsStack.circuitBreaker,
    metrics: operationsStack.metrics,
    metricsProvider: operationsStack.metricsProvider,
    errorSummary: operationsStack.errorSummary,
    logger: operationsStack.logger,
    lifecycleParticipant: operationsStack.lifecycleParticipant,
    operationsStack,
    clock,
  };
}
