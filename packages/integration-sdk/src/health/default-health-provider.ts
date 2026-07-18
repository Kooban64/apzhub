import type { ConnectionRecord } from "../connection/types";
import type { ConnectionRegistry } from "../connection/registry";
import type { VersionProvider } from "../version/types";
import type { CircuitBreaker } from "../resilience/types";
import { buildCircuitBreakerHealthMessage } from "../resilience/circuit-breaker";
import type { Clock } from "../auth/authentication-provider";
import { systemClock } from "../auth/authentication-provider";
import type { IntegrationHealthCheck } from "../diagnostics/types";
import {
  aggregateHealthChecks,
  mapConnectionLifecycleToHealthSignal,
} from "./aggregation";
import type { HealthCheckContext, HealthProvider } from "./types";

export interface DefaultHealthProviderOptions {
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly registry: ConnectionRegistry;
  readonly versionProvider?: VersionProvider;
  readonly circuitBreaker?: CircuitBreaker;
  readonly clock?: Clock;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function findTenantConnection(
  registry: ConnectionRegistry,
  tenantId: string,
  integrationId: string,
): ConnectionRecord | undefined {
  return registry
    .listByTenant(tenantId)
    .find((record) => record.integrationId === integrationId);
}

export class DefaultHealthProvider implements HealthProvider {
  private readonly integrationId: string;
  private readonly capabilityId?: string;
  private readonly registry: ConnectionRegistry;
  private readonly versionProvider?: VersionProvider;
  private readonly circuitBreaker?: CircuitBreaker;
  private readonly clock: Clock;

  constructor(options: DefaultHealthProviderOptions) {
    this.integrationId = options.integrationId;
    this.capabilityId = options.capabilityId;
    this.registry = options.registry;
    this.versionProvider = options.versionProvider;
    this.circuitBreaker = options.circuitBreaker;
    this.clock = options.clock ?? systemClock;
  }

  async check(input: HealthCheckContext) {
    const observedAt = this.clock.now();
    const connection = findTenantConnection(
      this.registry,
      input.context.tenantId,
      this.integrationId,
    );

    if (!connection) {
      return aggregateHealthChecks({
        integrationId: this.integrationId,
        capabilityId: this.capabilityId,
        tenantId: input.context.tenantId,
        correlationId: input.context.correlationId,
        observedAt,
        checks: [
          {
            name: "configuration",
            status: "fail",
            message: "No connection registered for tenant and integration",
          },
        ],
      });
    }

    if (!connection.enabled || connection.lifecycleState === "disabled") {
      return aggregateHealthChecks({
        integrationId: this.integrationId,
        capabilityId: this.capabilityId,
        tenantId: input.context.tenantId,
        correlationId: input.context.correlationId,
        observedAt,
        disabled: true,
        checks: [],
      });
    }

    const checks: IntegrationHealthCheck[] = [
      this.buildConfigurationCheck(connection),
      this.buildConnectivityCheck(connection),
      this.buildAuthenticationCheck(connection),
      this.buildAuthorizationCheck(connection),
      await this.buildVersionCheck(connection, input),
      this.buildCircuitBreakerCheck(),
    ];

    return aggregateHealthChecks({
      integrationId: this.integrationId,
      capabilityId: this.capabilityId,
      tenantId: input.context.tenantId,
      correlationId: input.context.correlationId,
      observedAt,
      checks,
    });
  }

  private buildConfigurationCheck(
    connection: ConnectionRecord,
  ): IntegrationHealthCheck {
    const configured =
      connection.lifecycleState !== "unconfigured" &&
      connection.lifecycleState !== "misconfigured" &&
      Boolean(connection.configuredAt);

    return {
      name: "configuration",
      status: configured ? "pass" : "fail",
      message: configured
        ? "Connection configuration validated"
        : "Connection is misconfigured or incomplete",
    };
  }

  private buildConnectivityCheck(connection: ConnectionRecord): IntegrationHealthCheck {
    const validUrl = isValidHttpUrl(connection.baseUrl);
    return {
      name: "connectivity",
      status: validUrl ? "pass" : "fail",
      message: validUrl
        ? "Base URL format is valid (logical connectivity — no network probe)"
        : "Base URL is missing or invalid",
    };
  }

  private buildAuthenticationCheck(
    connection: ConnectionRecord,
  ): IntegrationHealthCheck {
    const hasCredentialRef = Boolean(connection.credentialRef.trim());
    const authSignal = mapConnectionLifecycleToHealthSignal(connection.lifecycleState);

    if (!hasCredentialRef) {
      return {
        name: "authentication",
        status: "fail",
        message: "Credential reference is missing",
      };
    }

    if (connection.lifecycleState === "authentication_failed") {
      return {
        name: "authentication",
        status: "fail",
        message: "Authentication failed for connection",
      };
    }

    return {
      name: "authentication",
      status: authSignal === "pass" ? "pass" : authSignal,
      message:
        authSignal === "pass"
          ? "Authentication validated for logical connection"
          : "Authentication not yet validated",
    };
  }

  private buildAuthorizationCheck(
    connection: ConnectionRecord,
  ): IntegrationHealthCheck {
    if (connection.lifecycleState === "connected") {
      return {
        name: "authorization",
        status: "pass",
        message: "Logical connection authorized for tenant scope",
      };
    }

    return {
      name: "authorization",
      status: "warn",
      message: "Authorization scopes not verified until connection is connected",
    };
  }

  private async buildVersionCheck(
    connection: ConnectionRecord,
    input: HealthCheckContext,
  ): Promise<IntegrationHealthCheck> {
    if (!this.versionProvider) {
      return {
        name: "version",
        status: "warn",
        message: "Version provider not configured",
      };
    }

    const declared = this.versionProvider.resolveDeclaredRange(connection.metadata);
    const detected = await this.versionProvider.probe({
      connection,
      context: input.context,
    });

    if (!detected) {
      return {
        name: "version",
        status: "warn",
        message: "Engine version not declared in connection metadata",
      };
    }

    if (!declared) {
      return {
        name: "version",
        status: "warn",
        message: `Detected engine version ${detected.version} — compatibility range not declared`,
      };
    }

    const compatibility = this.versionProvider.checkCompatibility(detected, declared);
    if (compatibility.status === "incompatible") {
      return {
        name: "version",
        status: "fail",
        message:
          compatibility.message ?? "Engine version incompatible with declared range",
      };
    }

    if (compatibility.status === "warning") {
      return {
        name: "version",
        status: "warn",
        message: compatibility.message ?? "Engine version near compatibility boundary",
      };
    }

    return {
      name: "version",
      status: "pass",
      message: `Engine version ${detected.version} is compatible`,
    };
  }

  private buildCircuitBreakerCheck(): IntegrationHealthCheck {
    if (!this.circuitBreaker) {
      return {
        name: "circuit_breaker",
        status: "pass",
        message: "Circuit breaker not configured — default available",
      };
    }

    const diagnostics = this.circuitBreaker.getDiagnostics();
    const health = buildCircuitBreakerHealthMessage(diagnostics);
    return {
      name: "circuit_breaker",
      status: health.status,
      message: health.message,
    };
  }
}

export function createDefaultHealthProvider(
  options: DefaultHealthProviderOptions,
): HealthProvider {
  return new DefaultHealthProvider(options);
}
