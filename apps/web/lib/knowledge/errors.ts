/**
 * Safe Knowledge API error mapping — never leak backend engine details to UI.
 */

export type KnowledgeApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNAVAILABLE"
  | "VALIDATION"
  | "UNKNOWN";

const SAFE_MESSAGES: Record<KnowledgeApiErrorCode, string> = {
  UNAUTHORIZED: "Sign in is required to continue.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested Knowledge resource was not found.",
  CONFLICT: "This action conflicts with the current Knowledge resource state.",
  UNAVAILABLE: "Knowledge is temporarily unavailable. Try again later.",
  VALIDATION: "The request could not be validated.",
  UNKNOWN: "Something went wrong while contacting Knowledge.",
};

function mapStatusToCode(status: number): KnowledgeApiErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 409) return "CONFLICT";
  if (status === 422) return "VALIDATION";
  if (status === 503 || status === 502 || status === 504) return "UNAVAILABLE";
  return "UNKNOWN";
}

function sanitizeMessage(raw: string | undefined, code: KnowledgeApiErrorCode): string {
  if (!raw || typeof raw !== "string") {
    return SAFE_MESSAGES[code];
  }
  const lower = raw.toLowerCase();
  if (
    lower.includes("wiki") ||
    lower.includes("confluence") ||
    lower.includes("sharepoint") ||
    lower.includes("stack trace")
  ) {
    return SAFE_MESSAGES[code];
  }
  if (raw.length > 240) return SAFE_MESSAGES[code];
  return raw;
}

export class KnowledgeApiError extends Error {
  readonly code: KnowledgeApiErrorCode;
  readonly status: number;

  constructor(args: {
    readonly code: KnowledgeApiErrorCode;
    readonly status: number;
    readonly message: string;
  }) {
    super(args.message);
    this.name = "KnowledgeApiError";
    this.code = args.code;
    this.status = args.status;
  }

  static fromHttp(args: {
    readonly status: number;
    readonly message?: string;
    readonly code?: string;
  }): KnowledgeApiError {
    const code = mapStatusToCode(args.status);
    return new KnowledgeApiError({
      code,
      status: args.status,
      message: sanitizeMessage(args.message, code),
    });
  }
}

export function isKnowledgeApiError(error: unknown): error is KnowledgeApiError {
  return error instanceof KnowledgeApiError;
}
