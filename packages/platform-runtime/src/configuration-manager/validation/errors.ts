export type ConfigurationErrorCode =
  | "CONFIG_MISSING_REQUIRED"
  | "CONFIG_INVALID_TYPE"
  | "CONFIG_INVALID_RANGE"
  | "CONFIG_INVALID_ENUM"
  | "CONFIG_INVALID_VERSION"
  | "CONFIG_UNKNOWN_KEY"
  | "CONFIG_NOT_LOADED";

export interface ConfigurationError {
  readonly code: ConfigurationErrorCode;
  readonly message: string;
  readonly key?: string;
  readonly value?: unknown;
  readonly expected?: string;
}

export function configurationError(
  code: ConfigurationErrorCode,
  message: string,
  details: Omit<ConfigurationError, "code" | "message"> = {},
): ConfigurationError {
  return { code, message, ...details };
}
