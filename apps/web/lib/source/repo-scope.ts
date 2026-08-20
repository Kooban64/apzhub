/**
 * Source repository resource scopes (Phase H · Stream 6).
 * Grant keys: `source.repo:{repositoryId}`
 */

import {
  filterItemsByResourceScope,
  isResourceInScope,
  resolveResourceScope,
  resourceGrantKey,
  type ResourceScope,
} from "@/lib/authz/resource-scope";

export const SOURCE_REPO_SCOPE_PREFIX = "source.repo:";

export type SourceRepoScope = ResourceScope;

export function resolveSourceRepoScope(
  permissions: readonly string[] | ReadonlySet<string> | undefined | null,
): SourceRepoScope {
  return resolveResourceScope(permissions, {
    prefix: SOURCE_REPO_SCOPE_PREFIX,
    unrestrictedKeys: ["source.*", "source.repo.*"],
  });
}

export function isRepositoryInSourceScope(
  repositoryId: string | null | undefined,
  scope: SourceRepoScope,
): boolean {
  return isResourceInScope(repositoryId, scope);
}

export function filterRepositoriesBySourceScope<
  T extends { readonly id?: string; readonly repositoryId?: string },
>(items: readonly T[], scope: SourceRepoScope): readonly T[] {
  return filterItemsByResourceScope(
    items,
    scope,
    (item) => item.id ?? item.repositoryId,
  );
}

export function sourceRepoGrantKey(repositoryId: string): string {
  return resourceGrantKey(SOURCE_REPO_SCOPE_PREFIX, repositoryId);
}
