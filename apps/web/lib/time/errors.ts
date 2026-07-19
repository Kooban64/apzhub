/**
 * Safe Time API error mapping — never leak provider/engine details to UI.
 */

export type TimeApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAVAILABLE"
  | "VALIDATION"
  | "UNKNOWN";

const SAFE_MESSAGES: Record<TimeApiErrorCode, string> = {
  UNAUTHORIZED: "Sign in is required to continue.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested Time resource was not found.",
  CONFLICT: "This action conflicts with the current Time resource state.",
  UNAVAILABLE: "Time is temporarily unavailable. Try again later.",
  VALIDATION: "The request could not be validated.",
  UNKNOWN: "Something went wrong while contacting Time.",
};

function mapStatusToCode(status: number): TimeApiErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 422) return "VALIDATION";
  if (status === 503 || status === 502 || status === 504) return "UNAVAILABLE";
  return "UNKNOWN";
}

function sanitizeMessage(raw: string | undefined, code: TimeApiErrorCode): string {
  if (!raw || typeof raw !== "string") {
    return SAFE_MESSAGES[code];
  }
  const lower = raw.toLowerCase();
  if (
    lower.includes("kimai") ||
    lower.includes("plane") ||
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

export class TimeApiError extends Error {
  readonly code: TimeApiErrorCode;
  readonly status: number;
  readonly correlationId?: string;
  readonly requestId?: string;

  constructor(options: {
    readonly code: TimeApiErrorCode;
    readonly status: number;
    readonly message: string;
    readonly correlationId?: string;
    readonly requestId?: string;
  }) {
    super(options.message);
    this.name = "TimeApiError";
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
  }): TimeApiError {
    const mapped = mapStatusToCode(options.status);
    const fromBody =
      options.code && typeof options.code === "string"
        ? options.code.toUpperCase()
        : undefined;
    const code: TimeApiErrorCode =
      fromBody === "UNAUTHORIZED" ||
      fromBody === "FORBIDDEN" ||
      fromBody === "NOT_FOUND" ||
      fromBody === "CONFLICT" ||
      fromBody === "UNAVAILABLE" ||
      fromBody === "VALIDATION"
        ? fromBody
        : mapped;

    return new TimeApiError({
      code,
      status: options.status,
      message: sanitizeMessage(options.message, code),
      correlationId: options.correlationId,
      requestId: options.requestId,
    });
  }
}

export function isTimeApiError(value: unknown): value is TimeApiError {
  return value instanceof TimeApiError;
}
