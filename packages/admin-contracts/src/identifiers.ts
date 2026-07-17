/** Branded platform identifiers for Administration Platform entities (APZADMIN-001). */

declare const brand: unique symbol;

type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

export type AdministrationModuleId = Brand<string, "AdministrationModuleId">;
export type AdministrationCategoryId = Brand<string, "AdministrationCategoryId">;
export type AdministrationSectionId = Brand<string, "AdministrationSectionId">;
export type AdministrationActionId = Brand<string, "AdministrationActionId">;
export type AdministrationPermissionId = Brand<
  string,
  "AdministrationPermissionId"
>;
export type AdministrationAuditId = Brand<string, "AdministrationAuditId">;
export type AdministrationHistoryId = Brand<string, "AdministrationHistoryId">;
export type AdministrationDiagnosticId = Brand<
  string,
  "AdministrationDiagnosticId"
>;
export type AdministrationRegistrationId = Brand<
  string,
  "AdministrationRegistrationId"
>;
export type AdministrationMetadataId = Brand<
  string,
  "AdministrationMetadataId"
>;
export type AdministrationPolicyId = Brand<string, "AdministrationPolicyId">;
export type AdministrationReferenceId = Brand<
  string,
  "AdministrationReferenceId"
>;
export type AdministrationCapabilityId = Brand<
  string,
  "AdministrationCapabilityId"
>;
export type AdministrationNavigationId = Brand<
  string,
  "AdministrationNavigationId"
>;
export type AdministrationShortcutId = Brand<
  string,
  "AdministrationShortcutId"
>;
export type AdministrationDashboardId = Brand<
  string,
  "AdministrationDashboardId"
>;
export type AdministrationWidgetId = Brand<string, "AdministrationWidgetId">;

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

export function isPlatformAdminIdShape(value: string): boolean {
  return ID_PATTERN.test(value);
}

function brandId<T extends string>(value: string): T {
  if (!isPlatformAdminIdShape(value)) {
    throw new Error(`Invalid platform admin identifier shape: ${value}`);
  }
  return value as T;
}

export function asAdministrationModuleId(value: string): AdministrationModuleId {
  return brandId(value);
}
export function asAdministrationCategoryId(
  value: string,
): AdministrationCategoryId {
  return brandId(value);
}
export function asAdministrationSectionId(
  value: string,
): AdministrationSectionId {
  return brandId(value);
}
export function asAdministrationActionId(value: string): AdministrationActionId {
  return brandId(value);
}
export function asAdministrationPermissionId(
  value: string,
): AdministrationPermissionId {
  return brandId(value);
}
export function asAdministrationAuditId(value: string): AdministrationAuditId {
  return brandId(value);
}
export function asAdministrationHistoryId(
  value: string,
): AdministrationHistoryId {
  return brandId(value);
}
export function asAdministrationDiagnosticId(
  value: string,
): AdministrationDiagnosticId {
  return brandId(value);
}
export function asAdministrationRegistrationId(
  value: string,
): AdministrationRegistrationId {
  return brandId(value);
}
export function asAdministrationMetadataId(
  value: string,
): AdministrationMetadataId {
  return brandId(value);
}
export function asAdministrationPolicyId(value: string): AdministrationPolicyId {
  return brandId(value);
}
export function asAdministrationReferenceId(
  value: string,
): AdministrationReferenceId {
  return brandId(value);
}
export function asAdministrationCapabilityId(
  value: string,
): AdministrationCapabilityId {
  return brandId(value);
}
export function asAdministrationNavigationId(
  value: string,
): AdministrationNavigationId {
  return brandId(value);
}
export function asAdministrationShortcutId(
  value: string,
): AdministrationShortcutId {
  return brandId(value);
}
export function asAdministrationDashboardId(
  value: string,
): AdministrationDashboardId {
  return brandId(value);
}
export function asAdministrationWidgetId(value: string): AdministrationWidgetId {
  return brandId(value);
}
