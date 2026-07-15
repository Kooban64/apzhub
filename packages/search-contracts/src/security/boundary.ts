/**
 * Search security boundary helpers (APZSEARCH-001 / APZSEARCH-002).
 * Platform authorization always applies — no provider bypass.
 */

import type { SearchRequestContext } from "../common/context";
import type { SearchMetadata } from "../domain/search";
import {
  hasSearchAuditPermission,
  hasSearchConfigurationPermission,
  hasSearchDiagnosticsPermission,
  hasSearchProviderPermission,
  hasSearchQueryPermission,
} from "../permissions/catalogue";

export type SearchSecurityIssue = {
  readonly code: string;
  readonly message: string;
};

/**
 * Ensures a hit's metadata matches the caller's tenant (and org when both set).
 * Classification and product ownership remain product/service concerns.
 */
export function evaluateSearchHitVisibility(
  context: SearchRequestContext,
  metadata: SearchMetadata,
): { readonly visible: boolean; readonly issues: readonly SearchSecurityIssue[] } {
  const issues: SearchSecurityIssue[] = [];

  if (metadata.tenantId !== context.tenantId) {
    issues.push({
      code: "TENANT_MISMATCH",
      message: "search hit tenant does not match request context",
    });
  }

  if (
    context.organisationId !== undefined &&
    metadata.organisationId !== undefined &&
    metadata.organisationId !== context.organisationId
  ) {
    issues.push({
      code: "ORGANISATION_MISMATCH",
      message: "search hit organisation does not match request context",
    });
  }

  if (!hasSearchQueryPermission(context.permissions)) {
    issues.push({
      code: "MISSING_QUERY_PERMISSION",
      message: "actor lacks search.query (or equivalent) permission",
    });
  }

  return { visible: issues.length === 0, issues };
}

export function assertSearchCapabilityAccess(
  context: SearchRequestContext,
  capability:
    | "query"
    | "provider"
    | "diagnostics"
    | "configuration"
    | "audit",
): boolean {
  const checkers: Record<
    typeof capability,
    (permissions: readonly string[]) => boolean
  > = {
    query: hasSearchQueryPermission,
    provider: hasSearchProviderPermission,
    diagnostics: hasSearchDiagnosticsPermission,
    configuration: hasSearchConfigurationPermission,
    audit: hasSearchAuditPermission,
  };
  return checkers[capability](context.permissions);
}

/** Providers must never receive credentials via diagnostics payloads. */
export function isSafeSearchDiagnosticsPayload(
  payload: Readonly<Record<string, unknown>>,
): boolean {
  const forbidden = [
    "password",
    "secret",
    "apiKey",
    "api_key",
    "token",
    "connectionString",
    "connection_string",
    "credential",
  ];
  for (const key of Object.keys(payload)) {
    const lower = key.toLowerCase();
    if (forbidden.some((f) => lower.includes(f.toLowerCase()))) {
      return false;
    }
  }
  return true;
}
