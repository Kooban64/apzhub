/** Identity typed client errors (APZIDENTITY-003). */

export type IdentityClientErrorInput = {
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
  readonly correlationId?: string;
  readonly requestId?: string;
};

export class IdentityClientError extends Error {
  readonly code?: string;
  readonly status?: number;
  readonly correlationId?: string;
  readonly requestId?: string;

  constructor(input: IdentityClientErrorInput) {
    super(input.message);
    this.name = "IdentityClientError";
    this.code = input.code;
    this.status = input.status;
    this.correlationId = input.correlationId;
    this.requestId = input.requestId;
  }
}

export function toIdentityUserMessage(error: unknown): string {
  if (error instanceof IdentityClientError) return error.message;
  if (error instanceof Error) return error.message;
  return "Identity request failed";
}
