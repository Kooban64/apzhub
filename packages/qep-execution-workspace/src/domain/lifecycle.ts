import type { ExecutionSessionState } from "./types";

const TRANSITIONS: Readonly<
  Record<ExecutionSessionState, readonly ExecutionSessionState[]>
> = {
  not_started: ["in_progress", "cancelled"],
  in_progress: ["paused", "blocked", "completed", "cancelled"],
  paused: ["in_progress", "cancelled"],
  blocked: ["in_progress", "cancelled"],
  completed: ["archived"],
  cancelled: ["archived"],
  archived: [],
};

export function canTransition(
  from: ExecutionSessionState,
  to: ExecutionSessionState,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(
  from: ExecutionSessionState,
  to: ExecutionSessionState,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`execution_session.lifecycle.invalid:${from}->${to}`);
  }
}

/** Completed sessions are historical records — step mutation requires amendment. */
export function isImmutable(status: ExecutionSessionState): boolean {
  return status === "completed" || status === "archived";
}

export function isActive(status: ExecutionSessionState): boolean {
  return (
    status === "not_started" ||
    status === "in_progress" ||
    status === "paused" ||
    status === "blocked"
  );
}
