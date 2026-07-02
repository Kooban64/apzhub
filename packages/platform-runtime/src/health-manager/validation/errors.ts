export type HealthErrorCode =
  | "HEALTH_PROVIDER_NOT_FOUND"
  | "HEALTH_PROVIDER_DUPLICATE"
  | "HEALTH_PROVIDER_FAILED"
  | "HEALTH_CHECK_NOT_RUN"
  | "HEALTH_INVALID_INPUT";

export interface HealthError {
  readonly code: HealthErrorCode;
  readonly message: string;
  readonly providerId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export function healthError(
  code: HealthErrorCode,
  message: string,
  options: { providerId?: string; metadata?: Record<string, unknown> } = {},
): HealthError {
  return {
    code,
    message,
    providerId: options.providerId,
    metadata: options.metadata,
  };
}
