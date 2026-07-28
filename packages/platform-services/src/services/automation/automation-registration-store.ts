import type { AutomationRegistration, RegisterAutomationInput } from "./types";

export interface AutomationRegistrationStore {
  register(input: RegisterAutomationInput): AutomationRegistration;
  getById(id: string): AutomationRegistration | undefined;
  getByKey(key: string): AutomationRegistration | undefined;
  list(filter?: {
    readonly tenantId?: string;
    readonly enabledOnly?: boolean;
  }): readonly AutomationRegistration[];
  setEnabled(key: string, enabled: boolean): AutomationRegistration | undefined;
}

let registrationSeq = 0;

function nextRegistrationId(): string {
  registrationSeq += 1;
  return `auto_reg_${String(registrationSeq).padStart(8, "0")}`;
}

/** Test helper */
export function resetAutomationRegistrationSeq(): void {
  registrationSeq = 0;
}

export function createInMemoryAutomationRegistrationStore(): AutomationRegistrationStore {
  const byKey = new Map<string, AutomationRegistration>();
  const byId = new Map<string, AutomationRegistration>();

  return {
    register(input) {
      const key = input.key.trim();
      if (!key) {
        throw new Error("AUTOMATION_KEY_REQUIRED");
      }
      const eventPattern = input.eventPattern.trim();
      if (!eventPattern) {
        throw new Error("AUTOMATION_EVENT_PATTERN_REQUIRED");
      }
      const actionRef = input.actionRef.trim();
      if (!actionRef) {
        throw new Error("AUTOMATION_ACTION_REF_REQUIRED");
      }

      const existing = byKey.get(key);
      const now = new Date().toISOString();
      const registration: AutomationRegistration = {
        id: existing?.id ?? nextRegistrationId(),
        key,
        eventPattern,
        actionKind: input.actionKind,
        actionRef,
        enabled: input.enabled ?? true,
        tenantId: input.tenantId,
        description: input.description,
        metadata: input.metadata,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      byKey.set(key, registration);
      byId.set(registration.id, registration);
      return registration;
    },

    getById(id) {
      return byId.get(id);
    },

    getByKey(key) {
      return byKey.get(key);
    },

    list(filter) {
      return [...byKey.values()].filter((row) => {
        if (filter?.enabledOnly && !row.enabled) {
          return false;
        }
        if (
          filter?.tenantId !== undefined &&
          row.tenantId !== undefined &&
          row.tenantId !== filter.tenantId
        ) {
          return false;
        }
        return true;
      });
    },

    setEnabled(key, enabled) {
      const existing = byKey.get(key);
      if (!existing) {
        return undefined;
      }
      const updated: AutomationRegistration = {
        ...existing,
        enabled,
        updatedAt: new Date().toISOString(),
      };
      byKey.set(key, updated);
      byId.set(updated.id, updated);
      return updated;
    },
  };
}
