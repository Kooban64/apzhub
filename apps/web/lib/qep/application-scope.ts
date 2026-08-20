/**
 * Application resource scopes. Grant keys: `qep.application:{applicationId}`
 * Unrestricted when no scoped grants exist. Not a substitute for server AuthZ.
 */

import {
  filterItemsByResourceScope,
  isResourceInScope,
  resolveResourceScope,
  type ResourceScope,
} from "@/lib/authz/resource-scope";

export const QEP_APPLICATION_SCOPE_PREFIX = "qep.application:";

export function resolveQepApplicationScope(
  permissions: readonly string[] | ReadonlySet<string> | undefined | null,
): ResourceScope {
  return resolveResourceScope(permissions, {
    prefix: QEP_APPLICATION_SCOPE_PREFIX,
    unrestrictedKeys: ["qep.*", "qep.application.*"],
  });
}

export function isApplicationInScope(
  applicationId: string | null | undefined,
  scope: ResourceScope,
): boolean {
  return isResourceInScope(applicationId, scope);
}

export function filterApplicationsByScope<T extends { readonly id: string }>(
  items: readonly T[],
  scope: ResourceScope,
): readonly T[] {
  return filterItemsByResourceScope(items, scope, (item) => item.id);
}
