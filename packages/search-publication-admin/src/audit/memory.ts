import type { PublicationAdminAuditEntry } from "../types";
import type { PublicationAdminAuditStore } from "./port";

export function createInMemoryPublicationAdminAuditStore(): PublicationAdminAuditStore {
  const entries: PublicationAdminAuditEntry[] = [];
  let seq = 0;

  return {
    async append(input) {
      const entry: PublicationAdminAuditEntry = {
        id: input.id ?? `audit_${++seq}`,
        action: input.action,
        actorUserId: input.actorUserId,
        tenantId: input.tenantId,
        publicationId: input.publicationId,
        detail: input.detail,
        correlationId: input.correlationId,
        createdAt: input.createdAt ?? new Date().toISOString(),
      };
      entries.unshift(entry);
      return entry;
    },
    async list(input) {
      const limit = input?.limit ?? 100;
      return entries
        .filter((e) => !input?.tenantId || e.tenantId === input.tenantId)
        .slice(0, limit);
    },
  };
}
