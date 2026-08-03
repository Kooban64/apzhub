import type { ExecutionLifecycleState } from "../contracts/execution";

const ALLOWED: Readonly<
  Record<ExecutionLifecycleState, readonly ExecutionLifecycleState[]>
> = {
  queued: ["preparing", "cancelled", "interrupted"],
  preparing: ["running", "failed", "cancelled", "timed_out", "interrupted"],
  running: ["retrying", "completed", "failed", "cancelled", "timed_out", "interrupted"],
  retrying: ["preparing", "running", "failed", "cancelled", "timed_out", "interrupted"],
  completed: [],
  failed: [],
  cancelled: [],
  timed_out: [],
  interrupted: [],
};

export function canTransition(
  from: ExecutionLifecycleState,
  to: ExecutionLifecycleState,
): boolean {
  return ALLOWED[from].includes(to);
}

export function assertTransition(
  from: ExecutionLifecycleState,
  to: ExecutionLifecycleState,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid automation lifecycle transition: ${from} → ${to}`);
  }
}
