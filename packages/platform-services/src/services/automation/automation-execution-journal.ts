/**
 * Automation execution journal port (APZHUB-1.1-004 / APZHUB-ENG-0001).
 * In-memory for tests; PostgreSQL is the production System of Record (R12-PERSIST-01).
 */

import type { AutomationExecutionRecord } from "./types";

export interface AutomationExecutionJournal {
  record(entry: AutomationExecutionRecord): Promise<void>;
  hasProcessed(envelopeId: string, registrationId: string): Promise<boolean>;
  list(filter?: {
    readonly envelopeId?: string;
    readonly registrationId?: string;
    readonly eventId?: string;
  }): Promise<readonly AutomationExecutionRecord[]>;
}

let executionSeq = 0;

export function nextAutomationExecutionId(): string {
  executionSeq += 1;
  return `auto_exec_${String(executionSeq).padStart(8, "0")}`;
}

/** Test helper */
export function resetAutomationExecutionSeq(): void {
  executionSeq = 0;
}

export function createInMemoryAutomationExecutionJournal(): AutomationExecutionJournal {
  const rows: AutomationExecutionRecord[] = [];
  const processed = new Set<string>();

  function idempotencyKey(envelopeId: string, registrationId: string): string {
    return `${envelopeId}::${registrationId}`;
  }

  return {
    async record(entry) {
      rows.push(entry);
      processed.add(idempotencyKey(entry.envelopeId, entry.registrationId));
    },
    async hasProcessed(envelopeId, registrationId) {
      return processed.has(idempotencyKey(envelopeId, registrationId));
    },
    async list(filter) {
      return rows.filter((row) => {
        if (filter?.envelopeId && row.envelopeId !== filter.envelopeId) {
          return false;
        }
        if (filter?.registrationId && row.registrationId !== filter.registrationId) {
          return false;
        }
        if (filter?.eventId && row.eventId !== filter.eventId) {
          return false;
        }
        return true;
      });
    },
  };
}
