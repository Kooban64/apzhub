import type { BuildLawApiAuthenticatedContextOptions } from "../context/build-authenticated-context";

export interface LawApiResourcePermissions {
  readonly view: string;
  readonly create: string;
  readonly edit: string;
  readonly delete: string;
}

export interface LawApiResourceAuthPresets {
  readonly collection: BuildLawApiAuthenticatedContextOptions;
  readonly list: BuildLawApiAuthenticatedContextOptions;
  readonly read: BuildLawApiAuthenticatedContextOptions;
  readonly create: BuildLawApiAuthenticatedContextOptions;
  readonly update: BuildLawApiAuthenticatedContextOptions;
  readonly delete: BuildLawApiAuthenticatedContextOptions;
}

const BASE_AUTH: BuildLawApiAuthenticatedContextOptions = {
  requireAuth: true,
  requireTenant: true,
};

/** Define standard auth presets for a Law API resource from permission strings. */
export function defineResourceAuth(
  permissions: LawApiResourcePermissions,
): LawApiResourceAuthPresets {
  return {
    collection: BASE_AUTH,
    list: { ...BASE_AUTH, requiredPermission: permissions.view },
    read: { ...BASE_AUTH, requiredPermission: permissions.view },
    create: { ...BASE_AUTH, requiredPermission: permissions.create },
    update: { ...BASE_AUTH, requiredPermission: permissions.edit },
    delete: { ...BASE_AUTH, requiredPermission: permissions.delete },
  };
}
