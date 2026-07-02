export type RegistryErrorCode =
  | "REGISTRY_DUPLICATE_ID"
  | "REGISTRY_INVALID_LIFECYCLE"
  | "REGISTRY_MANIFEST_INVALID"
  | "REGISTRY_VERSION_INCOMPATIBLE"
  | "REGISTRY_NOT_FOUND"
  | "REGISTRY_INVALID_INPUT";

export interface RegistryError {
  readonly code: RegistryErrorCode;
  readonly message: string;
  readonly capabilityId?: string;
  readonly field?: string;
}

export function registryError(
  code: RegistryErrorCode,
  message: string,
  details: Omit<RegistryError, "code" | "message"> = {},
): RegistryError {
  return { code, message, ...details };
}
