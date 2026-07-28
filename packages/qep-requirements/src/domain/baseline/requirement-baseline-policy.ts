import { QepInvariantViolation } from "../../shared/errors";
import type { RequirementBaseline } from "./requirement-baseline";
import type { RequirementBaselineItem } from "./requirement-baseline-item";
import type { RequirementBaselineStatus } from "./requirement-baseline-status";

export function assertRequirementBaselineDraftMutable(
  baseline: Pick<RequirementBaseline, "status">,
): void {
  if (baseline.status !== "draft") {
    throw new QepInvariantViolation("Only draft requirement baselines may be modified");
  }
}

export function assertRequirementBaselineTransition(
  from: RequirementBaselineStatus,
  to: RequirementBaselineStatus,
): void {
  if (!(
    (from === "draft" && to === "locked") ||
    (from === "locked" && to === "archived")
  )) {
    throw new QepInvariantViolation(
      `Requirement baseline transition ${from} -> ${to} is not allowed`,
    );
  }
}

export function assertUniqueRequirementBaselineMembership(
  items: readonly RequirementBaselineItem[],
): void {
  const contentVersionIds = new Set<string>();
  const requirementIds = new Set<string>();
  for (const item of items) {
    if (contentVersionIds.has(item.contentVersionId)) {
      throw new QepInvariantViolation(
        "Requirement baseline cannot include a content version more than once",
      );
    }
    if (requirementIds.has(item.requirementId)) {
      throw new QepInvariantViolation(
        "Requirement baseline cannot include more than one content version for the same requirement",
      );
    }
    contentVersionIds.add(item.contentVersionId);
    requirementIds.add(item.requirementId);
  }
}
