import { filterQuickActionsByPermissions } from "./permissions";
import { listGlobalQuickActionDescriptors } from "./registry";
import type { GlobalQuickActionsResponse, QuickAction } from "./types";
import { filterByEntitledProducts } from "@/lib/commercial/surface-entitlements";

export function listGlobalQuickActions(input: {
  readonly userPermissions: readonly string[];
  readonly recentActionIds?: readonly string[];
  /** Commercial product keys the user is entitled to (org ∩ grant). */
  readonly entitledProductKeys?: readonly string[];
}): GlobalQuickActionsResponse {
  let allowed = filterQuickActionsByPermissions(
    listGlobalQuickActionDescriptors(),
    input.userPermissions,
  );
  if (input.entitledProductKeys) {
    allowed = filterByEntitledProducts(allowed, new Set(input.entitledProductKeys));
  }
  const recentIds = (input.recentActionIds ?? []).filter((id) =>
    allowed.some((action) => action.id === id),
  );
  const recentRank = new Map(recentIds.map((id, index) => [id, index]));

  const actions: QuickAction[] = [...allowed]
    .map((action) => {
      const rank = recentRank.get(action.id);
      return rank === undefined ? action : { ...action, recentRank: rank };
    })
    .sort((a, b) => {
      const ar = a.recentRank ?? Number.POSITIVE_INFINITY;
      const br = b.recentRank ?? Number.POSITIVE_INFINITY;
      if (ar !== br) {
        return ar - br;
      }
      return a.label.localeCompare(b.label);
    });

  return {
    capability: "global-quick-actions-v1",
    actions,
    recentActionIds: recentIds,
  };
}
