import {
  createQepQualityIntelligence,
  type QepQualityIntelligenceFacade,
} from "@apzhub/qep-quality-intelligence";

let singleton: QepQualityIntelligenceFacade | undefined;

/**
 * Process-local Quality Intelligence Foundation runtime (APZQEP-163).
 * Integrates Automation/SCM/Evidence/QKI/Notifications via event hooks.
 */
export function getQepQiRuntime(): QepQualityIntelligenceFacade {
  if (!singleton) {
    const events: string[] = [];
    singleton = createQepQualityIntelligence({
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

export function resetQepQiRuntimeForTests(): void {
  singleton = undefined;
}
