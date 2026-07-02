export { lifecycleError, invalidTransitionError } from "./errors";
export {
  CapabilityLifecycleManager,
  createCapabilityLifecycleManager,
} from "./manager";
export { LifecycleStateStore } from "./store";
export {
  canTransitionBetween,
  getAllowedTransitions,
  isFailureState,
} from "./transitions";
export type {
  LifecycleCapabilityState,
  LifecycleDiagnostics,
  LifecycleError,
  LifecycleErrorCode,
  LifecycleSnapshot,
  LifecycleSnapshotEntry,
  LifecycleTransitionContext,
  LifecycleTransitionFailure,
  LifecycleTransitionRecord,
  LifecycleTransitionResult,
  LifecycleTransitionSuccess,
} from "./types";

export const LIFECYCLE_MANAGER_STATUS = "active" as const;
