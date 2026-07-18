import type { ProvisioningAuditEntry } from "./types";
import { createUuid } from "./uuid";

export type ProvisioningAuditSink = {
  record(entry: Omit<ProvisioningAuditEntry, "auditId" | "at"> & { at?: string }): void;
  list(limit?: number): readonly ProvisioningAuditEntry[];
  count(): number;
};

export function createInMemoryProvisioningAuditSink(): ProvisioningAuditSink {
  const entries: ProvisioningAuditEntry[] = [];

  return {
    record(entry) {
      entries.push({
        auditId: createUuid(),
        at: entry.at ?? new Date().toISOString(),
        action: entry.action,
        flowId: entry.flowId,
        detail: entry.detail,
        correlationId: entry.correlationId,
      });
    },
    list(limit = 50) {
      return entries.slice(-limit);
    },
    count() {
      return entries.length;
    },
  };
}
