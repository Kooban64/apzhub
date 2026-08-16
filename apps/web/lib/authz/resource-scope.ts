/**
 * Generic resource-scope grants (Phase H · Stream 6).
 * Pattern: `{prefix}{resourceId}` — e.g. `projects.project:proj_…`, `source.repo:…`
 * Unrestricted when no scoped grants, or an unrestricted key / `*` is present.
 */

export type ResourceScope =
  | { readonly mode: "unrestricted" }
  | { readonly mode: "scoped"; readonly resourceIds: readonly string[] };

function asList(
  source: readonly string[] | ReadonlySet<string> | undefined | null,
): readonly string[] {
  if (!source) return [];
  if (source instanceof Set) return [...source];
  return source;
}

export function resolveResourceScope(
  permissions: readonly string[] | ReadonlySet<string> | undefined | null,
  options: {
    readonly prefix: string;
    readonly unrestrictedKeys?: readonly string[];
  },
): ResourceScope {
  const granted = asList(permissions);
  const unrestricted = options.unrestrictedKeys ?? [];
  if (granted.includes("*") || unrestricted.some((k) => granted.includes(k))) {
    return { mode: "unrestricted" };
  }

  const resourceIds = [
    ...new Set(
      granted
        .filter((p) => p.startsWith(options.prefix))
        .map((p) => p.slice(options.prefix.length).trim())
        .filter(Boolean),
    ),
  ];

  if (resourceIds.length === 0) {
    return { mode: "unrestricted" };
  }

  return { mode: "scoped", resourceIds };
}

export function isResourceInScope(
  resourceId: string | null | undefined,
  scope: ResourceScope,
): boolean {
  if (scope.mode === "unrestricted") {
    return true;
  }
  if (!resourceId) {
    return false;
  }
  return scope.resourceIds.includes(resourceId);
}

export function filterItemsByResourceScope<T>(
  items: readonly T[],
  scope: ResourceScope,
  getId: (item: T) => string | null | undefined,
): readonly T[] {
  if (scope.mode === "unrestricted") {
    return items;
  }
  return items.filter((item) => isResourceInScope(getId(item), scope));
}

export function resourceGrantKey(prefix: string, resourceId: string): string {
  return `${prefix}${resourceId}`;
}
