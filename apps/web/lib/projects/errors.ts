/**
 * Safe Projects API error mapping — never leak provider/engine details to UI.
 */

export type ProjectsApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAVAILABLE"
  | "VALIDATION"
  | "UNKNOWN";

const SAFE_MESSAGES: Record<ProjectsApiErrorCode, string> = {
  UNAUTHORIZED: "Sign in is required to continue.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested Projects resource was not found.",
  CONFLICT: "This action conflicts with the current Projects resource state.",
  UNAVAILABLE: "Projects is temporarily unavailable. Try again later.",
  VALIDATION: "The request could not be validated.",
  UNKNOWN: "Something went wrong while contacting Projects.",
};

function mapStatusToCode(status: number): ProjectsApiErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 422) return "VALIDATION";
  if (status === 503 || status === 502 || status === 504) return "UNAVAILABLE";
  return "UNKNOWN";
}

function sanitizeMessage(raw: string | undefined, code: ProjectsApiErrorCode): string {
  if (!raw || typeof raw !== "string") {
    return SAFE_MESSAGES[code];
  }
  const lower = raw.toLowerCase();
  if (
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

export class ProjectsApiError extends Error {
  readonly code: ProjectsApiErrorCode;
  readonly status: number;
  readonly correlationId?: string;
  readonly requestId?: string;

  constructor(options: {
    readonly code: ProjectsApiErrorCode;
    readonly status: number;
    readonly message: string;
    readonly correlationId?: string;
    readonly requestId?: string;
  }) {
    super(options.message);
    this.name = "ProjectsApiError";
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
  }): ProjectsApiError {
    const mapped = mapStatusToCode(options.status);
    const fromBody =
      options.code && typeof options.code === "string"
        ? options.code.toUpperCase()
        : undefined;
    const code: ProjectsApiErrorCode =
      fromBody === "UNAUTHORIZED" ||
      fromBody === "FORBIDDEN" ||
      fromBody === "NOT_FOUND" ||
      fromBody === "CONFLICT" ||
      fromBody === "UNAVAILABLE" ||
      fromBody === "VALIDATION"
        ? fromBody
        : mapped;

    return new ProjectsApiError({
      code,
      status: options.status,
      message: sanitizeMessage(options.message, code),
      correlationId: options.correlationId,
      requestId: options.requestId,
    });
  }
}

export function isProjectsApiError(value: unknown): value is ProjectsApiError {
  return value instanceof ProjectsApiError;
}
