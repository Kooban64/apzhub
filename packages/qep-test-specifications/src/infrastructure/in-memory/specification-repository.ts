import type {
  StoredTestSpecification,
  TestSpecificationListQuery,
  TestSpecificationRepository,
} from "../../domain/test-specification/specification-repository";
import {
  TestSpecificationConflictError,
  TestSpecificationNotFoundError,
  TestSpecificationRevisionConflictError,
} from "../../shared/errors";
import {
  matchesListFilters,
  toStoredTestSpecification,
} from "../mappers/specification-mapper";

export type TestSpecificationInMemoryStore = {
  readonly specifications: Map<string, StoredTestSpecification>;
  readonly numbersById: Map<string, string>;
};

export function createEmptyTestSpecificationStore(): TestSpecificationInMemoryStore {
  return {
    specifications: new Map(),
    numbersById: new Map(),
  };
}

export function createInMemoryTestSpecificationRepository(
  store: TestSpecificationInMemoryStore,
): TestSpecificationRepository {
  return {
    async create(specification) {
      const id = specification.record.id;
      if (store.specifications.has(id)) {
        throw new TestSpecificationConflictError(
          `Test Specification already exists: ${id}`,
        );
      }
      const stored = toStoredTestSpecification(specification);
      store.specifications.set(id, stored);
      store.numbersById.set(id, stored.record.number);
      return stored;
    },

    async get(tenantId, id) {
      const row = store.specifications.get(id);
      return row && row.tenantId === tenantId ? row : null;
    },

    async save(specification, expectedRevision) {
      const existing = store.specifications.get(specification.record.id);
      if (!existing || existing.tenantId !== specification.tenantId) {
        throw new TestSpecificationNotFoundError(
          `Test Specification not found: ${specification.record.id}`,
        );
      }
      if (existing.revision !== expectedRevision) {
        throw new TestSpecificationRevisionConflictError(
          specification.record.id,
          expectedRevision,
          existing.revision,
        );
      }
      const stored = toStoredTestSpecification(specification);
      store.specifications.set(specification.record.id, stored);
      store.numbersById.set(specification.record.id, stored.record.number);
      return stored;
    },

    async list(tenantId, query: TestSpecificationListQuery = {}) {
      const rows = [...store.specifications.values()]
        .filter((row) => row.tenantId === tenantId)
        .filter((row) => matchesListFilters(row, query))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      const offset = query.offset ?? 0;
      const limit = query.limit ?? rows.length;
      return rows.slice(offset, offset + limit);
    },

    async exists(tenantId, id) {
      const row = store.specifications.get(id);
      return Boolean(row && row.tenantId === tenantId);
    },

    async listHistory(tenantId, id) {
      const row = await this.get(tenantId, id);
      return row?.history.entries ?? [];
    },

    async listVersionsByNumber(tenantId, number) {
      return [...store.specifications.values()]
        .filter((row) => row.tenantId === tenantId && row.record.number === number)
        .sort((a, b) => {
          if (a.record.version.major !== b.record.version.major) {
            return b.record.version.major - a.record.version.major;
          }
          return b.record.version.minor - a.record.version.minor;
        });
    },

    async findLatestApprovedByNumber(tenantId, number) {
      const versions = await this.listVersionsByNumber(tenantId, number);
      return (
        versions.find(
          (row) => row.record.status === "approved" && row.record.isAuthoritative,
        ) ??
        versions.find((row) => row.record.status === "approved") ??
        null
      );
    },

    async listRelationships(tenantId, id) {
      const row = await this.get(tenantId, id);
      return row?.relationships ?? [];
    },
  };
}
