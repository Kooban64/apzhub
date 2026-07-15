import { APZ_TCMS_PERMISSIONS, type ApzTcmsPermission } from "@apzhub/testing-contracts";
import {
  PLATFORM_DOCUMENT_PERMISSIONS,
  type PlatformDocumentPermission,
} from "@apzhub/document-contracts";
import {
  PLATFORM_SEARCH_PERMISSIONS,
  type PlatformSearchPermission,
} from "@apzhub/search-contracts";

/**
 * Platform permission catalogue for gateway-exposed capabilities (OSS-110-06 / OSS-110-08).
 *
 * Naming: `{capability}.{action}`
 * Capabilities: workspace | project | task | team | user | search | administration | provider | mapping
 * Actions: list | read | create | update | archive | delete | manage | administer | execute
 *          | transition | assign | label | schedule | organise | parent
 *
 * Special: platform.impersonation.use
 */

export const PLATFORM_CAPABILITIES = [
  "workspace",
  "project",
  "task",
  "team",
  "user",
  "search",
  "administration",
  "provider",
  "mapping",
] as const;

export type PlatformCapability = (typeof PLATFORM_CAPABILITIES)[number];

export const PLATFORM_PERMISSION_ACTIONS = [
  "list",
  "read",
  "create",
  "update",
  "archive",
  "delete",
  "manage",
  "administer",
  "execute",
  "transition",
  "assign",
  "label",
  "schedule",
  "organise",
  "parent",
] as const;

export type PlatformPermissionAction = (typeof PLATFORM_PERMISSION_ACTIONS)[number];

export type SupportPermissionResource =
  | "requests"
  | "articles"
  | "organizations"
  | "groups"
  | "users"
  | "search"
  | "analytics";

export type PlatformPermissionKey =
  | `${PlatformCapability}.${PlatformPermissionAction}`
  | `support.${SupportPermissionResource}.${PlatformPermissionAction}`
  | ApzTcmsPermission
  | PlatformDocumentPermission
  | PlatformSearchPermission
  | "platform.impersonation.use";

export function permissionKey(
  capability: PlatformCapability,
  action: PlatformPermissionAction,
): PlatformPermissionKey {
  return `${capability}.${action}`;
}

/** Governed catalogue entries required for currently exposed platform services. */
export const PLATFORM_SERVICE_PERMISSION_CATALOGUE = [
  // Workspaces
  "workspace.list",
  "workspace.read",
  "workspace.create",
  "workspace.update",
  "workspace.archive",
  "workspace.delete",
  "workspace.manage",
  "workspace.administer",
  // Projects
  "project.list",
  "project.read",
  "project.create",
  "project.update",
  "project.archive",
  "project.delete",
  "project.manage",
  "project.administer",
  // Tasks (OSS-110-08) — singular capability per repository convention
  "task.list",
  "task.read",
  "task.create",
  "task.update",
  "task.archive",
  "task.transition",
  "task.assign",
  "task.label",
  "task.schedule",
  "task.organise",
  "task.parent",
  "task.manage",
  "task.administer",
  // Teams
  "team.list",
  "team.read",
  "team.create",
  "team.update",
  "team.archive",
  "team.delete",
  "team.manage",
  "team.administer",
  // Users
  "user.list",
  "user.read",
  "user.create",
  "user.update",
  "user.archive",
  "user.delete",
  "user.manage",
  "user.administer",
  // Search (legacy + APZSEARCH-003 catalogue)
  ...PLATFORM_SEARCH_PERMISSIONS,
  // Support (OSS-110-10)
  "support.requests.list",
  "support.requests.read",
  "support.requests.create",
  "support.requests.update",
  "support.requests.assign",
  "support.requests.transition",
  "support.requests.manage",
  "support.requests.administer",
  "support.articles.list",
  "support.articles.read",
  "support.articles.create",
  "support.articles.manage",
  "support.articles.administer",
  "support.organizations.list",
  "support.organizations.read",
  "support.organizations.create",
  "support.organizations.update",
  "support.organizations.archive",
  "support.organizations.manage",
  "support.organizations.administer",
  "support.groups.list",
  "support.groups.read",
  "support.groups.create",
  "support.groups.update",
  "support.groups.manage",
  "support.groups.administer",
  "support.users.list",
  "support.users.read",
  "support.users.manage",
  "support.users.administer",
  "support.search.execute",
  "support.search.list",
  "support.search.read",
  "support.analytics.read",
  "support.analytics.list",
  // Testing platform services (APZTCMS-011)
  ...APZ_TCMS_PERMISSIONS,
  // Document platform services (APZDOCS-003)
  ...PLATFORM_DOCUMENT_PERMISSIONS,
  // Administration / provider / mapping
  "administration.manage",
  "administration.administer",
  "administration.read",
  "provider.manage",
  "provider.administer",
  "provider.read",
  "mapping.administer",
  "mapping.manage",
  "mapping.read",
  // Impersonation
  "platform.impersonation.use",
] as const satisfies readonly PlatformPermissionKey[];

export type CataloguedPlatformPermission =
  (typeof PLATFORM_SERVICE_PERMISSION_CATALOGUE)[number];

export function isCataloguedPermission(key: string): key is CataloguedPlatformPermission {
  return (PLATFORM_SERVICE_PERMISSION_CATALOGUE as readonly string[]).includes(key);
}
