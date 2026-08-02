import type { SuiteLifecycleState } from "./types";

const TRANSITIONS: Readonly<
  Record<SuiteLifecycleState, readonly SuiteLifecycleState[]>
> = {
  draft: ["review", "deleted"],
  review: ["draft", "approved", "deleted"],
  approved: ["published", "review", "deprecated"],
  published: ["deprecated", "archived"],
  deprecated: ["archived", "published"],
  archived: ["draft", "retired"],
  retired: ["archived"],
  deleted: [],
};

export function canTransition(
  from: SuiteLifecycleState,
  to: SuiteLifecycleState,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(
  from: SuiteLifecycleState,
  to: SuiteLifecycleState,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`suite.lifecycle.invalid:${from}->${to}`);
  }
}
