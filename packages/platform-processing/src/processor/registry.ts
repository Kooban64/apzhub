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
  /**
   * Resolve all processors for an event type (exact matches, else `*`).
   * Additive — enables product bundles (Evidence + Knowledge Index) to share events.
   */
  resolveAll(eventType: string): readonly EventProcessor[];
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
      return this.resolveAll(eventType)[0];
    },
    resolveAll(eventType) {
      const exact: EventProcessor[] = [];
      const wild: EventProcessor[] = [];
      for (const processor of byId.values()) {
        const caps = processor.descriptor.capabilities;
        if (caps.some((c) => c.eventType === eventType)) {
          exact.push(processor);
        } else if (caps.some((c) => c.eventType === "*")) {
          wild.push(processor);
        }
      }
      return exact.length > 0 ? exact : wild;
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
