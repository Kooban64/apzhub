/**
 * Safe Workflow API error mapping — never leak n8n/provider details to UI.
 */

export type WorkflowApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAVAILABLE"
  | "VALIDATION"
  | "UNKNOWN";

const SAFE_MESSAGES: Record<WorkflowApiErrorCode, string> = {
  UNAUTHORIZED: "Sign in is required to continue.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested Workflow resource was not found.",
  CONFLICT: "This action conflicts with the current Workflow resource state.",
  UNAVAILABLE: "Workflow is temporarily unavailable. Try again later.",
  VALIDATION: "The request could not be validated.",
  UNKNOWN: "Something went wrong while contacting Workflow.",
};

function mapStatusToCode(status: number): WorkflowApiErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 422) return "VALIDATION";
  if (status === 503 || status === 502 || status === 504) return "UNAVAILABLE";
  return "UNKNOWN";
}

function sanitizeMessage(raw: string | undefined, code: WorkflowApiErrorCode): string {
  if (!raw || typeof raw !== "string") {
    return SAFE_MESSAGES[code];
  }
  const lower = raw.toLowerCase();
  if (
    lower.includes("n8n") ||
    lower.includes("provider") ||
    lower.includes("adapter") ||
    lower.includes("engine") ||
    lower.includes("upstream") ||
    lower.includes("x-n8n") ||
    lower.includes("api-key")
  ) {
    return SAFE_MESSAGES[code];
  }
  return raw.slice(0, 500);
}

export class WorkflowApiError extends Error {
  readonly code: WorkflowApiErrorCode;
  readonly status: number;
  readonly correlationId?: string;
  readonly requestId?: string;

  constructor(options: {
    readonly code: WorkflowApiErrorCode;
    readonly status: number;
    readonly message?: string;
    readonly correlationId?: string;
    readonly requestId?: string;
  }) {
    super(sanitizeMessage(options.message, options.code));
    this.name = "WorkflowApiError";
    this.code = options.code;
    this.status = options.status;
    this.correlationId = options.correlationId;
    this.requestId = options.requestId;
  }

  static fromHttp(input: {
    readonly status: number;
    readonly message?: string;
    readonly code?: string;
    readonly correlationId?: string;
    readonly requestId?: string;
  }): WorkflowApiError {
    return new WorkflowApiError({
      code: mapStatusToCode(input.status),
      status: input.status,
      message: input.message,
      correlationId: input.correlationId,
      requestId: input.requestId,
    });
  }
}

export function isWorkflowApiError(error: unknown): error is WorkflowApiError {
  return error instanceof WorkflowApiError;
}
