/**
 * Search error translator — wraps integration-sdk ErrorTranslator.
 * Maps search domain errors and vendor inputs without engine specifics.
 */

import {
  createDefaultErrorTranslator,
  type ErrorTranslationContext,
  type ErrorTranslator,
  type IntegrationErrorCategory,
  type TranslatedIntegrationError,
  type VendorErrorInput,
  type VendorErrorMapper,
} from "@apzhub/integration-sdk";
import {
  isSearchDomainError,
  type SearchDomainError,
  type SearchErrorClassification,
} from "@apzhub/search-contracts";

const CLASSIFICATION_TO_CATEGORY: Readonly<
  Record<SearchErrorClassification, IntegrationErrorCategory>
> = {
  provider_not_found: "not_found",
  provider_duplicate: "conflict",
  provider_disabled: "vendor_unavailable",
  configuration_not_found: "not_found",
  configuration_invalid: "validation",
  configuration_conflict: "conflict",
  collection_not_found: "not_found",
  source_not_found: "not_found",
  scope_not_found: "not_found",
  profile_not_found: "not_found",
  metadata_not_found: "not_found",
  not_found: "not_found",
  duplicate: "conflict",
  invalid_input: "validation",
  validation_failed: "validation",
  authorization_denied: "authorization",
  tenant_mismatch: "authorization",
  organisation_mismatch: "authorization",
  search_execution_unavailable: "not_implemented",
  capability_unsupported: "not_implemented",
  conflict: "conflict",
  archived: "conflict",
  execution_provider_not_found: "not_found",
  execution_provider_unavailable: "vendor_unavailable",
  execution_provider_unhealthy: "vendor_unavailable",
  execution_provider_disabled: "vendor_unavailable",
  execution_capability_unsupported: "not_implemented",
  provider_resolution_failed: "vendor_unavailable",
  index_not_found: "not_found",
  document_not_found: "not_found",
  tenant_filter_required: "authorization",
  security_filter_violation: "authorization",
  engine_operation_failed: "internal",
};

function stringifyDetails(
  details?: Readonly<Record<string, unknown>>,
): Readonly<Record<string, string>> | undefined {
  if (!details) return undefined;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(details)) {
    out[key] = typeof value === "string" ? value : JSON.stringify(value);
  }
  return out;
}

export class SearchErrorTranslator {
  private readonly delegate: ErrorTranslator;

  constructor(delegate?: ErrorTranslator) {
    this.delegate = delegate ?? createDefaultErrorTranslator();
  }

  registerMapper(mapper: VendorErrorMapper): void {
    this.delegate.registerMapper(mapper);
  }

  unregisterMapper(integrationId: string): void {
    this.delegate.unregisterMapper(integrationId);
  }

  translate(input: VendorErrorInput): TranslatedIntegrationError {
    return this.delegate.translate(input);
  }

  translateUnknown(
    error: unknown,
    context: ErrorTranslationContext,
  ): TranslatedIntegrationError {
    if (isSearchDomainError(error)) {
      return this.translateDomainError(error, context);
    }
    return this.delegate.translateUnknown(error, context);
  }

  translateDomainError(
    error: SearchDomainError,
    context: ErrorTranslationContext,
  ): TranslatedIntegrationError {
    const category = CLASSIFICATION_TO_CATEGORY[error.classification] ?? "internal";
    return {
      error: {
        code: `search.${error.classification}`,
        category,
        message: error.message,
        retryable: category === "vendor_unavailable" || category === "timeout",
        correlationId: context.correlationId,
        details: {
          classification: error.classification,
          ...stringifyDetails(error.details),
        },
      },
      severity: category === "internal" ? "error" : "warning",
    };
  }

  /** Expose underlying integration translator for composition. */
  getDelegate(): ErrorTranslator {
    return this.delegate;
  }
}

export function createSearchErrorTranslator(
  delegate?: ErrorTranslator,
): SearchErrorTranslator {
  return new SearchErrorTranslator(delegate);
}
