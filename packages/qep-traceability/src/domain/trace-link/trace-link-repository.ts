import type { TraceHistoryEntry } from "./trace-history";
import type { TraceId } from "./trace-id";
import type { TraceLifecycleState } from "./trace-lifecycle-state";
import type { TraceEdgeFact } from "./trace-policy";
import type { TraceTaxonomyDefinition } from "./trace-taxonomy";
import type { TraceLink } from "./trace-link";
import type { TraceType } from "./trace-type";

/**
 * Persisted aggregate: domain TraceLink (which already tracks its own revision).
 * domainEvents are never persisted; loaded aggregates always have an empty list.
 */
export type StoredTraceLink = Omit<TraceLink, "domainEvents"> & {
  readonly domainEvents: readonly [];
};

export type TraceListQuery = {
  readonly type?: TraceType;
  readonly lifecycleState?: TraceLifecycleState;
  readonly sourceKind?: string;
  readonly sourceArtefactId?: string;
  readonly targetKind?: string;
  readonly targetArtefactId?: string;
  /** Matches either source or target artefactId, honouring `direction`. */
  readonly artefactId?: string;
  readonly direction?: "inbound" | "outbound" | "both";
  readonly scopeReferenceId?: string;
  readonly limit?: number;
  readonly offset?: number;
};

/**
 * Persistence boundary for Trace Links (APZQEP-ENG-030A Part 2 / ARCH-007).
 * Delete / restore are intentionally absent — retire / supersede are the only
 * terminal transitions and history is append-only.
 */
export interface TraceLinkRepository {
  create(trace: TraceLink): Promise<StoredTraceLink>;
  get(tenantId: string, id: TraceId): Promise<StoredTraceLink | null>;
  /**
   * Persist a mutated aggregate. Requires `expectedRevision` for optimistic concurrency
   * (the revision the aggregate had before the mutation being persisted).
   */
  save(trace: TraceLink, expectedRevision: number): Promise<StoredTraceLink>;
  list(tenantId: string, query?: TraceListQuery): Promise<readonly StoredTraceLink[]>;
  listEdgeFacts(
    tenantId: string,
    options?: {
      readonly excludeTraceId?: string;
      readonly types?: readonly TraceType[];
    },
  ): Promise<readonly TraceEdgeFact[]>;
  exists(tenantId: string, id: TraceId): Promise<boolean>;
  listHistory(tenantId: string, id: TraceId): Promise<readonly TraceHistoryEntry[]>;
}

export interface TraceTaxonomyRepository {
  list(tenantId: string): Promise<readonly TraceTaxonomyDefinition[]>;
  get(tenantId: string, type: TraceType): Promise<TraceTaxonomyDefinition | null>;
  /** Ensures normative taxonomy display rows exist for the tenant (idempotent seed). */
  ensureSeeded(tenantId: string): Promise<void>;
}
