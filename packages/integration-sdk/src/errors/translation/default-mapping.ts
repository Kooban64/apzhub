import { createIntegrationError } from "../factory";
import type { IntegrationErrorCategory } from "../types";
import { resolveErrorSeverity, shouldTripCircuitBreaker } from "./severity";
import type {
  ErrorTranslationContext,
  TranslatedIntegrationError,
  VendorErrorDiagnostics,
  VendorErrorInput,
} from "./types";

const DEFAULT_STATUS_CATEGORY: Readonly<Record<number, IntegrationErrorCategory>> = {
  400: "validation",
  401: "authentication",
  403: "authorization",
  404: "not_found",
  409: "conflict",
  422: "validation",
  429: "rate_limited",
  502: "vendor_unavailable",
  503: "vendor_unavailable",
  504: "timeout",
};

const RETRYABLE_CATEGORIES = new Set<IntegrationErrorCategory>([
  "rate_limited",
  "vendor_unavailable",
  "timeout",
]);

export function sanitizeVendorMessageSummary(
  message: string | undefined,
  maxLength = 256,
): string | undefined {
  if (!message?.trim()) {
    return undefined;
  }

  return message
    .trim()
    .slice(0, maxLength)
    .replace(/[^\u0020-\u007E]/g, " ");
}

export function buildVendorErrorDiagnostics(
  input: VendorErrorInput,
  capturedAt: string,
): VendorErrorDiagnostics | undefined {
  const vendorMessageSummary = sanitizeVendorMessageSummary(input.vendorMessage);

  if (
    input.statusCode === undefined &&
    input.vendorCode === undefined &&
    vendorMessageSummary === undefined
  ) {
    return undefined;
  }

  return {
    vendorStatusCode: input.statusCode,
    vendorCode: input.vendorCode,
    vendorMessageSummary,
    capturedAt,
    correlationId: input.context.correlationId,
  };
}

export function resolveCategoryFromInput(input: VendorErrorInput): IntegrationErrorCategory {
  if (input.timeout) {
    return "timeout";
  }

  if (input.networkError) {
    return "vendor_unavailable";
  }

  if (input.statusCode !== undefined) {
    return DEFAULT_STATUS_CATEGORY[input.statusCode] ?? "internal";
  }

  return "internal";
}

export function isRetryableCategory(category: IntegrationErrorCategory): boolean {
  return RETRYABLE_CATEGORIES.has(category);
}

export function buildDefaultTranslatedError(
  input: VendorErrorInput,
  capturedAt: string,
  overrides?: {
    readonly category?: IntegrationErrorCategory;
    readonly code?: string;
    readonly message?: string;
    readonly retryable?: boolean;
  },
): TranslatedIntegrationError {
  const category = overrides?.category ?? resolveCategoryFromInput(input);
  const code =
    overrides?.code ??
    (input.vendorCode
      ? `${input.context.integrationId}.vendor.${input.vendorCode}`
      : `integration.${category}.default`);
  const message =
    overrides?.message ?? buildOperatorSafeMessage(category, input.context.integrationId);

  const error = createIntegrationError({
    category,
    code,
    message,
    correlationId: input.context.correlationId,
    retryable: overrides?.retryable ?? isRetryableCategory(category),
    vendorStatusCode: input.statusCode,
    details: buildSafeDetails(input),
  });

  return {
    error,
    severity: resolveErrorSeverity(category),
    vendorDiagnostics: buildVendorErrorDiagnostics(input, capturedAt),
  };
}

function buildOperatorSafeMessage(
  category: IntegrationErrorCategory,
  integrationId: string,
): string {
  const messages: Record<IntegrationErrorCategory, string> = {
    authentication: "Integration authentication failed",
    authorization: "Integration authorization failed",
    validation: "Integration request validation failed",
    not_found: "Requested integration resource was not found",
    conflict: "Integration request conflict",
    rate_limited: "Integration rate limit exceeded",
    vendor_unavailable: "Integration engine is unavailable",
    timeout: "Integration request timed out",
    mapping: "Integration entity mapping failed",
    provisioning: "Integration provisioning failed",
    version_incompatible: "Integration engine version is incompatible",
    not_implemented: "Integration operation is not implemented",
    internal: "Integration encountered an internal error",
  };

  return `${messages[category]} (${integrationId})`;
}

function buildSafeDetails(
  input: VendorErrorInput,
): Readonly<Record<string, string>> | undefined {
  const details: Record<string, string> = {};

  if (input.context.operation) {
    details.operation = input.context.operation;
  }

  if (input.context.adapterId) {
    details.adapterId = input.context.adapterId;
  }

  if (input.vendorCode) {
    details.vendorCode = input.vendorCode;
  }

  return Object.keys(details).length > 0 ? details : undefined;
}

export function normalizeUnknownError(
  error: unknown,
  context: ErrorTranslationContext,
): VendorErrorInput {
  if (isVendorErrorInput(error)) {
    return {
      ...error,
      context: { ...error.context, ...context },
    };
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as Record<string, unknown>;
    const statusCode =
      typeof candidate.statusCode === "number"
        ? candidate.statusCode
        : typeof candidate.status === "number"
          ? candidate.status
          : undefined;

    return {
      statusCode,
      vendorCode: typeof candidate.code === "string" ? candidate.code : undefined,
      vendorMessage:
        typeof candidate.message === "string"
          ? candidate.message
          : error instanceof Error
            ? error.message
            : undefined,
      context,
      timeout: candidate.timeout === true || candidate.name === "TimeoutError",
      networkError: candidate.networkError === true || candidate.code === "ECONNREFUSED",
    };
  }

  return {
    vendorMessage: error instanceof Error ? error.message : String(error),
    context,
  };
}

function isVendorErrorInput(value: unknown): value is VendorErrorInput {
  return (
    typeof value === "object" &&
    value !== null &&
    "context" in value &&
    typeof (value as VendorErrorInput).context?.correlationId === "string"
  );
}

export { shouldTripCircuitBreaker };
