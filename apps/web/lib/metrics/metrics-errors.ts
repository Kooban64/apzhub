/** Platform Metrics typed client errors (APZMETRICS-003). */

export class MetricsClientError extends Error {
  readonly code?: string;
  readonly status: number;
  readonly correlationId?: string;
  readonly requestId?: string;

  constructor(input: {
    readonly message: string;
    readonly code?: string;
    readonly status: number;
    readonly correlationId?: string;
    readonly requestId?: string;
  }) {
    super(input.message);
    this.name = "MetricsClientError";
    this.code = input.code;
    this.status = input.status;
    this.correlationId = input.correlationId;
    this.requestId = input.requestId;
  }
}

export function toMetricsUserMessage(error: unknown): string {
  if (error instanceof MetricsClientError) {
    if (error.code === "METRICS_SERVICE_UNAVAILABLE") {
      return "Platform Metrics is not available.";
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Metrics request failed";
}
