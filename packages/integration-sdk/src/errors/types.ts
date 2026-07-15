export type IntegrationErrorCategory =
  | "authentication"
  | "authorization"
  | "validation"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "vendor_unavailable"
  | "timeout"
  | "mapping"
  | "provisioning"
  | "version_incompatible"
  | "not_implemented"
  | "internal";

/** Platform-typed integration error — vendor details never exposed beyond adapter boundary. */
export interface IntegrationError {
  readonly category: IntegrationErrorCategory;
  readonly code: string;
  readonly message: string;
  readonly retryable: boolean;
  readonly correlationId: string;
  readonly vendorStatusCode?: number;
  readonly details?: Readonly<Record<string, string>>;
}

export class IntegrationSdkError extends Error {
  readonly integrationError: IntegrationError;

  constructor(integrationError: IntegrationError) {
    super(integrationError.message);
    this.name = "IntegrationSdkError";
    this.integrationError = integrationError;
  }
}
