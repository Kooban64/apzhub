import type { GlobalSearchHitCandidate } from "./types";

/**
 * Provider-side permission filter — never return a hit the user cannot access.
 * Hits without requiredPermissions pass (indexed public-to-caller metadata).
 */
export function filterByPermissions(
  candidates: readonly GlobalSearchHitCandidate[],
  userPermissions: ReadonlySet<string>,
): readonly GlobalSearchHitCandidate[] {
  return candidates.filter((hit) => {
    const required = hit.requiredPermissions;
    if (!required || required.length === 0) {
      return true;
    }
    return required.every((permission) => userPermissions.has(permission));
  });
}
