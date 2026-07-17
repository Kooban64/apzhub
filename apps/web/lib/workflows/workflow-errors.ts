/** User-facing Platform Workflow client errors (APZWORKFLOW-003). */

export class WorkflowClientError extends Error {
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
    this.name = "WorkflowClientError";
    this.code = input.code ?? "WORKFLOW_CLIENT_ERROR";
    this.correlationId = input.correlationId;
    this.status = input.status;
  }
}

export function toWorkflowUserMessage(error: unknown): string {
  if (error instanceof WorkflowClientError) {
    if (error.status === 401 || error.code === "UNAUTHORIZED") {
      return "You are not authorized to access workflows.";
    }
    if (error.status === 403 || error.code === "FORBIDDEN") {
      return "You do not have permission for this workflow operation.";
    }
    if (error.status === 404) {
      return "Workflow was not found.";
    }
    if (error.status === 503 || error.code === "WORKFLOW_SERVICE_UNAVAILABLE") {
      return "Workflow Platform is temporarily unavailable.";
    }
    return error.message || "Unable to complete workflow request.";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to complete workflow request.";
}
