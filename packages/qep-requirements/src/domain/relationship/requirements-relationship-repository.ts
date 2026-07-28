import type { RelationshipTaxonomyDefinition } from "./relationship-taxonomy";
import type { RelationshipLifecycleState } from "./relationship-lifecycle-state";
import type { RelationshipType } from "./relationship-type";
import type { Relationship, RelationshipHistoryEntry } from "./relationship";
import type { RelationshipId } from "./relationship-id";

/**
 * Persisted aggregate: domain Relationship plus optimistic concurrency revision.
 * domainEvents are never persisted; loaded aggregates always have an empty list.
 */
export type StoredRequirementsRelationship = Omit<Relationship, "domainEvents"> & {
  readonly revision: number;
  readonly domainEvents: readonly [];
};

export type RelationshipListQuery = {
  readonly type?: RelationshipType;
  readonly lifecycleState?: RelationshipLifecycleState;
  readonly requirementId?: string;
  readonly direction?: "inbound" | "outbound" | "both";
  readonly baselineId?: string;
  readonly contentVersionId?: string;
  readonly conflictsOnly?: boolean;
  readonly supersessionOnly?: boolean;
  readonly limit?: number;
  readonly offset?: number;
};

/**
 * Persistence boundary for Requirements Relationships (APZQEP-ENG-020F Part 2).
 * Delete / restore are intentionally absent.
 */
export interface RequirementsRelationshipRepository {
  create(relationship: Relationship): Promise<StoredRequirementsRelationship>;
  get(
    tenantId: string,
    id: RelationshipId,
  ): Promise<StoredRequirementsRelationship | null>;
  /**
   * Persist a mutated aggregate. Requires `expectedRevision` for optimistic concurrency.
   * Appends any new history entries beyond what is already stored.
   */
  save(
    relationship: Relationship,
    expectedRevision: number,
  ): Promise<StoredRequirementsRelationship>;
  list(
    tenantId: string,
    query?: RelationshipListQuery,
  ): Promise<readonly StoredRequirementsRelationship[]>;
  listEdgeFacts(
    tenantId: string,
    options?: {
      readonly excludeRelationshipId?: string;
      readonly types?: readonly RelationshipType[];
    },
  ): Promise<readonly import("./relationship-policy").RelationshipEdgeFact[]>;
  exists(tenantId: string, id: RelationshipId): Promise<boolean>;
  listHistory(
    tenantId: string,
    id: RelationshipId,
  ): Promise<readonly RelationshipHistoryEntry[]>;
}

export interface RelationshipTaxonomyRepository {
  list(tenantId: string): Promise<readonly RelationshipTaxonomyDefinition[]>;
  get(
    tenantId: string,
    type: RelationshipType,
  ): Promise<RelationshipTaxonomyDefinition | null>;
  /** Ensures normative taxonomy rows exist for the tenant (idempotent seed). */
  ensureSeeded(tenantId: string): Promise<void>;
}
