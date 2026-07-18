/**
 * Search domain error classifications (APZSEARCH-003).
 * Domain-layer only — PlatformServiceError mapping lives in platform-services.
 */

export const SEARCH_ERROR_CLASSIFICATIONS = [
  "provider_not_found",
  "provider_duplicate",
  "provider_disabled",
  "configuration_not_found",
  "configuration_invalid",
  "configuration_conflict",
  "collection_not_found",
  "source_not_found",
  "scope_not_found",
  "profile_not_found",
  "metadata_not_found",
  "not_found",
  "duplicate",
  "invalid_input",
  "validation_failed",
  "authorization_denied",
  "tenant_mismatch",
  "organisation_mismatch",
  "search_execution_unavailable",
  "capability_unsupported",
  "conflict",
  "archived",
  // Execution plane (APZSEARCH-006)
  "execution_provider_not_found",
  "execution_provider_unavailable",
  "execution_provider_unhealthy",
  "execution_provider_disabled",
  "execution_capability_unsupported",
  "provider_resolution_failed",
  "index_not_found",
  "document_not_found",
  "tenant_filter_required",
  "security_filter_violation",
  "engine_operation_failed",
] as const;

export type SearchErrorClassification = (typeof SEARCH_ERROR_CLASSIFICATIONS)[number];

export function isSearchErrorClassification(
  value: string,
): value is SearchErrorClassification {
  return (SEARCH_ERROR_CLASSIFICATIONS as readonly string[]).includes(value);
}

export class SearchDomainError extends Error {
  constructor(
    readonly classification: SearchErrorClassification,
    message: string,
    readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "SearchDomainError";
  }
}

export function isSearchDomainError(error: unknown): error is SearchDomainError {
  return error instanceof SearchDomainError;
}

export function searchProviderNotFound(providerId: string): SearchDomainError {
  return new SearchDomainError(
    "provider_not_found",
    `Search provider not found: ${providerId}`,
    { providerId },
  );
}

export function searchProviderDuplicate(providerId: string): SearchDomainError {
  return new SearchDomainError(
    "provider_duplicate",
    `Duplicate search provider registration: ${providerId}`,
    { providerId },
  );
}

export function searchConfigurationInvalid(
  issues: readonly string[],
): SearchDomainError {
  return new SearchDomainError(
    "configuration_invalid",
    `Invalid search configuration: ${issues.join("; ")}`,
    { issues: [...issues] },
  );
}

export function searchTenantMismatch(
  expected: string,
  actual: string,
): SearchDomainError {
  return new SearchDomainError("tenant_mismatch", "Search tenant isolation violation", {
    expected,
    actual,
  });
}

export function searchExecutionUnavailable(detail?: string): SearchDomainError {
  return new SearchDomainError(
    "search_execution_unavailable",
    detail ?? "Search execution is unavailable — provider not configured or disabled",
  );
}

export function searchNotFound(kind: string, id: string): SearchDomainError {
  return new SearchDomainError("not_found", `${kind} not found: ${id}`, {
    kind,
    id,
  });
}

export function searchExecutionProviderNotFound(
  providerId?: string,
): SearchDomainError {
  return new SearchDomainError(
    "execution_provider_not_found",
    providerId
      ? `Search execution provider not found: ${providerId}`
      : "Search execution provider not found",
    providerId ? { providerId } : undefined,
  );
}

export function searchExecutionProviderUnavailable(detail?: string): SearchDomainError {
  return new SearchDomainError(
    "execution_provider_unavailable",
    detail ?? "Search execution provider is unavailable",
  );
}

export function searchExecutionProviderUnhealthy(detail?: string): SearchDomainError {
  return new SearchDomainError(
    "execution_provider_unhealthy",
    detail ?? "Search execution provider is unhealthy",
  );
}

export function searchProviderResolutionFailed(detail?: string): SearchDomainError {
  return new SearchDomainError(
    "provider_resolution_failed",
    detail ??
      "No eligible search execution provider — resolution refuses silent fallback",
  );
}

export function searchCapabilityUnsupported(capability: string): SearchDomainError {
  return new SearchDomainError(
    "execution_capability_unsupported",
    `Search capability not supported: ${capability}`,
    { capability },
  );
}

export function searchTenantFilterRequired(detail?: string): SearchDomainError {
  return new SearchDomainError(
    "tenant_filter_required",
    detail ?? "Mandatory tenant security filter could not be applied — fail closed",
  );
}

export function searchSecurityFilterViolation(detail?: string): SearchDomainError {
  return new SearchDomainError(
    "security_filter_violation",
    detail ?? "Client attempted to strip or override mandatory security filters",
  );
}

export function searchEngineOperationFailed(
  detail?: string,
  details?: Readonly<Record<string, unknown>>,
): SearchDomainError {
  return new SearchDomainError(
    "engine_operation_failed",
    detail ?? "Search engine operation failed",
    details,
  );
}

export function searchIndexNotFound(indexId: string): SearchDomainError {
  return new SearchDomainError(
    "index_not_found",
    `Search index not found: ${indexId}`,
    { indexId },
  );
}

export function searchDocumentNotFound(documentId: string): SearchDomainError {
  return new SearchDomainError(
    "document_not_found",
    `Search document not found: ${documentId}`,
    { documentId },
  );
}
