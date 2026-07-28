import { TraceInvariantViolation } from "../../shared/errors";
import { TRACE_LIFECYCLE_STATES } from "./constants";

export type TraceLifecycleState = (typeof TRACE_LIFECYCLE_STATES)[number];

export function createTraceLifecycleState(value: string): TraceLifecycleState {
  const normalized = value.trim() as TraceLifecycleState;
  if (!(TRACE_LIFECYCLE_STATES as readonly string[]).includes(normalized)) {
    throw new TraceInvariantViolation(
      `Trace lifecycle state must be one of: ${TRACE_LIFECYCLE_STATES.join(", ")}`,
    );
  }
  return normalized;
}

/**
 * Permitted transitions (ENG-030A Part 1 / ARCH-007 concepts):
 * draft → validated → approved → retired
 * approved → superseded (via supersede command)
 * No reverse. No delete. No restore.
 */
export function assertTraceLifecycleTransition(
  from: TraceLifecycleState,
  to: TraceLifecycleState,
): void {
  const allowed =
    (from === "draft" && to === "validated") ||
    (from === "validated" && to === "approved") ||
    (from === "approved" && to === "retired") ||
    (from === "approved" && to === "superseded");
  if (!allowed) {
    throw new TraceInvariantViolation(
      `Trace lifecycle transition ${from} -> ${to} is not allowed`,
    );
  }
}
