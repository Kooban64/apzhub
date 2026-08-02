/**
 * Processor Contract — APZQEP-120-S09.
 * Processors declare capabilities; the engine never hard-codes them.
 */

import type { ProcessingContext, ProcessingResult } from "../types";

export type ProcessorCapability = {
  readonly eventType: string;
  readonly description?: string;
};

export type ProcessorDescriptor = {
  readonly processorId: string;
  readonly name: string;
  readonly capabilities: readonly ProcessorCapability[];
  /** When true, processor may be invoked on replay. */
  readonly replayCompatible: boolean;
};

/**
 * Generic processor interface.
 * Implementations belong to later slices (Search, Notifications, …).
 */
export type EventProcessor = {
  readonly descriptor: ProcessorDescriptor;
  /**
   * Execute work. Must be idempotent for the same idempotencyKey.
   * Return Ack / Retry / Dead Letter via ProcessingResult.
   */
  execute(context: ProcessingContext): Promise<ProcessingResult>;
};

/** No-op acknowledging processor — for tests and composition smoke checks only. */
export function createNullEventProcessor(
  options: {
    readonly processorId?: string;
    readonly eventTypes?: readonly string[];
    readonly fail?: ProcessingResult;
  } = {},
): EventProcessor {
  const eventTypes = options.eventTypes ?? ["*"];
  return {
    descriptor: {
      processorId: options.processorId ?? "null-processor",
      name: "Null Event Processor",
      capabilities: eventTypes.map((eventType) => ({ eventType })),
      replayCompatible: true,
    },
    async execute() {
      if (options.fail) return options.fail;
      return { outcome: "acknowledged" };
    },
  };
}
