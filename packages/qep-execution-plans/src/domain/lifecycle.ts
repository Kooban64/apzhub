import type { ExecutionPlanLifecycleState } from "./types";

const TRANSITIONS: Readonly<
  Record<ExecutionPlanLifecycleState, readonly ExecutionPlanLifecycleState[]>
> = {
  draft: ["in_review", "cancelled"],
  in_review: ["draft", "approved", "cancelled"],
  approved: ["ready", "in_review", "cancelled", "archived"],
  ready: ["scheduled", "cancelled", "archived"],
  scheduled: ["handed_off", "ready", "cancelled", "archived"],
  handed_off: ["archived", "retired"],
  cancelled: ["archived", "draft"],
  archived: ["retired", "draft"],
  retired: [],
};

export function canTransition(
  from: ExecutionPlanLifecycleState,
  to: ExecutionPlanLifecycleState,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(
  from: ExecutionPlanLifecycleState,
  to: ExecutionPlanLifecycleState,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`execution_plan.lifecycle.invalid:${from}->${to}`);
  }
}

/** Active (non-terminal) states for archive rules. */
export function isTerminalState(state: ExecutionPlanLifecycleState): boolean {
  return state === "retired";
}
