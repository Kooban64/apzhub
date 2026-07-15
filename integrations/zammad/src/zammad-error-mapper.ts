import {
  buildDefaultTranslatedError,
  resolveErrorSeverity,
  type TranslatedIntegrationError,
  type VendorErrorInput,
  type VendorErrorMapper,
} from "@apzhub/integration-sdk/errors";
import type { IntegrationErrorCategory } from "@apzhub/integration-sdk/errors";

export const ZAMMAD_INTEGRATION_ID = "zammad";

interface ZammadApiErrorBody {
  readonly error?: string;
  readonly error_code?: string;
  readonly message?: string;
  readonly description?: string;
}

const ZAMMAD_ERROR_CODE_CATEGORY: Readonly<Record<string, IntegrationErrorCategory>> = {
  INVALID_TOKEN: "authentication",
  AUTHENTICATION_FAILED: "authentication",
  UNAUTHORIZED: "authentication",
  FORBIDDEN: "authorization",
  PERMISSION_DENIED: "authorization",
  NOT_FOUND: "not_found",
  TICKET_NOT_FOUND: "not_found",
  ARTICLE_NOT_FOUND: "not_found",
  VALIDATION_ERROR: "validation",
  INVALID_ATTRIBUTE: "validation",
  INVALID_ARTICLE_TYPE: "validation",
  INVALID_SENDER: "validation",
  INVALID_VISIBILITY: "validation",
  INVALID_RECIPIENT: "validation",
  INVALID_BODY: "validation",
  INVALID_CONTENT_TYPE: "validation",
  PAYLOAD_TOO_LARGE: "validation",
  CONFLICT: "conflict",
  DUPLICATE: "conflict",
  RATE_LIMITED: "rate_limited",
  PROVIDER_TIMEOUT: "timeout",
  RETRY_EXHAUSTED: "vendor_unavailable",
  WEBHOOK_NOT_FOUND: "not_found",
  WEBHOOK_INVALID: "validation",
  WEBHOOK_FAILED: "vendor_unavailable",
  SYNC_FAILED: "vendor_unavailable",
  EVENT_TRANSLATION_FAILED: "mapping",
  UNSUPPORTED: "not_implemented",
  UNSUPPORTED_ARTICLE_MUTATION: "not_implemented",
  NOT_IMPLEMENTED: "not_implemented",
  VENDOR_UNAVAILABLE: "vendor_unavailable",
};

function extractZammadErrorCode(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) {
    return undefined;
  }

  const candidate = body as ZammadApiErrorBody;
  return candidate.error_code ?? candidate.error;
}

function extractZammadErrorMessage(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) {
    return undefined;
  }

  const candidate = body as ZammadApiErrorBody;
  return candidate.message ?? candidate.description ?? candidate.error;
}

function buildZammadOperatorMessage(
  category: IntegrationErrorCategory,
  operation?: string,
): string {
  const op = (operation ?? "").toLowerCase();
  if (op.includes("webhook")) {
    if (category === "not_found") return "Zammad webhook was not found";
    if (category === "validation") return "Zammad webhook configuration is invalid";
    if (category === "rate_limited") return "Zammad webhook rate limit exceeded";
    if (category === "timeout") return "Zammad webhook request timed out";
    return "Zammad webhook operation failed";
  }
  if (op.includes("sync")) {
    if (category === "timeout") return "Zammad synchronisation timed out";
    if (category === "rate_limited") return "Zammad synchronisation rate limit exceeded";
    if (category === "mapping") return "Zammad synchronisation mapping failed";
    return "Zammad synchronisation failed";
  }
  if (op.includes("event") || op.includes("translate")) {
    return "Zammad event translation failed";
  }

  const messages: Record<IntegrationErrorCategory, string> = {
    authentication: "Zammad authentication failed",
    authorization: "Zammad authorization failed",
    validation: "Zammad request validation failed",
    not_found: "Zammad resource was not found",
    conflict: "Zammad request conflict",
    rate_limited: "Zammad rate limit exceeded",
    vendor_unavailable: "Zammad engine is unavailable",
    timeout: "Zammad request timed out",
    mapping: "Zammad entity mapping failed",
    provisioning: "Zammad provisioning failed",
    version_incompatible: "Zammad engine version is incompatible",
    not_implemented: "Zammad operation is not implemented",
    internal: "Zammad integration encountered an internal error",
  };

  return messages[category];
}

function categoryFromStatus(input: VendorErrorInput): IntegrationErrorCategory {
  if (input.statusCode === 401) return "authentication";
  if (input.statusCode === 403) return "authorization";
  if (input.statusCode === 404) return "not_found";
  if (input.statusCode === 409) return "conflict";
  if (input.statusCode === 422 || input.statusCode === 400) return "validation";
  if (input.statusCode === 429) return "rate_limited";
  if (input.statusCode === 501) return "not_implemented";
  if (input.timeout) return "timeout";
  if (input.networkError || (input.statusCode ?? 0) >= 500) return "vendor_unavailable";
  return "internal";
}

export class ZammadVendorErrorMapper implements VendorErrorMapper {
  readonly integrationId = ZAMMAD_INTEGRATION_ID;

  map(input: VendorErrorInput): TranslatedIntegrationError | null {
    const vendorCode = input.vendorCode ?? extractZammadErrorCode(input.body);
    const categoryFromCode = vendorCode
      ? ZAMMAD_ERROR_CODE_CATEGORY[vendorCode]
      : undefined;

    if (
      !categoryFromCode &&
      input.statusCode === undefined &&
      !input.timeout &&
      !input.networkError
    ) {
      return null;
    }

    const resolvedCategory = categoryFromCode ?? categoryFromStatus(input);

    const code = vendorCode
      ? `zammad.${vendorCode.toLowerCase()}`
      : `zammad.${resolvedCategory}.default`;

    const capturedAt = new Date().toISOString();
    const base = buildDefaultTranslatedError(
      {
        ...input,
        vendorCode,
        vendorMessage: input.vendorMessage ?? extractZammadErrorMessage(input.body),
      },
      capturedAt,
      {
        category: resolvedCategory,
        code,
        message: buildZammadOperatorMessage(
          resolvedCategory,
          input.context?.operation,
        ),
      },
    );

    return {
      ...base,
      severity: resolveErrorSeverity(resolvedCategory),
    };
  }
}

export function createZammadVendorErrorMapper(): ZammadVendorErrorMapper {
  return new ZammadVendorErrorMapper();
}

export function mapZammadUnknownError(
  error: unknown,
  context: VendorErrorInput["context"],
): TranslatedIntegrationError {
  const mapper = createZammadVendorErrorMapper();
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
