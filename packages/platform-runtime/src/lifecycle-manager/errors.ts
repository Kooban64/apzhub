import type { CapabilityLifecycleState } from "../capability/types";
import type { LifecycleError, LifecycleErrorCode } from "./types";

export function lifecycleError(
  code: LifecycleErrorCode,
  message: string,
  details: Omit<LifecycleError, "code" | "message"> = {},
): LifecycleError {
  return { code, message, ...details };
}

export function invalidTransitionError(
  capabilityId: string,
  from: CapabilityLifecycleState | null,
  to: CapabilityLifecycleState,
): LifecycleError {
  const fromLabel = from ?? "untracked";
  return lifecycleError(
    "LIFECYCLE_INVALID_TRANSITION",
    `Cannot transition capability "${capabilityId}" from "${fromLabel}" to "${to}"`,
    { capabilityId, from, to },
  );
}
