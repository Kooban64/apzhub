import {
  buildDefaultTranslatedError,
  resolveErrorSeverity,
  type TranslatedIntegrationError,
  type VendorErrorInput,
  type VendorErrorMapper,
} from "@apzhub/integration-sdk/errors";
import type { IntegrationErrorCategory } from "@apzhub/integration-sdk/errors";

import { PAPERLESS_INTEGRATION_ID } from "./version";

function categoryFrom(input: VendorErrorInput): IntegrationErrorCategory {
  if (input.statusCode === 401) return "authentication";
  if (input.statusCode === 403) return "authorization";
  if (input.statusCode === 404) return "not_found";
  if (input.statusCode === 429) return "rate_limited";
  if (input.timeout) return "timeout";
  if (input.networkError || (input.statusCode ?? 0) >= 500) return "vendor_unavailable";
  return "internal";
}

function operatorMessage(category: IntegrationErrorCategory): string {
  const messages: Record<IntegrationErrorCategory, string> = {
    authentication: "Documents DMS engine authentication failed",
    authorization: "Documents DMS engine authorization failed",
    validation: "Documents DMS request validation failed",
    not_found: "Documents DMS resource was not found",
    conflict: "Documents DMS request conflict",
    rate_limited: "Documents DMS engine rate limit exceeded",
    vendor_unavailable: "Documents DMS engine is unavailable",
    timeout: "Documents DMS engine request timed out",
    mapping: "Documents DMS response mapping failed",
    provisioning: "Documents DMS provisioning failed",
    version_incompatible: "Documents DMS engine version is incompatible",
    not_implemented: "Documents DMS operation is not supported",
    internal: "Documents DMS integration encountered an internal error",
  };
  return messages[category];
}

export class PaperlessVendorErrorMapper implements VendorErrorMapper {
  readonly integrationId = PAPERLESS_INTEGRATION_ID;

  map(input: VendorErrorInput): TranslatedIntegrationError | null {
    if (input.statusCode === undefined && !input.timeout && !input.networkError) {
      return null;
    }
    const category = categoryFrom(input);
    const base = buildDefaultTranslatedError(input, new Date().toISOString(), {
      category,
      code: `paperless.${category}.default`,
      message: operatorMessage(category),
    });
    return { ...base, severity: resolveErrorSeverity(category) };
  }
}

export function createPaperlessVendorErrorMapper(): PaperlessVendorErrorMapper {
  return new PaperlessVendorErrorMapper();
}

export function mapPaperlessUnknownError(
  error: unknown,
  context: VendorErrorInput["context"],
): TranslatedIntegrationError {
  const record =
    typeof error === "object" && error !== null
      ? (error as { statusCode?: number; body?: unknown; code?: string })
      : {};
  const mapper = createPaperlessVendorErrorMapper();
  return (
    mapper.map({
      statusCode: record.statusCode,
      body: record.body,
      vendorMessage: error instanceof Error ? error.message : String(error),
      context,
      timeout: error instanceof Error && error.name === "AbortError",
      networkError: record.code === "ECONNREFUSED",
    }) ??
    buildDefaultTranslatedError(
      {
        context,
        vendorMessage: error instanceof Error ? error.message : String(error),
      },
      new Date().toISOString(),
      {
        category: "internal",
        code: "paperless.internal.default",
        message: operatorMessage("internal"),
      },
    )
  );
}
