/**
 * Projects resource scopes (Phase H · Stream 6).
 * Grant keys: `projects.project:{projectId}`
 */

import {
  filterItemsByResourceScope,
  isResourceInScope,
  resolveResourceScope,
  resourceGrantKey,
  type ResourceScope,
} from "@/lib/authz/resource-scope";

export const PROJECTS_SCOPE_PREFIX = "projects.project:";

export type ProjectsResourceScope = ResourceScope;

export function resolveProjectsResourceScope(
  permissions: readonly string[] | ReadonlySet<string> | undefined | null,
): ProjectsResourceScope {
  return resolveResourceScope(permissions, {
    prefix: PROJECTS_SCOPE_PREFIX,
    unrestrictedKeys: ["projects.*", "projects.administer", "projects.admin"],
  });
}

export function isProjectInScope(
  projectId: string | null | undefined,
  scope: ProjectsResourceScope,
): boolean {
  return isResourceInScope(projectId, scope);
}

export function filterProjectsByScope<T extends { readonly id: string }>(
  items: readonly T[],
  scope: ProjectsResourceScope,
): readonly T[] {
  return filterItemsByResourceScope(items, scope, (item) => item.id);
}

export function projectsProjectGrantKey(projectId: string): string {
  return resourceGrantKey(PROJECTS_SCOPE_PREFIX, projectId);
}
