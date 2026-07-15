import { buildAuthenticationDiagnostics } from "../auth/auth-diagnostics";
import type { CredentialResolver } from "../auth/credential-resolver";
import type { CredentialSourceType } from "../auth/types";
import { buildConnectionDiagnostics } from "../connection/connection-diagnostics";
import type { ConnectionRegistry } from "../connection/registry";
import type { HealthProvider } from "../health/types";
import type { VersionProvider } from "../version/types";
import type { CircuitBreaker } from "../resilience/types";
import type { IntegrationMetrics } from "../observability/metrics/types";
import type { ErrorSummaryTracker } from "../observability/metrics/integration-metrics";
import type { IntegrationLifecycleParticipant } from "../lifecycle/participant-types";
import type { Clock } from "../auth/authentication-provider";
import { systemClock } from "../auth/authentication-provider";
import { buildRuntimeDiagnosticsExtensions } from "./runtime-types";
import type { DiagnosticsCollectContext, DiagnosticsProvider, IntegrationDiagnostics } from "./types";

export interface DefaultDiagnosticsProviderOptions {
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly adapterId?: string;
  readonly registry: ConnectionRegistry;
  readonly healthProvider: HealthProvider;
  readonly versionProvider?: VersionProvider;
  readonly credentialResolver?: CredentialResolver;
  readonly circuitBreaker?: CircuitBreaker;
  readonly metrics?: IntegrationMetrics;
  readonly errorSummary?: ErrorSummaryTracker;
  readonly lifecycleParticipant?: IntegrationLifecycleParticipant;
  readonly clock?: Clock;
}

function mergeWarnings(...groups: readonly (readonly string[])[]): string[] {
  return [...new Set(groups.flat())];
}

export class DefaultDiagnosticsProvider implements DiagnosticsProvider {
  private readonly integrationId: string;
  private readonly capabilityId?: string;
  private readonly registry: ConnectionRegistry;
  private readonly healthProvider: HealthProvider;
  private readonly versionProvider?: VersionProvider;
  private readonly credentialResolver?: CredentialResolver;
  private readonly circuitBreaker?: CircuitBreaker;
  private readonly metrics?: IntegrationMetrics;
  private readonly errorSummary?: ErrorSummaryTracker;
  private readonly lifecycleParticipant?: IntegrationLifecycleParticipant;
  private readonly adapterId?: string;
  private readonly clock: Clock;

  constructor(options: DefaultDiagnosticsProviderOptions) {
    this.integrationId = options.integrationId;
    this.capabilityId = options.capabilityId;
    this.adapterId = options.adapterId;
    this.registry = options.registry;
    this.healthProvider = options.healthProvider;
    this.versionProvider = options.versionProvider;
    this.credentialResolver = options.credentialResolver;
    this.circuitBreaker = options.circuitBreaker;
    this.metrics = options.metrics;
    this.errorSummary = options.errorSummary;
    this.lifecycleParticipant = options.lifecycleParticipant;
    this.clock = options.clock ?? systemClock;
  }

  async collect(input: DiagnosticsCollectContext): Promise<IntegrationDiagnostics> {
    const observedAt = this.clock.now();
    const tenantConnections = this.registry
      .listByTenant(input.context.tenantId)
      .filter((record) => record.integrationId === this.integrationId);

    const connectionDiagnostics = buildConnectionDiagnostics({
      connections: tenantConnections,
      tenantId: input.context.tenantId,
    });

    const primaryConnection = tenantConnections[0];
    const connectionConfigured = tenantConnections.some(
      (record) =>
        record.lifecycleState !== "unconfigured" &&
        record.lifecycleState !== "misconfigured" &&
        Boolean(record.configuredAt),
    );

    let secretPresent = false;
    let credentialSourceType: CredentialSourceType | undefined;
    if (primaryConnection && this.credentialResolver) {
      const resolved = await this.credentialResolver.resolve({
        tenantId: primaryConnection.tenantId,
        correlationId: input.context.correlationId,
        credential: {
          credentialRef: primaryConnection.credentialRef,
          authenticationMode: primaryConnection.authenticationMode,
          usernameRef: primaryConnection.usernameRef,
          headerName: primaryConnection.headerName,
          queryParam: primaryConnection.queryParam,
          customScheme: primaryConnection.customScheme,
        },
      });
      if (resolved.ok) {
        secretPresent = resolved.value.secretPresent;
        credentialSourceType = resolved.value.credentialSourceType;
      }
    } else if (primaryConnection) {
      secretPresent = Boolean(primaryConnection.credentialRef.trim());
      credentialSourceType = "tenant_scoped";
    }

    const authenticationDiagnostics = buildAuthenticationDiagnostics({
      configured: Boolean(primaryConnection),
      authenticationMode: primaryConnection?.authenticationMode,
      credentialSourceType,
      secretPresent,
      credentialRef: primaryConnection?.credentialRef,
    });

    const health = await this.healthProvider.check({
      context: input.context,
      integrationId: this.integrationId,
      capabilityId: this.capabilityId,
      connectionId: primaryConnection?.connectionId,
    });

    let engineVersion: string | undefined;
    let versionCompatibility: IntegrationDiagnostics["versionCompatibility"] = "not_checked";

    if (primaryConnection && this.versionProvider) {
      const detected = await this.versionProvider.probe({
        connection: primaryConnection,
        context: input.context,
      });
      engineVersion = detected?.version;

      const declared = this.versionProvider.resolveDeclaredRange(primaryConnection.metadata);
      if (detected && declared) {
        versionCompatibility = this.versionProvider.checkCompatibility(detected, declared).status;
      }
    }

    const warnings = mergeWarnings(
      connectionDiagnostics.warnings,
      authenticationDiagnostics.warnings,
      health.status === "degraded" ? ["Integration health is degraded"] : [],
      health.status === "unavailable" ? ["Integration health is unavailable"] : [],
    );

    const recommendations = mergeWarnings(
      connectionDiagnostics.recommendations,
      authenticationDiagnostics.recommendations,
      health.status !== "healthy" ? ["Review integration health checks in operations console"] : [],
    );

    const runtimeExtensions = buildRuntimeDiagnosticsExtensions({
      integrationId: this.integrationId,
      capabilityId: this.capabilityId,
      adapterId: this.adapterId ?? primaryConnection?.adapterId,
      tenantId: input.context.tenantId,
      engineVersion,
      versionCompatibility,
      health,
      circuitBreaker: this.circuitBreaker?.getDiagnostics(),
      metrics: this.metrics?.getSummary(),
      errors: this.errorSummary?.getSummary(),
      lifecycleState: this.lifecycleParticipant?.lifecycleState,
      connectionRegistered: connectionConfigured,
    });

    return {
      integrationId: this.integrationId,
      capabilityId: this.capabilityId,
      tenantId: input.context.tenantId,
      connectionConfigured,
      authenticationPresent: authenticationDiagnostics.secretPresent,
      engineVersion,
      versionCompatibility,
      healthStatus: health.status,
      lastSuccessfulRequestAt:
        this.metrics?.getSummary().lastRequestAt ?? primaryConnection?.connectedAt,
      correlationId: input.context.correlationId,
      observedAt,
      warnings,
      recommendations,
      connection: connectionDiagnostics,
      authentication: authenticationDiagnostics,
      health: runtimeExtensions.health,
      circuitBreaker: runtimeExtensions.circuitBreaker,
      metrics: runtimeExtensions.metrics,
      errors: runtimeExtensions.errors,
      registration: runtimeExtensions.registration,
      version: runtimeExtensions.version,
    };
  }
}

export function createDefaultDiagnosticsProvider(
  options: DefaultDiagnosticsProviderOptions,
): DiagnosticsProvider {
  return new DefaultDiagnosticsProvider(options);
}

export interface BuildUnifiedIntegrationDiagnosticsInput {
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly tenantId?: string;
  readonly correlationId: string;
  readonly observedAt: string;
  readonly connectionConfigured: boolean;
  readonly authenticationPresent: boolean;
  readonly healthStatus: IntegrationDiagnostics["healthStatus"];
  readonly versionCompatibility?: IntegrationDiagnostics["versionCompatibility"];
  readonly engineVersion?: string;
  readonly connection?: ReturnType<typeof buildConnectionDiagnostics>;
  readonly authentication?: ReturnType<typeof buildAuthenticationDiagnostics>;
  readonly warnings?: readonly string[];
  readonly recommendations?: readonly string[];
}

export function buildUnifiedIntegrationDiagnostics(
  input: BuildUnifiedIntegrationDiagnosticsInput,
): IntegrationDiagnostics {
  return {
    integrationId: input.integrationId,
    capabilityId: input.capabilityId,
    tenantId: input.tenantId,
    connectionConfigured: input.connectionConfigured,
    authenticationPresent: input.authenticationPresent,
    engineVersion: input.engineVersion,
    versionCompatibility: input.versionCompatibility ?? "not_checked",
    healthStatus: input.healthStatus,
    correlationId: input.correlationId,
    observedAt: input.observedAt,
    warnings: input.warnings ?? [],
    recommendations: input.recommendations ?? [],
    connection: input.connection,
    authentication: input.authentication,
  };
}
