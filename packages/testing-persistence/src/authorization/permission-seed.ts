import { APZ_TCMS_PERMISSIONS } from "@apzhub/testing-contracts";

/** Permission keys suitable for AuthorizationService.registerPermission. */
export const TESTING_PERMISSION_SEED_KEYS = [
  "testing.*",
  "certification.*",
  "evidence.*",
  "traceability.*",
  "automation.*",
  "pipeline.*",
  "reporting.*",
  "report.*",
  "approval.*",
  "dashboard.*",
  "quality.*",
  "analytics.*",
  "engineering.*",
  "benchmark.*",
  "trend.*",
  "coverage.*",
  "defects.*",
  "release.*",
  "administration.*",
  ...APZ_TCMS_PERMISSIONS,
] as const;

export type TestingPermissionSeedKey = (typeof TESTING_PERMISSION_SEED_KEYS)[number];

export function listTestingPermissionSeedKeys(): readonly string[] {
  return [...new Set(TESTING_PERMISSION_SEED_KEYS)];
}

export interface PermissionRegistrationTarget {
  registerPermission(input: { permissionKey: string; description?: string }): void;
}

/** Register TCMS permission catalogue with a platform AuthorizationService. */
export function seedTestingPermissions(service: PermissionRegistrationTarget): void {
  for (const permissionKey of listTestingPermissionSeedKeys()) {
    service.registerPermission({
      permissionKey,
      description: `APZ TCMS permission ${permissionKey}`,
    });
  }
}
