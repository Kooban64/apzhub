export * from "./types";
export * from "./lifecycle-states";
export * from "./state-machine";
export * from "./registrations";
export * from "./lifecycle-context-builder";
export * from "./participation-evaluator";
export {
  PlatformLifecycleManager,
  buildPlatformLifecycleSnapshot,
  createInitialRuntimeState,
  createPlatformLifecycleManager,
} from "./platform-lifecycle-manager";
export type { PlatformLifecycleRuntimeState } from "./platform-lifecycle-manager";
export {
  createHealthyConsolidatedFixture,
  createControlPlaneValidationInput,
  createLifecycleValidationInput,
  withAuthorizationFailure,
  withDatabaseUnavailable,
  withMissingConfiguration,
  withProductFailure,
  withReadinessDegraded,
  withRedisUnavailable,
  withTenantGuardFailure,
  withTrafficGovernanceDisabled,
} from "./failure-fixtures";
