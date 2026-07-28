import type { PersistedRequirement } from "../persisted-requirement";
import type { RequirementId } from "../value-objects/requirement-id";

export type RequirementListQuery = {
  readonly projectId?: string;
  readonly status?: string;
  readonly includeArchived?: boolean;
  readonly limit?: number;
  readonly offset?: number;
};

export type RequirementSearchQuery = {
  readonly q: string;
  readonly projectId?: string;
  readonly includeArchived?: boolean;
  readonly limit?: number;
  readonly offset?: number;
};

export type RequirementArchiveOptions = {
  readonly archivedBy: string;
  readonly archivedAt: string;
  readonly expectedRevision?: number;
};

/** Persistence port — infrastructure implementations in ENG-020B. */
export interface RequirementRepository {
  findById(tenantId: string, id: RequirementId): Promise<PersistedRequirement | null>;
  findByKey(tenantId: string, key: string): Promise<PersistedRequirement | null>;
  list(
    tenantId: string,
    query: RequirementListQuery,
  ): Promise<readonly PersistedRequirement[]>;
  search(
    tenantId: string,
    query: RequirementSearchQuery,
  ): Promise<readonly PersistedRequirement[]>;
  create(record: PersistedRequirement): Promise<PersistedRequirement>;
  update(record: PersistedRequirement): Promise<PersistedRequirement>;
  archive(
    tenantId: string,
    id: RequirementId,
    options: RequirementArchiveOptions,
  ): Promise<PersistedRequirement>;
}
