import type { RequirementAuditEntry } from "../../domain/repositories/requirement-audit-repository";
import type {
  AppendRequirementLifecycleHistoryInput,
  RequirementLifecycleHistoryEntry,
} from "../../domain/repositories/requirement-lifecycle-history-repository";
import type {
  RequirementArchiveOptions,
  RequirementListQuery,
  RequirementRepository,
} from "../../domain/repositories/requirement-repository";
import type { PersistedRequirement } from "../../domain/persisted-requirement";
import type { RequirementId } from "../../domain/value-objects/requirement-id";
import type {
  RequirementContentVersion,
} from "../../domain/content-version/requirement-content-version";
import type {
  RequirementContentVersionRepository,
} from "../../domain/repositories/requirement-content-version-repository";
import type { RequirementBaseline } from "../../domain/baseline/requirement-baseline";
import type { RequirementBaselineRepository } from "../../domain/baseline/requirement-baseline-repository";
import type {
  RelationshipTaxonomyRepository,
  RequirementsRelationshipRepository,
} from "../../domain/relationship/requirements-relationship-repository";
import { createRequirementStatus } from "../../domain/value-objects/requirement-status";
import {
  QepConflictError,
  QepNotFoundError,
  QepRevisionConflictError,
} from "../../shared/errors";
import {
  matchesRequirementSearch,
} from "../mappers/requirement-mapper";
import {
  createEmptyBaselineStore,
  createInMemoryRequirementBaselineRepository,
} from "./baseline-repository";
import {
  createEmptyRelationshipStore,
  createInMemoryRelationshipTaxonomyRepository,
  createInMemoryRequirementsRelationshipRepository,
  type RelationshipInMemoryStore,
} from "./relationship-repository";

export type QepRequirementsInMemoryStores = {
  readonly requirements: Map<string, PersistedRequirement>;
  readonly audits: Map<string, RequirementAuditEntry>;
  readonly lifecycleHistory: Map<string, RequirementLifecycleHistoryEntry>;
  readonly contentVersions: Map<string, RequirementContentVersion>;
  readonly baselines: Map<string, RequirementBaseline>;
  readonly relationships: RelationshipInMemoryStore;
};

export function createEmptyQepRequirementsInMemoryStores(): QepRequirementsInMemoryStores {
  return {
    requirements: new Map(),
    audits: new Map(),
    lifecycleHistory: new Map(),
    contentVersions: new Map(),
    baselines: createEmptyBaselineStore(),
    relationships: createEmptyRelationshipStore(),
  };
}

function scopedRequirements(
  store: Map<string, PersistedRequirement>,
  tenantId: string,
  includeArchived: boolean,
): PersistedRequirement[] {
  return [...store.values()].filter((row) => {
    if (row.tenantId !== tenantId) return false;
    if (!includeArchived && row.archivedAt) return false;
    return true;
  });
}

function applyListFilters(
  rows: PersistedRequirement[],
  query: RequirementListQuery,
): PersistedRequirement[] {
  return rows.filter((row) => {
    if (query.projectId && row.projectId !== query.projectId) return false;
    if (query.status && row.status !== query.status) return false;
    return true;
  });
}

export type QepRequirementsRepositories = {
  readonly requirements: RequirementRepository;
  readonly audits: {
    append(entry: RequirementAuditEntry): Promise<RequirementAuditEntry>;
    listByRequirement(
      tenantId: string,
      requirementId: RequirementId,
    ): Promise<readonly RequirementAuditEntry[]>;
  };
  readonly lifecycleHistory: {
    append(
      entry: AppendRequirementLifecycleHistoryInput,
    ): Promise<RequirementLifecycleHistoryEntry>;
    listByRequirement(
      tenantId: string,
      requirementId: RequirementId,
    ): Promise<readonly RequirementLifecycleHistoryEntry[]>;
  };
  readonly contentVersions: RequirementContentVersionRepository;
  readonly baselines: RequirementBaselineRepository;
  readonly relationships: RequirementsRelationshipRepository;
  readonly relationshipTaxonomy: RelationshipTaxonomyRepository;
};

export function createInMemoryQepRequirementsRepositories(
  stores: QepRequirementsInMemoryStores,
): QepRequirementsRepositories {
  const requirements: RequirementRepository = {
    async findById(tenantId, id) {
      const row = stores.requirements.get(id) ?? null;
      if (!row || row.tenantId !== tenantId) return null;
      return row;
    },

    async findByKey(tenantId, key) {
      const normalised = key.trim();
      for (const row of stores.requirements.values()) {
        if (row.tenantId === tenantId && row.key === normalised && !row.archivedAt) {
          return row;
        }
      }
      return null;
    },

    async list(tenantId, query) {
      return applyListFilters(
        scopedRequirements(stores.requirements, tenantId, query.includeArchived ?? false),
        query,
      );
    },

    async search(tenantId, query) {
      return scopedRequirements(
        stores.requirements,
        tenantId,
        query.includeArchived ?? false,
      ).filter((row) => {
        if (query.projectId && row.projectId !== query.projectId) return false;
        return matchesRequirementSearch(row, query.q);
      });
    },

    async create(record) {
      if (stores.requirements.has(record.id)) {
        throw new QepConflictError(`Requirement already exists: ${record.id}`);
      }
      const duplicate = await requirements.findByKey(record.tenantId, record.key);
      if (duplicate) {
        throw new QepConflictError(`Requirement key already exists: ${record.key}`);
      }
      stores.requirements.set(record.id, record);
      return record;
    },

    async update(record) {
      const existing = stores.requirements.get(record.id);
      if (!existing || existing.tenantId !== record.tenantId || existing.archivedAt) {
        throw new QepNotFoundError(`Requirement not found: ${record.id}`);
      }
      if (existing.revision !== record.revision) {
        throw new QepRevisionConflictError(record.id, record.revision, existing.revision);
      }
      const next = { ...record, revision: record.revision + 1 };
      stores.requirements.set(record.id, next);
      return next;
    },

    async archive(tenantId, id, options: RequirementArchiveOptions) {
      const existing = stores.requirements.get(id);
      if (!existing || existing.tenantId !== tenantId || existing.archivedAt) {
        throw new QepNotFoundError(`Requirement not found: ${id}`);
      }
      if (
        options.expectedRevision !== undefined &&
        existing.revision !== options.expectedRevision
      ) {
        throw new QepRevisionConflictError(
          id,
          options.expectedRevision,
          existing.revision,
        );
      }
      const archived: PersistedRequirement = {
        ...existing,
        status: createRequirementStatus("archived"),
        archivedAt: options.archivedAt,
        archivedBy: options.archivedBy,
        updatedAt: options.archivedAt,
        updatedBy: options.archivedBy,
        revision: existing.revision + 1,
      };
      stores.requirements.set(id, archived);
      return archived;
    },
  };

  const audits = {
    async append(entry: RequirementAuditEntry) {
      stores.audits.set(entry.id, entry);
      return entry;
    },

    async listByRequirement(tenantId: string, requirementId: RequirementId) {
      return [...stores.audits.values()]
        .filter(
          (entry) =>
            entry.tenantId === tenantId && entry.requirementId === requirementId,
        )
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
  };

  const lifecycleHistory = {
    async append(entry: AppendRequirementLifecycleHistoryInput) {
      const persisted: RequirementLifecycleHistoryEntry = {
        id: entry.id ?? `lh_${stores.lifecycleHistory.size + 1}`,
        tenantId: entry.tenantId,
        requirementId: entry.requirementId,
        previousState: entry.previousState,
        newState: entry.newState,
        action: entry.action,
        actorUserId: entry.actorUserId,
        reason: entry.reason,
        comments: entry.comments,
        correlationId: entry.correlationId,
        revision: entry.revision,
        metadataJson: entry.metadataJson,
        createdAt: entry.createdAt ?? new Date().toISOString(),
      };
      stores.lifecycleHistory.set(persisted.id, persisted);
      return persisted;
    },

    async listByRequirement(tenantId: string, requirementId: RequirementId) {
      return [...stores.lifecycleHistory.values()]
        .filter(
          (entry) =>
            entry.tenantId === tenantId && entry.requirementId === requirementId,
        )
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
  };

  const contentVersions: RequirementContentVersionRepository = {
    async append(version) {
      const duplicate = [...stores.contentVersions.values()].some(
        (item) =>
          item.tenantId === version.tenantId &&
          item.requirementId === version.requirementId &&
          item.versionNumber === version.versionNumber,
      );
      if (duplicate || stores.contentVersions.has(version.id)) {
        throw new QepConflictError("Requirement content version already exists");
      }
      stores.contentVersions.set(version.id, version);
      return version;
    },
    async getById(tenantId, id) {
      const version = stores.contentVersions.get(id);
      return version?.tenantId === tenantId ? version : null;
    },
    async getByRequirementAndNumber(tenantId, requirementId, versionNumber) {
      return (
        [...stores.contentVersions.values()].find(
          (version) =>
            version.tenantId === tenantId &&
            version.requirementId === requirementId &&
            version.versionNumber === versionNumber,
        ) ?? null
      );
    },
    async getLatest(tenantId, requirementId) {
      return [...stores.contentVersions.values()]
        .filter(
          (version) =>
            version.tenantId === tenantId && version.requirementId === requirementId,
        )
        .sort((a, b) => b.versionNumber - a.versionNumber)[0] ?? null;
    },
    async listMetadata(tenantId, requirementId, pagination = {}) {
      const offset = pagination.offset ?? 0;
      const limit = pagination.limit ?? Number.MAX_SAFE_INTEGER;
      return [...stores.contentVersions.values()]
        .filter(
          (version) =>
            version.tenantId === tenantId && version.requirementId === requirementId,
        )
        .sort((a, b) => b.versionNumber - a.versionNumber)
        .slice(offset, offset + limit)
        .map(({ snapshot: _snapshot, ...metadata }) => metadata);
    },
    async exists(tenantId, requirementId, versionNumber) {
      return (await contentVersions.getByRequirementAndNumber(
        tenantId,
        requirementId,
        versionNumber,
      )) !== null;
    },
  };

  const baselines = createInMemoryRequirementBaselineRepository(stores.baselines);
  const relationships = createInMemoryRequirementsRelationshipRepository(
    stores.relationships,
  );
  const relationshipTaxonomy = createInMemoryRelationshipTaxonomyRepository(
    stores.relationships,
  );

  return {
    requirements,
    audits,
    lifecycleHistory,
    contentVersions,
    baselines,
    relationships,
    relationshipTaxonomy,
  };
}
