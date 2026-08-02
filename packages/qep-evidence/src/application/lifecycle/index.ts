export {
  LIFECYCLE_TRANSITION_MATRIX,
  findTransitionEdge,
  type LifecycleTransitionAction,
  type LifecycleTransitionEdge,
} from "./transition-matrix";
export {
  evaluateLifecycleTransition,
  resolveLifecycleState,
  type LifecyclePolicyDecision,
} from "./transition-policy";
export {
  createEvidenceLifecyclePlatformService,
  type EvidenceLifecyclePlatformService,
  type LifecycleStateView,
} from "./evidence-lifecycle-platform-service";
export { createInMemoryLifecycleHistoryRepository } from "./in-memory-lifecycle-history";
