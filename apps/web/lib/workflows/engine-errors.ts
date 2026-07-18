/** Canonical Workflow Engine client errors (APZWORKFLOW-008). */

export class WorkflowEngineClientError extends Error {
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
    this.name = "WorkflowEngineClientError";
    this.code = input.code ?? "WORKFLOW_ENGINE_CLIENT_ERROR";
    this.correlationId = input.correlationId;
    this.status = input.status;
  }
}

export function toWorkflowEngineUserMessage(error: unknown): string {
  if (error instanceof WorkflowEngineClientError) {
    if (error.status === 401 || error.code === "UNAUTHORIZED") {
      return "You are not authorized to access the workflow engine.";
    }
    if (error.status === 403 || error.code === "FORBIDDEN") {
      return "You do not have permission for this workflow engine operation.";
    }
    if (error.status === 404) {
      return "Workflow engine resource was not found.";
    }
    if (error.status === 501 || error.code === "PROVIDER_CAPABILITY_UNSUPPORTED") {
      return "This workflow engine operation is not supported.";
    }
    if (error.status === 503 || error.code === "WORKFLOW_SERVICE_UNAVAILABLE") {
      return "Workflow engine is temporarily unavailable.";
    }
    return error.message || "Unable to complete workflow engine request.";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unable to complete workflow engine request.";
}
