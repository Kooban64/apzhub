import type { IntegrationRequestContext } from "../types";
import type { IntegrationDiagnostics, IntegrationHealth } from "./types";

export interface CreatePlaceholderDiagnosticsInput {
  readonly integrationId: string;
  readonly context: IntegrationRequestContext;
  readonly capabilityId?: string;
  readonly connectionConfigured?: boolean;
  readonly authenticationPresent?: boolean;
}

export function createPlaceholderIntegrationHealth(
  input: CreatePlaceholderDiagnosticsInput,
): IntegrationHealth {
  const observedAt = new Date().toISOString();
  const configured = input.connectionConfigured ?? false;
  const authenticated = input.authenticationPresent ?? false;

  const checks = [
    {
      name: "configuration",
      status: configured ? ("pass" as const) : ("warn" as const),
      message: configured
        ? "Connection configuration present"
        : "Connection configuration not verified (placeholder)",
    },
    {
      name: "authentication",
      status: authenticated ? ("pass" as const) : ("warn" as const),
      message: authenticated
        ? "Credential reference present"
        : "Authentication not verified (placeholder)",
    },
    {
      name: "engine_probe",
      status: "warn" as const,
      message: "Live engine probe uses logical connection metadata (OSS-100-03)",
    },
  ];

  const status =
    configured && authenticated ? ("degraded" as const) : ("unavailable" as const);

  return {
    status,
    integrationId: input.integrationId,
    capabilityId: input.capabilityId,
    tenantId: input.context.tenantId,
    checks,
    observedAt,
    correlationId: input.context.correlationId,
  };
}

export function createPlaceholderIntegrationDiagnostics(
  input: CreatePlaceholderDiagnosticsInput,
): IntegrationDiagnostics {
  const health = createPlaceholderIntegrationHealth(input);
  const observedAt = health.observedAt;

  return {
    integrationId: input.integrationId,
    capabilityId: input.capabilityId,
    connectionConfigured: input.connectionConfigured ?? false,
    authenticationPresent: input.authenticationPresent ?? false,
    versionCompatibility: "not_checked",
    healthStatus: health.status,
    correlationId: input.context.correlationId,
    observedAt,
    warnings: [],
    recommendations: [],
    placeholder: true,
  };
}
