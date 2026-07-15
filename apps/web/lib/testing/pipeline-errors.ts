/**
 * PipelineClientError — mirrors TestingClientError categories for pipeline UX.
 */

export class PipelineClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly correlationId?: string;
  readonly requestId?: string;

  constructor(
    message: string,
    code = "PIPELINE_CLIENT_ERROR",
    status = 400,
    options?: { readonly correlationId?: string; readonly requestId?: string },
  ) {
    super(message);
    this.name = "PipelineClientError";
    this.code = code;
    this.status = status;
    if (options?.correlationId !== undefined) {
      this.correlationId = options.correlationId;
    }
    if (options?.requestId !== undefined) {
      this.requestId = options.requestId;
    }
  }

  static fromHttp(input: {
    readonly status: number;
    readonly message?: string;
    readonly code?: string;
    readonly correlationId?: string;
    readonly requestId?: string;
  }): PipelineClientError {
    const status = input.status;
    let code = input.code ?? "PIPELINE_HTTP_ERROR";
    if (!input.code) {
      if (status === 401) code = "unauthorized";
      else if (status === 404) code = "not_found";
      else if (status === 429) code = "rate_limited";
      else if (status === 408 || status === 504) code = "timeout";
      else if (status === 502 || status === 503) code = "provider_unavailable";
    }
    return new PipelineClientError(
      input.message ?? "Unable to load Pipeline data.",
      code,
      status,
      {
        correlationId: input.correlationId,
        requestId: input.requestId,
      },
    );
  }
}

export function isPipelineClientError(error: unknown): error is PipelineClientError {
  return error instanceof PipelineClientError;
}

export function toPipelineUserMessage(error: unknown): string {
  if (isPipelineClientError(error)) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Unable to load Pipeline data.";
}
