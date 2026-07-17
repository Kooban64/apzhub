/** Observability typed client errors (APZOBSERVE-003). */

export type ObserveClientErrorInput = {
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
  readonly correlationId?: string;
  readonly requestId?: string;
};

export class ObserveClientError extends Error {
  readonly code?: string;
  readonly status?: number;
  readonly correlationId?: string;
  readonly requestId?: string;

  constructor(input: ObserveClientErrorInput) {
    super(input.message);
    this.name = "ObserveClientError";
    this.code = input.code;
    this.status = input.status;
    this.correlationId = input.correlationId;
    this.requestId = input.requestId;
  }
}

export function toObserveUserMessage(error: unknown): string {
  if (error instanceof ObserveClientError) return error.message;
  if (error instanceof Error) return error.message;
  return "Observability request failed";
}
