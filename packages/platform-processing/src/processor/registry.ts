/**
 * Processor Registry — dynamic registration; never hard-coded in the engine.
 */

import type { EventProcessor } from "./contract";

export type ProcessorRegistry = {
  register(processor: EventProcessor): void;
  unregister(processorId: string): boolean;
  getById(processorId: string): EventProcessor | undefined;
  /** Resolve first processor that advertises the event type, or `*`. */
  resolve(eventType: string): EventProcessor | undefined;
  list(): readonly EventProcessor[];
  capabilities(): ReadonlyArray<{
    readonly processorId: string;
    readonly eventType: string;
  }>;
};

export function createProcessorRegistry(
  seed: readonly EventProcessor[] = [],
): ProcessorRegistry {
  const byId = new Map<string, EventProcessor>();

  function register(processor: EventProcessor): void {
    if (byId.has(processor.descriptor.processorId)) {
      throw new Error(
        `Processor already registered: ${processor.descriptor.processorId}`,
      );
    }
    byId.set(processor.descriptor.processorId, processor);
  }

  for (const p of seed) register(p);

  return {
    register,
    unregister(processorId) {
      return byId.delete(processorId);
    },
    getById(processorId) {
      return byId.get(processorId);
    },
    resolve(eventType) {
      for (const processor of byId.values()) {
        const caps = processor.descriptor.capabilities;
        if (caps.some((c) => c.eventType === eventType)) return processor;
      }
      for (const processor of byId.values()) {
        if (processor.descriptor.capabilities.some((c) => c.eventType === "*")) {
          return processor;
        }
      }
      return undefined;
    },
    list() {
      return [...byId.values()];
    },
    capabilities() {
      const rows: Array<{ processorId: string; eventType: string }> = [];
      for (const p of byId.values()) {
        for (const c of p.descriptor.capabilities) {
          rows.push({
            processorId: p.descriptor.processorId,
            eventType: c.eventType,
          });
        }
      }
      return rows;
    },
  };
}
