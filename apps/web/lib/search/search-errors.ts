/** User-facing Platform Search client errors (APZSEARCH-007). */

export class SearchClientError extends Error {
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
    this.name = "SearchClientError";
    this.code = input.code ?? "SEARCH_CLIENT_ERROR";
    this.correlationId = input.correlationId;
    this.status = input.status;
  }
}

export function toSearchUserMessage(error: unknown): string {
  if (error instanceof SearchClientError) {
    if (error.status === 401 || error.code === "UNAUTHORIZED") {
      return "You are not authorized to access search.";
    }
    if (error.status === 403 || error.code === "FORBIDDEN") {
      return "You do not have permission for this search operation.";
    }
    if (error.status === 404) {
      return "Search resource was not found.";
    }
    return error.message || "Unable to complete search request.";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to complete search request.";
}
