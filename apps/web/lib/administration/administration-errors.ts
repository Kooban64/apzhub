/** Administration typed client errors (APZADMIN-003). */

export type AdministrationClientErrorInput = {
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
  readonly correlationId?: string;
  readonly requestId?: string;
};

export class AdministrationClientError extends Error {
  readonly code?: string;
  readonly status?: number;
  readonly correlationId?: string;
  readonly requestId?: string;

  constructor(input: AdministrationClientErrorInput) {
    super(input.message);
    this.name = "AdministrationClientError";
    this.code = input.code;
    this.status = input.status;
    this.correlationId = input.correlationId;
    this.requestId = input.requestId;
  }
}

export function toAdministrationUserMessage(error: unknown): string {
  if (error instanceof AdministrationClientError) return error.message;
  if (error instanceof Error) return error.message;
  return "Administration request failed";
}
