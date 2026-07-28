import type { RequirementBaselineItem } from "./requirement-baseline-item";

export type RequirementBaselineVersionChange = {
  readonly requirementId: string;
  readonly removed: RequirementBaselineItem;
  readonly added: RequirementBaselineItem;
};

export type RequirementBaselineMembershipComparison = {
  readonly added: readonly RequirementBaselineItem[];
  readonly removed: readonly RequirementBaselineItem[];
  readonly unchanged: readonly RequirementBaselineItem[];
  /**
   * Overlay of `added`/`removed` entries that share a requirement id — the same
   * Requirement was re-versioned between the two baselines rather than added or
   * dropped outright. `added`/`removed` remain unchanged for backward compatibility.
   */
  readonly versionChanged: readonly RequirementBaselineVersionChange[];
  readonly summary: {
    readonly addedCount: number;
    readonly removedCount: number;
    readonly unchangedCount: number;
    readonly versionChangedCount: number;
  };
};

/**
 * Membership-only comparison. Does not inspect Requirement content snapshots.
 */
export function compareRequirementBaselineMembership(
  baseItems: readonly RequirementBaselineItem[],
  targetItems: readonly RequirementBaselineItem[],
): RequirementBaselineMembershipComparison {
  const baseByVersion = new Map(baseItems.map((item) => [item.contentVersionId, item]));
  const targetByVersion = new Map(
    targetItems.map((item) => [item.contentVersionId, item]),
  );

  const added: RequirementBaselineItem[] = [];
  const removed: RequirementBaselineItem[] = [];
  const unchanged: RequirementBaselineItem[] = [];

  for (const [contentVersionId, item] of targetByVersion) {
    if (baseByVersion.has(contentVersionId)) {
      unchanged.push(item);
    } else {
      added.push(item);
    }
  }
  for (const [contentVersionId, item] of baseByVersion) {
    if (!targetByVersion.has(contentVersionId)) {
      removed.push(item);
    }
  }

  const removedByRequirement = new Map(
    removed.map((item) => [item.requirementId, item]),
  );
  const versionChanged: RequirementBaselineVersionChange[] = [];
  for (const addedItem of added) {
    const removedItem = removedByRequirement.get(addedItem.requirementId);
    if (removedItem) {
      versionChanged.push({
        requirementId: addedItem.requirementId,
        removed: removedItem,
        added: addedItem,
      });
    }
  }

  return {
    added,
    removed,
    unchanged,
    versionChanged,
    summary: {
      addedCount: added.length,
      removedCount: removed.length,
      unchangedCount: unchanged.length,
      versionChangedCount: versionChanged.length,
    },
  };
}
