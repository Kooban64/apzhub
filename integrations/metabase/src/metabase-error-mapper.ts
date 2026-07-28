import {
  buildDefaultTranslatedError,
  resolveErrorSeverity,
  type TranslatedIntegrationError,
  type VendorErrorInput,
  type VendorErrorMapper,
} from "@apzhub/integration-sdk/errors";
import type { IntegrationErrorCategory } from "@apzhub/integration-sdk/errors";

import { METABASE_INTEGRATION_ID } from "./version";

interface MetabaseApiErrorBody {
  readonly message?: string;
  readonly errors?: unknown;
  readonly "security-error-code"?: string;
}

function extractMessage(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const candidate = body as MetabaseApiErrorBody;
  return candidate.message;
}

function buildOperatorMessage(category: IntegrationErrorCategory): string {
  const messages: Record<IntegrationErrorCategory, string> = {
    authentication: "Metabase authentication failed",
    authorization: "Metabase authorization failed",
    validation: "Metabase request validation failed",
    not_found: "Metabase resource was not found",
    conflict: "Metabase request conflict",
    rate_limited: "Metabase rate limit exceeded",
    vendor_unavailable: "Metabase API is unavailable",
    timeout: "Metabase request timed out",
    mapping: "Metabase entity mapping failed",
    provisioning: "Metabase provisioning failed",
    version_incompatible: "Metabase API version is incompatible",
    not_implemented: "Metabase operation is not supported by this adapter",
    internal: "Metabase integration encountered an internal error",
  };
  return messages[category];
}

function categoryFromStatus(input: VendorErrorInput): IntegrationErrorCategory {
  if (input.statusCode === 401) return "authentication";
  if (input.statusCode === 403) return "authorization";
  if (input.statusCode === 404) return "not_found";
  if (input.statusCode === 409) return "conflict";
  if (input.statusCode === 400 || input.statusCode === 422) return "validation";
  if (input.statusCode === 429) return "rate_limited";
  if (input.statusCode === 501) return "not_implemented";
  if (input.timeout) return "timeout";
  if (input.networkError || (input.statusCode ?? 0) >= 500) {
    return "vendor_unavailable";
  }
  return "internal";
}

export class MetabaseVendorErrorMapper implements VendorErrorMapper {
  readonly integrationId = METABASE_INTEGRATION_ID;

  map(input: VendorErrorInput): TranslatedIntegrationError | null {
    if (input.statusCode === undefined && !input.timeout && !input.networkError) {
      return null;
    }

    const resolvedCategory = categoryFromStatus(input);
    const code = input.vendorCode
      ? `metabase.${input.vendorCode.toLowerCase()}`
      : `metabase.${resolvedCategory}.default`;

    const capturedAt = new Date().toISOString();
    const base = buildDefaultTranslatedError(
      {
        ...input,
        vendorMessage: input.vendorMessage ?? extractMessage(input.body),
      },
      capturedAt,
      {
        category: resolvedCategory,
        code,
        message: buildOperatorMessage(resolvedCategory),
      },
    );

    return {
      ...base,
      severity: resolveErrorSeverity(resolvedCategory),
    };
  }
}

export function createMetabaseVendorErrorMapper(): MetabaseVendorErrorMapper {
  return new MetabaseVendorErrorMapper();
}

export function mapMetabaseUnknownError(
  error: unknown,
  context: VendorErrorInput["context"],
): TranslatedIntegrationError {
  const mapper = createMetabaseVendorErrorMapper();
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
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  return (
    mapper.map({
      statusCode,
      body,
      vendorCode,
      vendorMessage: message,
      context,
      timeout:
        (error instanceof Error && error.name === "AbortError") ||
        lower.includes("timeout") ||
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
        vendorMessage: message,
      },
      new Date().toISOString(),
      {
        category:
          lower.includes("credential") || lower.includes("unauthorized")
            ? "authentication"
            : lower.includes("not support") || lower.includes("not implemented")
              ? "not_implemented"
              : "internal",
        message: buildOperatorMessage(
          lower.includes("credential") || lower.includes("unauthorized")
            ? "authentication"
            : lower.includes("not support") || lower.includes("not implemented")
              ? "not_implemented"
              : "internal",
        ),
      },
    )
  );
}

export { METABASE_INTEGRATION_ID };
