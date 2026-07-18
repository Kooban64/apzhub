export type { IntegrationLifecycleState } from "./types";
export {
  ACTIVE_INTEGRATION_LIFECYCLE_STATES,
  INTEGRATION_LIFECYCLE_STATES,
  TERMINAL_INTEGRATION_LIFECYCLE_STATES,
} from "./types";
export {
  canAcceptIntegrationRequests,
  isActiveIntegrationLifecycleState,
  isIntegrationLifecycleState,
  isTerminalIntegrationLifecycleState,
} from "./guards";
export type {
  IntegrationLifecycleContext,
  IntegrationLifecycleParticipant,
  IntegrationLifecycleResult,
  IntegrationLifecycleParticipationSnapshot,
  BuildIntegrationLifecycleParticipationInput,
} from "./participant-types";
export {
  canTransitionIntegrationLifecycle,
  getAllowedIntegrationLifecycleTransitions,
  mapHealthStatusToParticipationReadiness,
  mapLifecycleStateToRecoveryStatus,
  mapLifecycleStateToShutdownStatus,
} from "./integration-transitions";
export { IntegrationAdapterLifecycleService } from "./integration-lifecycle-service";
export type { IntegrationLifecycleTransitionInput } from "./integration-lifecycle-service";
export {
  DefaultLifecycleParticipant,
  createDefaultLifecycleParticipant,
} from "./default-lifecycle-participant";
export type { DefaultLifecycleParticipantOptions } from "./default-lifecycle-participant";
export {
  buildIntegrationLifecycleParticipation,
  toPlatformCapabilityParticipation,
} from "./platform-bridge";
