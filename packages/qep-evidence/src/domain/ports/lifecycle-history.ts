/**
 * Lifecycle transition history port — APZQEP-120-S06.
 * Append-only through normal application operations.
 */

import type { Page, PageRequest } from "./repositories";

export type EvidenceLifecycleHistoryRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly evidenceId: string;
  readonly projectId?: string;
  readonly workspaceId?: string;
  readonly sourceState: string;
  readonly targetState: string;
  readonly action: string;
  readonly reasonCode: string;
  readonly reasonText?: string;
  readonly actorId: string;
  readonly actorType: string;
  readonly occurredAt: string;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly revisionBefore?: number;
  readonly revisionAfter?: number;
  readonly policyDecision?: Readonly<Record<string, unknown>>;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type EvidenceLifecycleHistoryRepository = {
  readonly portId: "EvidenceLifecycleHistoryRepository";
  append(record: EvidenceLifecycleHistoryRecord): Promise<void>;
  listByEvidence(
    tenantId: string,
    evidenceId: string,
    page?: PageRequest,
  ): Promise<Page<EvidenceLifecycleHistoryRecord>>;
};
