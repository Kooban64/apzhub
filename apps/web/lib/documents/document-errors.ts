/** User-facing Platform Document client errors (APZDOCS-004). */

export class DocumentClientError extends Error {
  readonly code: string;
  readonly correlationId?: string;
  readonly status?: number;

  constructor(input: {
    readonly message: string;
    readonly code?: string;
    readonly correlationId?: string;
    readonly status?: number;
  }) {
    super(input.message);
    this.name = "DocumentClientError";
    this.code = input.code ?? "DOCUMENT_CLIENT_ERROR";
    this.correlationId = input.correlationId;
    this.status = input.status;
  }
}

export function toDocumentUserMessage(error: unknown): string {
  if (error instanceof DocumentClientError) {
    if (error.status === 401 || error.code === "UNAUTHORIZED") {
      return "You are not authorized to access documents.";
    }
    if (error.status === 403 || error.code === "FORBIDDEN") {
      return "You do not have permission for this document operation.";
    }
    if (error.status === 404) {
      return "Document was not found.";
    }
    return error.message || "Unable to complete document request.";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to complete document request.";
}
