/**
 * Stateless worker lifecycle — APZQEP-120-S09.
 *
 * reserve → lease → execute → ack → release → metrics
 * Workers hold no business state.
 */

import {
  createProcessingEngine,
  type CreateProcessingEngineOptions,
  type ProcessBatchResult,
  type ProcessingEngine,
} from "./engine";

export type ProcessingWorker = {
  readonly engine: ProcessingEngine;
  readonly workerId: string;
  /** One lifecycle pass over a batch. */
  runOnce(): Promise<ProcessBatchResult>;
  reclaimExpired(): Promise<number>;
  diagnostics: ProcessingEngine["diagnostics"];
  replay: ProcessingEngine["replay"];
};

export type CreateProcessingWorkerOptions = CreateProcessingEngineOptions;

/**
 * Compose a stateless processing worker around the engine.
 */
export function createProcessingWorker(
  options: CreateProcessingWorkerOptions,
): ProcessingWorker {
  const engine = createProcessingEngine(options);
  return {
    engine,
    workerId: options.workerId,
    runOnce: () => engine.processBatch(),
    reclaimExpired: () => engine.reclaimExpired(),
    diagnostics: () => engine.diagnostics(),
    replay: (filter) => engine.replay(filter),
  };
}

export const WORKER_LIFECYCLE_STEPS = [
  "reserve_work",
  "acquire_lease",
  "execute_processor",
  "commit_acknowledgement",
  "release_reservation",
  "update_metrics",
] as const;

export type WorkerLifecycleStep = (typeof WORKER_LIFECYCLE_STEPS)[number];
