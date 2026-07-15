/** User-facing Platform Reporting client errors (APZREPORT-002). */

export class ReportingClientError extends Error {
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
    this.name = "ReportingClientError";
    this.code = input.code ?? "REPORTING_CLIENT_ERROR";
    this.correlationId = input.correlationId;
    this.status = input.status;
  }
}

export function toReportingUserMessage(error: unknown): string {
  if (error instanceof ReportingClientError) {
    if (
      error.status === 401 ||
      error.code === "UNAUTHORIZED" ||
      error.code === "unauthorized"
    ) {
      return "You are not authorized to view reporting.";
    }
    if (
      error.status === 403 ||
      error.code === "FORBIDDEN" ||
      error.code === "forbidden"
    ) {
      return "You do not have permission to view this reporting data.";
    }
    if (error.status === 404) {
      return "Reporting data was not found.";
    }
    return error.message || "Unable to load reporting.";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to load reporting.";
}
