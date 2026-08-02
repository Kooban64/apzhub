/**
 * Outbox Delivery Service / Dispatcher — drains via DeliveryPort (S08).
 */

import {
  createOutboxWorker,
  type CreateOutboxWorkerOptions,
  type OutboxWorker,
} from "../worker";
import type { OutboxHandler, OutboxHandlerResult } from "../types";
import type {
  DeadLetterPreparationHook,
  DeliveryObservabilityHooks,
} from "./observability";
import type { DeliveryPort } from "./transport";

export function createTransportDeliveryHandler(transport: DeliveryPort): OutboxHandler {
  return {
    name: `transport:${transport.name}`,
    async handle(event): Promise<OutboxHandlerResult> {
      const result = await transport.deliver(event);
      if (result.ok) {
        return { ok: true };
      }
      return {
        ok: false,
        message: result.message,
        permanent: result.permanent === true || result.retryable === false,
      };
    },
  };
}

export type ReliableDeliveryPlatform = {
  readonly worker: OutboxWorker;
  readonly transport: DeliveryPort;
  processBatch: OutboxWorker["processBatch"];
  diagnostics: OutboxWorker["diagnostics"];
  replay: OutboxWorker["replay"];
};

export type CreateReliableDeliveryPlatformOptions = Omit<
  CreateOutboxWorkerOptions,
  "handlers"
> & {
  readonly transport: DeliveryPort;
  readonly additionalHandlers?: readonly OutboxHandler[];
  readonly observability?: DeliveryObservabilityHooks;
  readonly onDeadLetterReady?: DeadLetterPreparationHook;
};

/**
 * Composes store + transport adapter into a drainable delivery platform.
 * Product-agnostic — Evidence, TE, LAW can share this engine.
 */
export function createReliableDeliveryPlatform(
  options: CreateReliableDeliveryPlatformOptions,
): ReliableDeliveryPlatform {
  const handlers = [
    ...(options.additionalHandlers ?? []),
    createTransportDeliveryHandler(options.transport),
  ];
  const worker = createOutboxWorker({
    store: options.store,
    handlers,
    retryPolicy: options.retryPolicy,
    batchPolicy: options.batchPolicy,
    now: options.now,
    observability: options.observability,
    onDeadLetterReady: options.onDeadLetterReady,
  });
  return {
    worker,
    transport: options.transport,
    processBatch: () => worker.processBatch(),
    diagnostics: () => worker.diagnostics(),
    replay: (filter) => worker.replay(filter),
  };
}
