import { randomUUID } from "node:crypto";

import type { AiProposalRecord } from "../domain/types";
import type { AiProposalRepository } from "./repository";

function key(tenantId: string, id: string): string {
  return `${tenantId}:${id}`;
}

export function newAiId(prefix: string): string {
  return `${prefix}_${randomUUID().replaceAll("-", "")}`;
}

export function createInMemoryAiProposalRepository(): AiProposalRepository {
  const rows = new Map<string, AiProposalRecord>();
  return {
    async save(row) {
      rows.set(key(row.tenantId, row.id), row);
    },
    async get(tenantId, id) {
      return rows.get(key(tenantId, id));
    },
    async list(tenantId, applicationId) {
      return [...rows.values()]
        .filter(
          (row) => row.tenantId === tenantId && row.applicationId === applicationId,
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
  };
}
