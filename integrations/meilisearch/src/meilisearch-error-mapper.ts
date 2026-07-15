import {
  buildDefaultTranslatedError,
  resolveErrorSeverity,
  type TranslatedIntegrationError,
  type VendorErrorInput,
  type VendorErrorMapper,
} from "@apzhub/integration-sdk/errors";
import type { IntegrationErrorCategory } from "@apzhub/integration-sdk/errors";

import { MEILISEARCH_INTEGRATION_ID } from "./version";
import type { MeilisearchErrorBody } from "./internal/meilisearch-api-types";
import { NOT_SUPPORTED } from "./results/unsupported";

const MEILI_ERROR_CODE_CATEGORY: Readonly<Record<string, IntegrationErrorCategory>> = {
  invalid_api_key: "authentication",
  missing_authorization_header: "authentication",
  invalid_api_key_format: "authentication",
  not_found: "not_found",
  index_not_found: "not_found",
  document_not_found: "not_found",
  invalid_request: "validation",
  invalid_search_q: "validation",
  invalid_search_filter: "validation",
  invalid_search_sort: "validation",
  invalid_index_uid: "validation",
  index_already_exists: "conflict",
  task_not_found: "not_found",
  not_supported: "not_implemented",
  NOT_SUPPORTED: "not_implemented",
};

function extractMessage(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  return (body as MeilisearchErrorBody).message;
}

function extractCode(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  return (body as MeilisearchErrorBody).code;
}

function buildOperatorMessage(
  category: IntegrationErrorCategory,
  operation?: string,
): string {
  if (operation && /semantic|vector|fuzzy|ai|ocr/i.test(operation)) {
    return `Meilisearch does not support ${operation}`;
  }
  const messages: Record<IntegrationErrorCategory, string> = {
    authentication: "Meilisearch authentication failed",
    authorization: "Meilisearch authorization failed",
    validation: "Meilisearch request validation failed",
    not_found: "Meilisearch resource was not found",
    conflict: "Meilisearch request conflict",
    rate_limited: "Meilisearch rate limit exceeded",
    vendor_unavailable: "Meilisearch API is unavailable",
    timeout: "Meilisearch request timed out",
    mapping: "Meilisearch entity mapping failed",
    provisioning: "Meilisearch provisioning failed",
    version_incompatible: "Meilisearch API version is incompatible",
    not_implemented: "Meilisearch operation is not supported",
    internal: "Meilisearch integration encountered an internal error",
  };
  return messages[category];
}

function categoryFromStatus(input: VendorErrorInput): IntegrationErrorCategory {
  if (input.vendorCode === NOT_SUPPORTED || input.vendorCode === "not_supported") {
    return "not_implemented";
  }
  if (input.statusCode === 401) return "authentication";
  if (input.statusCode === 403) return "authorization";
  if (input.statusCode === 404) return "not_found";
  if (input.statusCode === 409) return "conflict";
  if (input.statusCode === 400 || input.statusCode === 422) return "validation";
  if (input.statusCode === 429) return "rate_limited";
  if (input.statusCode === 501) return "not_implemented";
  if (input.timeout) return "timeout";
  if (input.networkError || (input.statusCode ?? 0) >= 500) return "vendor_unavailable";
  return "internal";
}

export class MeilisearchErrorMapper implements VendorErrorMapper {
  readonly integrationId = MEILISEARCH_INTEGRATION_ID;

  map(input: VendorErrorInput): TranslatedIntegrationError | null {
    const vendorCode = input.vendorCode ?? extractCode(input.body);
    const categoryFromCode = vendorCode
      ? MEILI_ERROR_CODE_CATEGORY[vendorCode]
      : undefined;

    if (
      !categoryFromCode &&
      input.statusCode === undefined &&
      !input.timeout &&
      !input.networkError &&
      vendorCode !== NOT_SUPPORTED
    ) {
      return null;
    }

    const resolvedCategory = categoryFromCode ?? categoryFromStatus(input);
    const code = vendorCode
      ? `meilisearch.${vendorCode.toLowerCase()}`
      : `meilisearch.${resolvedCategory}.default`;

    const capturedAt = new Date().toISOString();
    const base = buildDefaultTranslatedError(
      {
        ...input,
        vendorCode,
        vendorMessage: input.vendorMessage ?? extractMessage(input.body),
      },
      capturedAt,
      {
        category: resolvedCategory,
        code,
        message: buildOperatorMessage(resolvedCategory, input.context?.operation),
      },
    );

    return {
      ...base,
      severity: resolveErrorSeverity(resolvedCategory),
    };
  }
}

/** Alias matching milestone vocabulary. */
export { MeilisearchErrorMapper as MeilisearchVendorErrorMapper };

export function createMeilisearchErrorMapper(): MeilisearchErrorMapper {
  return new MeilisearchErrorMapper();
}

export function mapMeilisearchUnknownError(
  error: unknown,
  context: VendorErrorInput["context"],
): TranslatedIntegrationError {
  const mapper = createMeilisearchErrorMapper();
  const statusCode =
    typeof error === "object" && error !== null && "statusCode" in error
      ? Number((error as { statusCode?: number }).statusCode)
      : undefined;
  const body =
    typeof error === "object" && error !== null && "body" in error
      ? (error as { body?: unknown }).body
      : undefined;
  const vendorCode =
    typeof error === "object" && error !== null && "vendorCode" in error
      ? String((error as { vendorCode?: string }).vendorCode)
      : undefined;

  return (
    mapper.map({
      statusCode,
      body,
      vendorCode,
      vendorMessage: error instanceof Error ? error.message : String(error),
      context,
      timeout:
        (error instanceof Error && error.name === "AbortError") ||
        vendorCode === "PROVIDER_TIMEOUT",
      networkError:
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "ECONNREFUSED",
    }) ??
    buildDefaultTranslatedError(
      {
        statusCode,
        body,
        context,
      },
      new Date().toISOString(),
    )
  );
}
