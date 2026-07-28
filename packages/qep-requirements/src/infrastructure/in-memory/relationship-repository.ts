import type { Relationship } from "../../domain/relationship/relationship";
import type { RelationshipId } from "../../domain/relationship/relationship-id";
import type { RelationshipEdgeFact } from "../../domain/relationship/relationship-policy";
import type {
  RelationshipListQuery,
  RelationshipTaxonomyRepository,
  RequirementsRelationshipRepository,
  StoredRequirementsRelationship,
} from "../../domain/relationship/requirements-relationship-repository";
import {
  NORMATIVE_RELATIONSHIP_TAXONOMY,
  type RelationshipTaxonomyDefinition,
} from "../../domain/relationship/relationship-taxonomy";
import type { RelationshipType } from "../../domain/relationship/relationship-type";
import {
  QepConflictError,
  QepRelationshipNotFoundError,
  QepRevisionConflictError,
} from "../../shared/errors";
import {
  computeRelationshipDuplicateKey,
  relationshipMatchesListFilters,
  toStoredRelationship,
} from "../mappers/relationship-mapper";

export type RelationshipInMemoryStore = {
  readonly relationships: Map<string, StoredRequirementsRelationship>;
  readonly taxonomyByTenant: Map<string, Map<string, RelationshipTaxonomyDefinition>>;
};

export function createEmptyRelationshipStore(): RelationshipInMemoryStore {
  return {
    relationships: new Map(),
    taxonomyByTenant: new Map(),
  };
}

function assertNoActiveDuplicate(
  store: Map<string, StoredRequirementsRelationship>,
  candidate: Relationship,
  excludeId?: string,
): void {
  if (
    candidate.lifecycleState !== "active" &&
    candidate.lifecycleState !== "deprecated"
  ) {
    return;
  }
  const key = computeRelationshipDuplicateKey(candidate);
  for (const row of store.values()) {
    if (row.tenantId !== candidate.tenantId) continue;
    if (excludeId && row.id === excludeId) continue;
    if (row.lifecycleState !== "active" && row.lifecycleState !== "deprecated")
      continue;
    if (computeRelationshipDuplicateKey(row) === key) {
      throw new QepConflictError(
        "Duplicate relationship for the same type, endpoints, and scope is not allowed",
      );
    }
  }
}

export function createInMemoryRequirementsRelationshipRepository(
  store: RelationshipInMemoryStore,
): RequirementsRelationshipRepository {
  return {
    async create(relationship) {
      if (store.relationships.has(relationship.id)) {
        throw new QepConflictError(`Relationship already exists: ${relationship.id}`);
      }
      assertNoActiveDuplicate(store.relationships, relationship);
      const stored = toStoredRelationship(relationship, 1);
      store.relationships.set(relationship.id, stored);
      return stored;
    },

    async get(tenantId, id) {
      const row = store.relationships.get(id);
      return row && row.tenantId === tenantId ? row : null;
    },

    async save(relationship, expectedRevision) {
      const existing = store.relationships.get(relationship.id);
      if (!existing || existing.tenantId !== relationship.tenantId) {
        throw new QepRelationshipNotFoundError(
          `Relationship not found: ${relationship.id}`,
        );
      }
      if (existing.revision !== expectedRevision) {
        throw new QepRevisionConflictError(
          relationship.id,
          expectedRevision,
          existing.revision,
        );
      }
      assertNoActiveDuplicate(store.relationships, relationship, relationship.id);
      const nextHistory =
        relationship.history.length >= existing.history.length
          ? relationship.history
          : existing.history;
      const stored = toStoredRelationship(
        { ...relationship, history: nextHistory, domainEvents: [] },
        existing.revision + 1,
      );
      store.relationships.set(relationship.id, stored);
      return stored;
    },

    async list(tenantId, query: RelationshipListQuery = {}) {
      const rows = [...store.relationships.values()]
        .filter((row) => row.tenantId === tenantId)
        .filter((row) => relationshipMatchesListFilters(row, query))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      const offset = query.offset ?? 0;
      const limit = query.limit ?? rows.length;
      return rows.slice(offset, offset + limit);
    },

    async listEdgeFacts(tenantId, options = {}) {
      const facts: RelationshipEdgeFact[] = [];
      for (const row of store.relationships.values()) {
        if (row.tenantId !== tenantId) continue;
        if (options.excludeRelationshipId && row.id === options.excludeRelationshipId) {
          continue;
        }
        if (options.types && !options.types.includes(row.type)) continue;
        facts.push({
          relationshipId: row.id,
          type: row.type,
          source: row.direction.source,
          target: row.direction.target,
          scope: row.scope,
          lifecycleState: row.lifecycleState,
        });
      }
      return facts;
    },

    async exists(tenantId, id) {
      const row = store.relationships.get(id);
      return Boolean(row && row.tenantId === tenantId);
    },

    async listHistory(tenantId, id) {
      const row = await this.get(tenantId, id);
      return row?.history ?? [];
    },
  };
}

export function createInMemoryRelationshipTaxonomyRepository(
  store: RelationshipInMemoryStore,
): RelationshipTaxonomyRepository {
  async function ensureSeeded(tenantId: string): Promise<void> {
    if (store.taxonomyByTenant.has(tenantId)) return;
    const map = new Map<string, RelationshipTaxonomyDefinition>();
    for (const definition of NORMATIVE_RELATIONSHIP_TAXONOMY) {
      map.set(definition.type, definition);
    }
    store.taxonomyByTenant.set(tenantId, map);
  }

  return {
    ensureSeeded,
    async list(tenantId) {
      await ensureSeeded(tenantId);
      return [...(store.taxonomyByTenant.get(tenantId)?.values() ?? [])];
    },
    async get(tenantId, type: RelationshipType) {
      await ensureSeeded(tenantId);
      return store.taxonomyByTenant.get(tenantId)?.get(type) ?? null;
    },
  };
}

export type { RelationshipId };
