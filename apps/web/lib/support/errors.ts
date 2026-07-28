/**
 * Safe Support API error mapping — never leak provider/engine details to UI.
 */

export type SupportApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAVAILABLE"
  | "VALIDATION"
  | "UNKNOWN";

const SAFE_MESSAGES: Record<SupportApiErrorCode, string> = {
  UNAUTHORIZED: "Sign in is required to continue.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested Support resource was not found.",
  CONFLICT: "This action conflicts with the current Support resource state.",
  UNAVAILABLE: "Support is temporarily unavailable. Try again later.",
  VALIDATION: "The request could not be validated.",
  UNKNOWN: "Something went wrong while contacting Support.",
};

function mapStatusToCode(status: number): SupportApiErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 422) return "VALIDATION";
  if (status === 503 || status === 502 || status === 504) return "UNAVAILABLE";
  return "UNKNOWN";
}

function sanitizeMessage(raw: string | undefined, code: SupportApiErrorCode): string {
  if (!raw || typeof raw !== "string") {
    return SAFE_MESSAGES[code];
  }
  const lower = raw.toLowerCase();
  if (
    lower.includes("zammad") ||
    lower.includes("provider") ||
    lower.includes("adapter") ||
    lower.includes("engine") ||
    lower.includes("upstream") ||
    lower.includes("stack")
  ) {
    return SAFE_MESSAGES[code];
  }
  return raw.slice(0, 500);
}

export class SupportApiError extends Error {
  readonly code: SupportApiErrorCode;
  readonly status: number;
  readonly correlationId?: string;
  readonly requestId?: string;

  constructor(options: {
    readonly code: SupportApiErrorCode;
    readonly status: number;
    readonly message: string;
    readonly correlationId?: string;
    readonly requestId?: string;
  }) {
    super(options.message);
    this.name = "SupportApiError";
    this.code = options.code;
    this.status = options.status;
    this.correlationId = options.correlationId;
    this.requestId = options.requestId;
  }

  static fromHttp(options: {
    readonly status: number;
    readonly message?: string;
    readonly code?: string;
    readonly correlationId?: string;
    readonly requestId?: string;
  }): SupportApiError {
    const mapped = mapStatusToCode(options.status);
    const fromBody =
      options.code && typeof options.code === "string"
        ? options.code.toUpperCase()
        : undefined;
    const code: SupportApiErrorCode =
      fromBody === "UNAUTHORIZED" ||
      fromBody === "FORBIDDEN" ||
      fromBody === "NOT_FOUND" ||
      fromBody === "CONFLICT" ||
      fromBody === "UNAVAILABLE" ||
      fromBody === "VALIDATION"
        ? fromBody
        : mapped;

    return new SupportApiError({
      code,
      status: options.status,
      message: sanitizeMessage(options.message, code),
      correlationId: options.correlationId,
      requestId: options.requestId,
    });
  }
}

export function isSupportApiError(value: unknown): value is SupportApiError {
  return value instanceof SupportApiError;
}

/** Terminal Support errors must not be auto-retried (safe error UI must surface promptly). */
const NON_RETRYABLE_SUPPORT_CODES: ReadonlySet<SupportApiErrorCode> = new Set([
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "UNAVAILABLE",
  "VALIDATION",
  "CONFLICT",
]);

/**
 * TanStack Query `retry` predicate for Support reads.
 * Transient/unknown failures may retry once; terminal API codes never retry.
 */
export function shouldRetrySupportQuery(failureCount: number, error: unknown): boolean {
  if (isSupportApiError(error) && NON_RETRYABLE_SUPPORT_CODES.has(error.code)) {
    return false;
  }
  return failureCount < 1;
}
