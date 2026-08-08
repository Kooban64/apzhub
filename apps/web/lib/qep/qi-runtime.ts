import {
  createQepQualityIntelligence,
  createQiPersistence,
  type QepQualityIntelligenceFacade,
} from "@apzhub/qep-quality-intelligence";

import { resolveQiPersistence } from "@/lib/qep/persistence/resolve-qi-persistence";

let singleton: QepQualityIntelligenceFacade | undefined;

/**
 * Quality Intelligence Foundation runtime (APZQEP-163 / QX-PR-03).
 * Production defaults to PostgreSQL IntelligenceStore (fail-closed).
 */
export function getQepQiRuntime(): QepQualityIntelligenceFacade {
  if (!singleton) {
    const persistence = resolveQiPersistence();
    const store = createQiPersistence({
      mode: persistence.mode,
      db: persistence.db,
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    const events: string[] = [];
    singleton = createQepQualityIntelligence({
      store,
      onEvent: (event) => {
        events.push(event.type);
        if (events.length > 500) {
          events.splice(0, events.length - 500);
        }
      },
      onQiEvent: async (event) => {
        void event.type;
      },
    });
  }
  return singleton;
}

/** Test helper — reset singleton between suites. */
export function resetQepQiRuntimeForTests(): void {
  singleton = undefined;
}
