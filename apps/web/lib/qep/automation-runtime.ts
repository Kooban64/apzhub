import {
  createQepAutomation,
  createAutomationPersistence,
  type QepAutomationFacade,
} from "@apzhub/qep-automation";

import { resolveAutomationPersistence } from "@/lib/qep/persistence/resolve-automation-persistence";

let singleton: QepAutomationFacade | undefined;

/**
 * Automation Foundation runtime (APZQEP-161 / QX-PR-01).
 * Production defaults to PostgreSQL ExecutionStore (fail-closed).
 */
export function getQepAutomationRuntime(): QepAutomationFacade {
  if (!singleton) {
    const persistence = resolveAutomationPersistence();
    const store = createAutomationPersistence({
      mode: persistence.mode,
      db: persistence.db,
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    const events: string[] = [];
    singleton = createQepAutomation({
      store,
      playwrightDryRun: process.env.APZHUB_AUTOMATION_LIVE !== "true",
      onEvent: (event) => {
        events.push(event.type);
        if (events.length > 500) {
          events.splice(0, events.length - 500);
        }
      },
      onEvidencePublished: async (record) => {
        void record.evidenceRefs;
      },
    });
  }
  return singleton;
}

/** Test helper — reset singleton between suites. */
export function resetQepAutomationRuntimeForTests(): void {
  singleton = undefined;
}
