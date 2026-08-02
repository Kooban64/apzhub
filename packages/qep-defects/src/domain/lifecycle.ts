import type { DefectLifecycleState } from "./types";

const TRANSITIONS: Readonly<
  Record<DefectLifecycleState, readonly DefectLifecycleState[]>
> = {
  new: ["triaged", "rejected", "duplicate", "wont_fix"],
  triaged: ["assigned", "rejected", "duplicate", "wont_fix", "new"],
  assigned: ["in_progress", "triaged", "rejected", "wont_fix", "duplicate"],
  in_progress: ["fixed", "ready_for_retest", "assigned", "wont_fix", "rejected"],
  fixed: ["ready_for_retest", "in_progress"],
  ready_for_retest: ["verified", "in_progress", "rejected"],
  verified: ["closed", "in_progress"],
  rejected: ["closed", "new", "triaged"],
  duplicate: ["closed", "archived"],
  wont_fix: ["closed", "archived"],
  closed: ["archived", "new"],
  archived: [],
};

export function canTransition(
  from: DefectLifecycleState,
  to: DefectLifecycleState,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(
  from: DefectLifecycleState,
  to: DefectLifecycleState,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`defect.lifecycle.invalid:${from}->${to}`);
  }
}
