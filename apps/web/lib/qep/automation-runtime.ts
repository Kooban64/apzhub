import { createQepAutomation, type QepAutomationFacade } from "@apzhub/qep-automation";

let singleton: QepAutomationFacade | undefined;

/**
 * Process-local Automation Foundation runtime (APZQEP-161).
 * Integrates with Evidence/QKI/Notifications via event hooks (no duplication).
 */
export function getQepAutomationRuntime(): QepAutomationFacade {
  if (!singleton) {
    const events: string[] = [];
    singleton = createQepAutomation({
      playwrightDryRun: process.env.APZHUB_AUTOMATION_LIVE !== "true",
      onEvent: (event) => {
        events.push(event.type);
        if (events.length > 500) {
          events.splice(0, events.length - 500);
        }
      },
      onEvidencePublished: async (record) => {
        // Evidence Platform / QKI / Reporting consumers attach via platform event bus later.
        // Wave 1 records evidence refs on the execution; no parallel evidence SoR.
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
