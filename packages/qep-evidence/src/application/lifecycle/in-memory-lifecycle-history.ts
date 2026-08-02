import type {
  EvidenceLifecycleHistoryRecord,
  EvidenceLifecycleHistoryRepository,
} from "../../domain/ports/lifecycle-history";
import type { PageRequest } from "../../domain/ports/repositories";

export function createInMemoryLifecycleHistoryRepository(): EvidenceLifecycleHistoryRepository & {
  readonly records: EvidenceLifecycleHistoryRecord[];
} {
  const records: EvidenceLifecycleHistoryRecord[] = [];
  return {
    portId: "EvidenceLifecycleHistoryRepository",
    records,
    async append(record) {
      records.push(record);
    },
    async listByEvidence(tenantId, evidenceId, page: PageRequest = {}) {
      const items = records.filter(
        (r) => r.tenantId === tenantId && r.evidenceId === evidenceId,
      );
      const offset = page.offset ?? 0;
      const limit = page.limit ?? items.length;
      return {
        items: items.slice(offset, offset + limit),
        total: items.length,
        limit,
        offset,
      };
    },
  };
}
