import type { AutomationHandler } from "./types";

export interface AutomationHandlerRegistry {
  register(handlerId: string, handler: AutomationHandler): void;
  get(handlerId: string): AutomationHandler | undefined;
  listIds(): readonly string[];
}

export function createAutomationHandlerRegistry(): AutomationHandlerRegistry {
  const handlers = new Map<string, AutomationHandler>();

  return {
    register(handlerId, handler) {
      const id = handlerId.trim();
      if (!id) {
        throw new Error("AUTOMATION_HANDLER_ID_REQUIRED");
      }
      handlers.set(id, handler);
    },
    get(handlerId) {
      return handlers.get(handlerId);
    },
    listIds() {
      return [...handlers.keys()];
    },
  };
}

/** Built-in journal handler — proves event-driven path without product engines. */
export const AUTOMATION_JOURNAL_HANDLER_ID = "automation.journal";

export function createAutomationJournalHandler(): AutomationHandler {
  return ({ envelope, registration }) => ({
    status: "succeeded",
    reason: "JOURNALED",
    details: {
      eventId: envelope.eventId,
      registrationKey: registration.key,
      actionKind: registration.actionKind,
    },
  });
}
