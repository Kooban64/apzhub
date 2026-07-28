import {
  addRequirementBaselineItem,
  removeRequirementBaselineItem,
  type RequirementBaseline,
} from "../../domain/baseline/requirement-baseline";
import type { RequirementBaselineId } from "../../domain/baseline/requirement-baseline-id";
import type {
  RequirementBaselineListQuery,
  RequirementBaselineRepository,
} from "../../domain/baseline/requirement-baseline-repository";
import {
  QepBaselineArchivedError,
  QepBaselineAlreadyLockedError,
  QepBaselineDuplicateMembershipError,
  QepBaselineInvalidStateError,
  QepBaselineNotFoundError,
  QepConflictError,
} from "../../shared/errors";

export function createEmptyBaselineStore(): Map<string, RequirementBaseline> {
  return new Map();
}

function loadOwned(
  store: Map<string, RequirementBaseline>,
  tenantId: string,
  id: RequirementBaselineId,
): RequirementBaseline {
  const row = store.get(id);
  if (!row || row.tenantId !== tenantId) {
    throw new QepBaselineNotFoundError(`Requirement baseline not found: ${id}`);
  }
  return row;
}

function assertDraftMutable(baseline: RequirementBaseline): void {
  if (baseline.status === "locked") {
    throw new QepBaselineAlreadyLockedError();
  }
  if (baseline.status === "archived") {
    throw new QepBaselineArchivedError();
  }
}

export function createInMemoryRequirementBaselineRepository(
  store: Map<string, RequirementBaseline>,
): RequirementBaselineRepository {
  return {
    async createBaseline(baseline) {
      if (store.has(baseline.id)) {
        throw new QepConflictError(
          `Requirement baseline already exists: ${baseline.id}`,
        );
      }
      const numberTaken = [...store.values()].some(
        (row) => row.tenantId === baseline.tenantId && row.number === baseline.number,
      );
      if (numberTaken) {
        throw new QepConflictError(
          `Requirement baseline number already exists: ${baseline.number}`,
        );
      }
      store.set(baseline.id, baseline);
      return baseline;
    },

    async getBaseline(tenantId, id) {
      const row = store.get(id);
      return row && row.tenantId === tenantId ? row : null;
    },

    async updateDraftBaseline(baseline) {
      const existing = loadOwned(store, baseline.tenantId, baseline.id);
      if (existing.status !== "draft") {
        throw new QepBaselineInvalidStateError(
          "Only draft requirement baselines may be updated",
        );
      }
      store.set(baseline.id, baseline);
      return baseline;
    },

    async listBaselines(tenantId, query: RequirementBaselineListQuery = {}) {
      const rows = [...store.values()]
        .filter((row) => row.tenantId === tenantId)
        .filter((row) => !query.status || row.status === query.status)
        .sort((a, b) => a.number - b.number);
      const offset = query.offset ?? 0;
      const limit = query.limit ?? rows.length;
      return rows.slice(offset, offset + limit);
    },

    async addRequirementVersion(tenantId, id, item, changedAt, changedBy) {
      const existing = loadOwned(store, tenantId, id);
      assertDraftMutable(existing);
      const duplicate = existing.items.some(
        (row) =>
          row.contentVersionId === item.contentVersionId ||
          row.requirementId === item.requirementId,
      );
      if (duplicate) {
        throw new QepBaselineDuplicateMembershipError(
          "Requirement baseline already contains this requirement or content version",
        );
      }
      const updated = addRequirementBaselineItem(existing, item, changedAt, changedBy);
      store.set(id, updated);
      return updated;
    },

    async removeRequirementVersion(
      tenantId,
      id,
      contentVersionId,
      changedAt,
      changedBy,
    ) {
      const existing = loadOwned(store, tenantId, id);
      assertDraftMutable(existing);
      if (!existing.items.some((row) => row.contentVersionId === contentVersionId)) {
        throw new QepBaselineNotFoundError(
          `Requirement baseline item not found: ${contentVersionId}`,
        );
      }
      const updated = removeRequirementBaselineItem(
        existing,
        contentVersionId,
        changedAt,
        changedBy,
      );
      store.set(id, updated);
      return updated;
    },

    async lockBaseline(tenantId, id, integrity, lockedAt, lockedBy) {
      const existing = loadOwned(store, tenantId, id);
      if (existing.status === "locked") {
        throw new QepBaselineAlreadyLockedError();
      }
      if (existing.status === "archived") {
        throw new QepBaselineArchivedError();
      }
      if (existing.items.length === 0) {
        throw new QepBaselineInvalidStateError(
          "A baseline must contain at least one Requirement Content Version before it can be locked",
        );
      }
      const locked: RequirementBaseline = {
        ...existing,
        status: "locked",
        updatedAt: lockedAt,
        updatedBy: lockedBy,
        lockedAt,
        lockedBy,
        integrityFingerprint: integrity.fingerprint,
        integrityAlgorithm: integrity.algorithm,
        integritySchemaVersion: integrity.schemaVersion,
        integrityVerificationStatus: integrity.verificationStatus,
        integrityVerifiedAt: integrity.verifiedAt,
      };
      store.set(id, locked);
      return locked;
    },

    async recordIntegrityVerification(tenantId, id, verification) {
      const existing = loadOwned(store, tenantId, id);
      if (existing.status === "draft") {
        throw new QepBaselineInvalidStateError(
          "Only locked or archived requirement baselines can be integrity-verified",
        );
      }
      const updated: RequirementBaseline = {
        ...existing,
        integrityVerificationStatus: verification.verificationStatus,
        integrityVerifiedAt: verification.verifiedAt,
      };
      store.set(id, updated);
      return updated;
    },

    async archiveBaseline(tenantId, id, archivedAt, archivedBy) {
      const existing = loadOwned(store, tenantId, id);
      if (existing.status === "archived") {
        throw new QepBaselineArchivedError();
      }
      if (existing.status !== "locked") {
        throw new QepBaselineInvalidStateError(
          "Only locked requirement baselines may be archived",
        );
      }
      const archived: RequirementBaseline = {
        ...existing,
        status: "archived",
        updatedAt: archivedAt,
        updatedBy: archivedBy,
        archivedAt,
        archivedBy,
      };
      store.set(id, archived);
      return archived;
    },

    async baselineExists(tenantId, id) {
      const row = store.get(id);
      return Boolean(row && row.tenantId === tenantId);
    },

    async baselineNumberExists(tenantId, number) {
      return [...store.values()].some(
        (row) => row.tenantId === tenantId && row.number === number,
      );
    },

    async listBaselineItems(tenantId, id) {
      return loadOwned(store, tenantId, id).items;
    },

    async nextBaselineNumber(tenantId) {
      const numbers = [...store.values()]
        .filter((row) => row.tenantId === tenantId)
        .map((row) => row.number as number);
      return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    },

    async listBaselinesForRequirement(tenantId, requirementId) {
      return [...store.values()]
        .filter(
          (row) =>
            row.tenantId === tenantId &&
            row.items.some((item) => item.requirementId === requirementId),
        )
        .sort((a, b) => a.number - b.number);
    },
  };
}
