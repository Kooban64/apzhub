import type {
  StoredVerification,
  VerificationListQuery,
  VerificationRepository,
} from "../../domain/verification/verification-repository";
import {
  VerificationConflictError,
  VerificationNotFoundError,
  VerificationRevisionConflictError,
} from "../../shared/errors";
import { toStoredVerification, verificationMatchesListFilters } from "../mappers/verification-mapper";

export type VerificationInMemoryStore = {
  readonly verifications: Map<string, StoredVerification>;
};

export function createEmptyVerificationStore(): VerificationInMemoryStore {
  return {
    verifications: new Map(),
  };
}

export function createInMemoryVerificationRepository(
  store: VerificationInMemoryStore,
): VerificationRepository {
  return {
    async create(verification) {
      if (store.verifications.has(verification.id)) {
        throw new VerificationConflictError(`Verification already exists: ${verification.id}`);
      }
      const stored = toStoredVerification(verification);
      store.verifications.set(verification.id, stored);
      return stored;
    },

    async get(tenantId, id) {
      const row = store.verifications.get(id);
      return row && row.tenantId === tenantId ? row : null;
    },

    async save(verification, expectedRevision) {
      const existing = store.verifications.get(verification.id);
      if (!existing || existing.tenantId !== verification.tenantId) {
        throw new VerificationNotFoundError(`Verification not found: ${verification.id}`);
      }
      if (existing.revision !== expectedRevision) {
        throw new VerificationRevisionConflictError(
          verification.id,
          expectedRevision,
          existing.revision,
        );
      }
      const stored = toStoredVerification(verification);
      store.verifications.set(verification.id, stored);
      return stored;
    },

    async list(tenantId, query: VerificationListQuery = {}) {
      const rows = [...store.verifications.values()]
        .filter((row) => row.tenantId === tenantId)
        .filter((row) => verificationMatchesListFilters(row, query))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      const offset = query.offset ?? 0;
      const limit = query.limit ?? rows.length;
      return rows.slice(offset, offset + limit);
    },

    async exists(tenantId, id) {
      const row = store.verifications.get(id);
      return Boolean(row && row.tenantId === tenantId);
    },

    async listHistory(tenantId, id) {
      const row = await this.get(tenantId, id);
      return row?.history.entries ?? [];
    },
  };
}
