/** Configuration typed client errors (APZCONFIG-003). */

export type ConfigurationClientErrorInput = {
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
  readonly correlationId?: string;
  readonly requestId?: string;
};

export class ConfigurationClientError extends Error {
  readonly code?: string;
  readonly status?: number;
  readonly correlationId?: string;
  readonly requestId?: string;

  constructor(input: ConfigurationClientErrorInput) {
    super(input.message);
    this.name = "ConfigurationClientError";
    this.code = input.code;
    this.status = input.status;
    this.correlationId = input.correlationId;
    this.requestId = input.requestId;
  }
}

export function toConfigurationUserMessage(error: unknown): string {
  if (error instanceof ConfigurationClientError) return error.message;
  if (error instanceof Error) return error.message;
  return "Configuration request failed";
}
