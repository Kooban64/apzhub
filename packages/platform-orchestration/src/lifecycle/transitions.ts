import { OrchestrationError } from "../contracts/errors";
import type { OrchestrationKernelState } from "../contracts/state";

const ALLOWED: Readonly<
  Record<OrchestrationKernelState, readonly OrchestrationKernelState[]>
> = {
  created: ["initialising", "failed"],
  initialising: ["ready", "failed", "stopping"],
  ready: ["paused", "stopping", "failed"],
  paused: ["ready", "stopping", "failed"],
  stopping: ["stopped", "failed"],
  stopped: [],
  failed: ["stopping", "stopped"],
};

export function canTransition(
  from: OrchestrationKernelState,
  to: OrchestrationKernelState,
): boolean {
  return ALLOWED[from].includes(to);
}

export function assertTransition(
  from: OrchestrationKernelState,
  to: OrchestrationKernelState,
): void {
  if (!canTransition(from, to)) {
    throw new OrchestrationError(
      "lifecycle",
      "INVALID_TRANSITION",
      `Invalid orchestration kernel transition: ${from} → ${to}`,
      { from, to },
    );
  }
}
