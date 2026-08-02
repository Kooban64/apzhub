export { PLATFORM_PROCESSING_VERSION } from "./version";

export {
  PROCESSING_STATUSES,
  PROCESSING_LIFECYCLE_STATES,
  DEFAULT_PROCESSING_RETRY_POLICY,
  DEFAULT_LEASE_POLICY,
  DEFAULT_SCHEDULER_POLICY,
  type ProcessingStatus,
  type ProcessingLifecycleState,
  type ProcessingWorkItem,
  type ProcessingResult,
  type ProcessingResultOutcome,
  type ProcessingContext,
  type RetryPolicy,
  type LeasePolicy,
  type SchedulerPolicy,
  type FailureClass,
  type ProcessingAttemptRecord,
  type ProcessingDiagnostics,
} from "./types";

export { toProcessingLifecycleState, processingContractTransitions } from "./lifecycle";

export {
  createNullEventProcessor,
  type EventProcessor,
  type ProcessorCapability,
  type ProcessorDescriptor,
} from "./processor/contract";

export { createProcessorRegistry, type ProcessorRegistry } from "./processor/registry";

export type { ProcessingStore } from "./store/port";
export {
  createInMemoryProcessingStore,
  type InMemoryProcessingStore,
} from "./store/memory";

export {
  enqueueProcessingWork,
  enqueueFromOutboxEvent,
  type EnqueueProcessingWorkInput,
  type EnqueueProcessingResult,
} from "./enqueue";

export {
  computeBackoffDelayMs,
  shouldRetry,
  nextAttemptIso,
  classifyFailure,
  isPoisonCandidate,
} from "./retry";

export {
  createInMemoryProcessingAudit,
  type ProcessingMetricsSnapshot,
  type ProcessingObservabilityHooks,
  type InMemoryProcessingAudit,
} from "./metrics";

export {
  createProcessingEngine,
  type ProcessingEngine,
  type ProcessBatchResult,
  type CreateProcessingEngineOptions,
} from "./engine";

export {
  createProcessingWorker,
  WORKER_LIFECYCLE_STEPS,
  type ProcessingWorker,
  type CreateProcessingWorkerOptions,
  type WorkerLifecycleStep,
} from "./worker";
