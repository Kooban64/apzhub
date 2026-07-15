/** User-facing Engineering Intelligence client errors (APZTCMS-022). */

export class EngineeringIntelligenceClientError extends Error {
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
    this.name = "EngineeringIntelligenceClientError";
    this.code = input.code ?? "ENGINEERING_INTELLIGENCE_CLIENT_ERROR";
    this.correlationId = input.correlationId;
    this.status = input.status;
  }
}

export function toEngineeringIntelligenceUserMessage(error: unknown): string {
  if (error instanceof EngineeringIntelligenceClientError) {
    if (
      error.status === 401 ||
      error.code === "UNAUTHORIZED" ||
      error.code === "unauthorized"
    ) {
      return "You are not authorized to view engineering intelligence.";
    }
    if (
      error.status === 403 ||
      error.code === "FORBIDDEN" ||
      error.code === "forbidden"
    ) {
      return "You do not have permission to view this engineering intelligence data.";
    }
    if (error.status === 404) {
      return "Engineering intelligence data was not found.";
    }
    return error.message || "Unable to load engineering intelligence.";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to load engineering intelligence.";
}
