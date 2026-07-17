/** Branded platform identifiers for Configuration Platform entities (APZCONFIG-001). */

declare const brand: unique symbol;

type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

export type ConfigurationId = Brand<string, "ConfigurationId">;
export type ConfigurationValueId = Brand<string, "ConfigurationValueId">;
export type ConfigurationKeyId = Brand<string, "ConfigurationKeyId">;
export type ConfigurationNamespaceId = Brand<string, "ConfigurationNamespaceId">;
export type ConfigurationGroupId = Brand<string, "ConfigurationGroupId">;
export type ConfigurationVersionId = Brand<string, "ConfigurationVersionId">;
export type ConfigurationOverrideId = Brand<string, "ConfigurationOverrideId">;
export type ConfigurationValidationId = Brand<
  string,
  "ConfigurationValidationId"
>;
export type ConfigurationAuditId = Brand<string, "ConfigurationAuditId">;
export type ConfigurationHistoryId = Brand<string, "ConfigurationHistoryId">;
export type ConfigurationReferenceId = Brand<
  string,
  "ConfigurationReferenceId"
>;
export type ConfigurationMetadataId = Brand<string, "ConfigurationMetadataId">;

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

export function isPlatformConfigurationIdShape(value: string): boolean {
  return ID_PATTERN.test(value);
}

function brandId<T extends string>(value: string): T {
  if (!isPlatformConfigurationIdShape(value)) {
    throw new Error(
      `Invalid platform configuration identifier shape: ${value}`,
    );
  }
  return value as T;
}

export function asConfigurationId(value: string): ConfigurationId {
  return brandId(value);
}
export function asConfigurationValueId(value: string): ConfigurationValueId {
  return brandId(value);
}
export function asConfigurationKeyId(value: string): ConfigurationKeyId {
  return brandId(value);
}
export function asConfigurationNamespaceId(
  value: string,
): ConfigurationNamespaceId {
  return brandId(value);
}
export function asConfigurationGroupId(value: string): ConfigurationGroupId {
  return brandId(value);
}
export function asConfigurationVersionId(
  value: string,
): ConfigurationVersionId {
  return brandId(value);
}
export function asConfigurationOverrideId(
  value: string,
): ConfigurationOverrideId {
  return brandId(value);
}
export function asConfigurationValidationId(
  value: string,
): ConfigurationValidationId {
  return brandId(value);
}
export function asConfigurationAuditId(value: string): ConfigurationAuditId {
  return brandId(value);
}
export function asConfigurationHistoryId(
  value: string,
): ConfigurationHistoryId {
  return brandId(value);
}
export function asConfigurationReferenceId(
  value: string,
): ConfigurationReferenceId {
  return brandId(value);
}
export function asConfigurationMetadataId(
  value: string,
): ConfigurationMetadataId {
  return brandId(value);
}
