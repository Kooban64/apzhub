import type {
  PlatformAuditEntry,
  PlatformCapabilitySummary,
  PlatformConfigurationSummary,
  PlatformControlPlaneSnapshot,
  PlatformOperationsSummary,
  PlatformUserSummary,
} from "./types";

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${url}`);
  }
  return (await response.json()) as T;
}

export async function fetchOperationsSummary(): Promise<PlatformOperationsSummary> {
  const body = await fetchJson<{ data: PlatformOperationsSummary }>(
    "/api/platform/v1/operations/summary",
  );
  return body.data;
}

export async function fetchOperationsControlPlane(): Promise<PlatformControlPlaneSnapshot> {
  const body = await fetchJson<{ data: PlatformControlPlaneSnapshot }>(
    "/api/platform/v1/operations/control-plane",
  );
  return body.data;
}

export async function fetchPlatformUsers(): Promise<readonly PlatformUserSummary[]> {
  const body = await fetchJson<{ data: readonly PlatformUserSummary[] }>(
    "/api/platform/v1/users",
  );
  return body.data;
}

export async function fetchPlatformTenants(): Promise<unknown[]> {
  const body = await fetchJson<{ data: unknown[] }>("/api/platform/v1/tenants");
  return body.data;
}

export async function fetchPlatformRoles(): Promise<unknown[]> {
  const body = await fetchJson<{ data: unknown[] }>("/api/platform/v1/roles");
  return body.data;
}

export async function fetchPlatformPermissions(): Promise<unknown[]> {
  const body = await fetchJson<{ data: unknown[] }>("/api/platform/v1/permissions");
  return body.data;
}

export async function fetchPlatformModules(): Promise<readonly PlatformCapabilitySummary[]> {
  const body = await fetchJson<{ data: readonly PlatformCapabilitySummary[] }>(
    "/api/platform/v1/modules",
  );
  return body.data;
}

export async function fetchPlatformServices(): Promise<readonly PlatformCapabilitySummary[]> {
  const body = await fetchJson<{ data: readonly PlatformCapabilitySummary[] }>(
    "/api/platform/v1/services",
  );
  return body.data;
}

export async function fetchPlatformProducts(): Promise<readonly PlatformCapabilitySummary[]> {
  const body = await fetchJson<{ data: readonly PlatformCapabilitySummary[] }>(
    "/api/platform/v1/products",
  );
  return body.data;
}

export async function fetchPlatformAudit(): Promise<readonly PlatformAuditEntry[]> {
  const body = await fetchJson<{ data: readonly PlatformAuditEntry[] }>(
    "/api/platform/v1/audit",
  );
  return body.data;
}

export async function fetchPlatformConfiguration(): Promise<PlatformConfigurationSummary> {
  const body = await fetchJson<{ data: PlatformConfigurationSummary }>(
    "/api/platform/v1/operations/configuration",
  );
  return body.data;
}

export async function fetchIdentityDiagnostics(): Promise<Record<string, unknown>> {
  const body = await fetchJson<{ data: Record<string, unknown> }>(
    "/api/platform/v1/identity/diagnostics",
  );
  return body.data;
}

export async function fetchAuthorizationDiagnostics(): Promise<Record<string, unknown>> {
  const body = await fetchJson<{ data: Record<string, unknown> }>(
    "/api/platform/v1/authorization/diagnostics",
  );
  return body.data;
}

export async function fetchPersonalisationPreferences(): Promise<Record<string, unknown>> {
  const body = await fetchJson<{ data: Record<string, unknown> }>(
    "/api/platform/v1/preferences",
  );
  return body.data;
}

export async function patchPersonalisationPreferences(
  patch: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const response = await fetch("/api/platform/v1/preferences", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    throw new Error("Failed to update preferences.");
  }
  const body = (await response.json()) as { data: Record<string, unknown> };
  return body.data;
}

export async function fetchPersonalisationFavorites(): Promise<unknown[]> {
  const body = await fetchJson<{ data: unknown[] }>("/api/platform/v1/favorites");
  return body.data;
}

export async function fetchPersonalisationRecent(): Promise<unknown[]> {
  const body = await fetchJson<{ data: unknown[] }>("/api/platform/v1/recent");
  return body.data;
}

export async function fetchPersonalisationDiagnostics(): Promise<Record<string, unknown>> {
  const body = await fetchJson<{ data: Record<string, unknown> }>(
    "/api/platform/v1/personalisation/diagnostics",
  );
  return body.data;
}

export async function fetchGovernance(): Promise<Record<string, unknown>> {
  const body = await fetchJson<{ data: Record<string, unknown> }>("/api/platform/v1/governance");
  return body.data;
}

export async function fetchGovernanceDiagnostics(): Promise<Record<string, unknown>> {
  const body = await fetchJson<{ data: Record<string, unknown> }>(
    "/api/platform/v1/governance/diagnostics",
  );
  return body.data;
}

export async function fetchProvisioningStatus(): Promise<Record<string, unknown>> {
  const body = await fetchJson<{ data: Record<string, unknown> }>(
    "/api/platform/v1/provisioning",
  );
  return body.data;
}

export async function fetchFeatureFlags(): Promise<Record<string, unknown>> {
  const body = await fetchJson<{ data: Record<string, unknown> }>(
    "/api/platform/v1/feature-flags",
  );
  return body.data;
}

export async function fetchCapabilities(): Promise<Record<string, unknown>> {
  const body = await fetchJson<{ data: Record<string, unknown> }>("/api/platform/v1/capabilities");
  return body.data;
}

export async function fetchPlatformSecurity(): Promise<Record<string, unknown>> {
  const body = await fetchJson<{ data: Record<string, unknown> }>("/api/platform/v1/security");
  return body.data;
}

export async function fetchSecurityDiagnostics(): Promise<Record<string, unknown>> {
  const body = await fetchJson<{ data: Record<string, unknown> }>(
    "/api/platform/v1/security/diagnostics",
  );
  return body.data;
}

export async function fetchSystemHealth(): Promise<Record<string, unknown>> {
  return fetchJson<Record<string, unknown>>("/api/platform/v1/system/health");
}

export async function fetchSystemReadiness(): Promise<Record<string, unknown>> {
  const body = await fetchJson<{ data: Record<string, unknown> }>(
    "/api/platform/v1/system/readiness",
  );
  return body.data;
}

export async function fetchSystemLiveness(): Promise<Record<string, unknown>> {
  const body = await fetchJson<{ data: Record<string, unknown> }>(
    "/api/platform/v1/system/liveness",
  );
  return body.data;
}
