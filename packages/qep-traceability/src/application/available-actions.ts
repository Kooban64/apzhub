import {
  computeQepTraceLinkAvailableActions,
  type QepTraceLinkAction,
} from "@apzhub/qep-contracts";

import type { StoredTraceLink } from "../domain/trace-link/trace-link-repository";

/**
 * Computes the Trace Link commands a caller may perform for a persisted
 * Trace Link, delegating to the canonical `@apzhub/qep-contracts` rules so
 * the Workbench and the application layer never diverge. The server-side
 * command handlers in `TraceLinkApplicationService` remain authoritative.
 */
export function computeTraceLinkAvailableActions(
  trace: Pick<StoredTraceLink, "lifecycleState">,
  permissions?: readonly string[],
): readonly QepTraceLinkAction[] {
  return computeQepTraceLinkAvailableActions(trace.lifecycleState, permissions);
}

export { type QepTraceLinkAction };
