import type { RequirementLifecycleState } from "./types";

const TRANSITIONS: Readonly<
  Record<RequirementLifecycleState, readonly RequirementLifecycleState[]>
> = {
  draft: ["under_review", "archived"],
  under_review: ["approved", "draft", "archived"],
  approved: ["active", "under_review", "deprecated", "archived"],
  active: ["deprecated", "archived"],
  deprecated: ["active", "archived", "retired"],
  archived: ["retired", "draft"],
  retired: [],
};

export function canTransition(
  from: RequirementLifecycleState,
  to: RequirementLifecycleState,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(
  from: RequirementLifecycleState,
  to: RequirementLifecycleState,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`requirement.lifecycle.invalid:${from}->${to}`);
  }
}
