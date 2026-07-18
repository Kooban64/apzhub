export { PLATFORM_PROVISIONING_VERSION } from "./version";
export {
  PLATFORM_PROVISIONING_PUBLISHER,
  PROVISIONING_EVENT_STARTED,
  PROVISIONING_EVENT_STEP_COMPLETED,
  PROVISIONING_EVENT_COMPLETED,
  PROVISIONING_EVENT_FAILED,
  PROVISIONING_EVENT_VERSION,
  OUTBOX_AGGREGATE_TYPE_PROVISIONING,
  OUTBOX_EVENT_TYPE_PROVISIONING_STEP,
  DEFAULT_PRODUCT_KEYS,
} from "./constants";

export type {
  ProvisioningFlowKind,
  ProvisioningFlowStatus,
  ProvisioningStepId,
  ProvisioningStepResult,
  ProvisioningFlow,
  StartProvisioningFlowInput,
  ProvisioningOutboxStepPayload,
  ProvisioningHealth,
  ProvisioningDiagnostics,
  ProvisioningAuditEntry,
} from "./types";
export {
  PROVISIONING_FLOW_KINDS,
  PROVISIONING_FLOW_STATUSES,
  PROVISIONING_STEPS,
} from "./types";

export {
  createInMemoryProvisioningAuditSink,
  type ProvisioningAuditSink,
} from "./audit";
export {
  createInMemoryProvisioningFlowStore,
  type ProvisioningFlowStore,
} from "./flow-store";
export {
  ensureProvisioningEventRegistry,
  platformProvisioningDescriptors,
} from "./events/registry";
export {
  createProductProvisioningEngine,
  type ProductProvisioningEngine,
  type CreateProductProvisioningEngineOptions,
} from "./engine";
export {
  createPlatformProvisioning,
  type CreatePlatformProvisioningOptions,
  type PlatformProvisioningRuntime,
} from "./create-platform-provisioning";
export {
  evaluateCommercialReadiness,
  type EvaluateCommercialReadinessInput,
} from "./commercial-readiness";
export {
  stepsForKind,
  nextStep,
  executeProvisioningStep,
  isPermanentStepFailure,
} from "./workflow";
