/**
 * Support queue / group resource scopes (Phase G · Stream 6).
 *
 * Grant keys: `support.queue:{groupId}`
 * Unrestricted: no queue grants, or `support.queue.*` / `support.*` / `*`.
 * When scoped grants exist, ticket/group visibility is constrained to those groups.
 */

export const SUPPORT_QUEUE_SCOPE_PREFIX = "support.queue:";

export type SupportQueueScope =
  | { readonly mode: "unrestricted" }
  | { readonly mode: "scoped"; readonly groupIds: readonly string[] };

function asList(
  source: readonly string[] | ReadonlySet<string> | undefined | null,
): readonly string[] {
  if (!source) return [];
  return [...source];
}

export function resolveSupportQueueScope(
  permissions: readonly string[] | ReadonlySet<string> | undefined | null,
): SupportQueueScope {
  const granted = asList(permissions);
  if (
    granted.includes("*") ||
    granted.includes("support.*") ||
    granted.includes("support.queue.*") ||
    granted.includes("support.groups.administer")
  ) {
    return { mode: "unrestricted" };
  }

  const groupIds = [
    ...new Set(
      granted
        .filter((p) => p.startsWith(SUPPORT_QUEUE_SCOPE_PREFIX))
        .map((p) => p.slice(SUPPORT_QUEUE_SCOPE_PREFIX.length).trim())
        .filter(Boolean),
    ),
  ];

  if (groupIds.length === 0) {
    return { mode: "unrestricted" };
  }

  return { mode: "scoped", groupIds };
}

export function isGroupInSupportQueueScope(
  groupId: string | null | undefined,
  scope: SupportQueueScope,
): boolean {
  if (scope.mode === "unrestricted") {
    return true;
  }
  if (!groupId) {
    return false;
  }
  return scope.groupIds.includes(groupId);
}

/**
 * Resolve the groupId filter for a list query under queue scope.
 * Returns null when the requested group is outside scope (caller should 403).
 */
export function resolveScopedGroupIdFilter(
  requestedGroupId: string | undefined,
  scope: SupportQueueScope,
): { readonly ok: true; readonly groupId?: string } | { readonly ok: false } {
  if (scope.mode === "unrestricted") {
    return { ok: true, groupId: requestedGroupId };
  }
  if (requestedGroupId) {
    if (!scope.groupIds.includes(requestedGroupId)) {
      return { ok: false };
    }
    return { ok: true, groupId: requestedGroupId };
  }
  if (scope.groupIds.length === 1) {
    return { ok: true, groupId: scope.groupIds[0] };
  }
  // Multiple queues — leave filter unset; caller post-filters items.
  return { ok: true, groupId: undefined };
}

export function filterItemsBySupportQueueScope<
  T extends { readonly groupId?: string | null },
>(items: readonly T[], scope: SupportQueueScope): readonly T[] {
  if (scope.mode === "unrestricted") {
    return items;
  }
  return items.filter((item) => isGroupInSupportQueueScope(item.groupId, scope));
}

export function supportQueueGrantKey(groupId: string): string {
  return `${SUPPORT_QUEUE_SCOPE_PREFIX}${groupId}`;
}
