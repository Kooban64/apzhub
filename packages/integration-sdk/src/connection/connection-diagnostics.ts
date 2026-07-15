import type { ConnectionLifecycleState, ConnectionRecord } from "./types";

export interface ConnectionDiagnostics {
  readonly tenantScope?: string;
  readonly connectionCount: number;
  readonly connectedCount: number;
  readonly degradedCount: number;
  readonly failedCount: number;
  readonly disabledCount: number;
  readonly lifecycleCounts: Readonly<Record<ConnectionLifecycleState, number>>;
  readonly lastValidationAt?: string;
  readonly warnings: readonly string[];
  readonly recommendations: readonly string[];
}

export interface BuildConnectionDiagnosticsInput {
  readonly connections: readonly ConnectionRecord[];
  readonly tenantId?: string;
}

export function buildConnectionDiagnostics(
  input: BuildConnectionDiagnosticsInput,
): ConnectionDiagnostics {
  const lifecycleCounts = Object.fromEntries(
    (
      [
        "unconfigured",
        "configured",
        "authenticating",
        "connected",
        "disconnected",
        "authentication_failed",
        "misconfigured",
        "degraded",
        "disabled",
      ] as ConnectionLifecycleState[]
    ).map((state) => [state, 0]),
  ) as Record<ConnectionLifecycleState, number>;

  let lastValidationAt: string | undefined;

  for (const connection of input.connections) {
    lifecycleCounts[connection.lifecycleState] += 1;
    if (
      connection.lastValidatedAt &&
      (!lastValidationAt || connection.lastValidatedAt > lastValidationAt)
    ) {
      lastValidationAt = connection.lastValidatedAt;
    }
  }

  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (lifecycleCounts.authentication_failed > 0) {
    warnings.push(`${lifecycleCounts.authentication_failed} connection(s) failed authentication`);
    recommendations.push("Review credential references and SecretProvider configuration");
  }

  if (lifecycleCounts.misconfigured > 0) {
    warnings.push(`${lifecycleCounts.misconfigured} misconfigured connection(s)`);
    recommendations.push("Validate connection definitions before opening");
  }

  return {
    tenantScope: input.tenantId,
    connectionCount: input.connections.length,
    connectedCount: lifecycleCounts.connected,
    degradedCount: lifecycleCounts.degraded,
    failedCount: lifecycleCounts.authentication_failed,
    disabledCount: lifecycleCounts.disabled,
    lifecycleCounts,
    lastValidationAt,
    warnings,
    recommendations,
  };
}

export function buildConnectionRecordDiagnostics(
  record: ConnectionRecord,
  secretPresent: boolean,
) {
  return {
    connectionId: record.connectionId,
    tenantId: record.tenantId,
    integrationId: record.integrationId,
    adapterId: record.adapterId,
    authenticationMode: record.authenticationMode,
    lifecycleState: record.lifecycleState,
    enabled: record.enabled,
    secretPresent,
    credentialRef: record.credentialRef,
    configuredAt: record.configuredAt,
    connectedAt: record.connectedAt,
    disconnectedAt: record.disconnectedAt,
    lastValidatedAt: record.lastValidatedAt,
  };
}
