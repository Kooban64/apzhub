import type {
  QepApplication,
  QepApplicationEnvironment,
  QepApplicationExecutionTarget,
  QepApplicationLegacyRef,
  QepApplicationRepositoryLink,
} from "../domain/types";
import type { ApplicationListFilter, ApplicationRepository } from "./repository";

export function createInMemoryApplicationRepository(): ApplicationRepository {
  const applications = new Map<string, QepApplication>();
  const repos = new Map<string, QepApplicationRepositoryLink>();
  const environments = new Map<string, QepApplicationEnvironment>();
  const targets = new Map<string, QepApplicationExecutionTarget>();
  const legacyRefs = new Map<string, QepApplicationLegacyRef>();

  function appKey(tenantId: string, id: string): string {
    return `${tenantId}:${id}`;
  }

  return {
    async get(tenantId, applicationId) {
      return applications.get(appKey(tenantId, applicationId));
    },
    async getByKey(tenantId, key) {
      for (const row of applications.values()) {
        if (row.tenantId === tenantId && row.key === key) return row;
      }
      return undefined;
    },
    async list(filter: ApplicationListFilter) {
      const q = filter.query?.trim().toLowerCase();
      return [...applications.values()]
        .filter((row) => row.tenantId === filter.tenantId)
        .filter((row) => (filter.includeArchived ? true : row.status !== "archived"))
        .filter((row) => (filter.status ? row.status === filter.status : true))
        .filter((row) =>
          filter.ownerUserId ? row.ownerUserId === filter.ownerUserId : true,
        )
        .filter((row) => {
          if (!q) return true;
          return (
            row.name.toLowerCase().includes(q) ||
            row.key.toLowerCase().includes(q) ||
            (row.description ?? "").toLowerCase().includes(q)
          );
        })
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async save(application) {
      applications.set(appKey(application.tenantId, application.id), application);
    },
    async listRepositoryLinks(tenantId, applicationId) {
      return [...repos.values()].filter(
        (row) => row.tenantId === tenantId && row.applicationId === applicationId,
      );
    },
    async attachRepository(link) {
      const existing = [...repos.values()].find(
        (row) =>
          row.applicationId === link.applicationId &&
          row.scmRepositoryId === link.scmRepositoryId,
      );
      if (existing) return;
      repos.set(link.id, link);
    },
    async listEnvironments(tenantId, applicationId) {
      return [...environments.values()].filter(
        (row) => row.tenantId === tenantId && row.applicationId === applicationId,
      );
    },
    async getEnvironment(tenantId, environmentId) {
      const row = environments.get(environmentId);
      return row?.tenantId === tenantId ? row : undefined;
    },
    async saveEnvironment(environment) {
      environments.set(environment.id, environment);
    },
    async listExecutionTargets(tenantId, applicationId) {
      return [...targets.values()].filter(
        (row) => row.tenantId === tenantId && row.applicationId === applicationId,
      );
    },
    async getExecutionTarget(tenantId, targetId) {
      const row = targets.get(targetId);
      return row?.tenantId === tenantId ? row : undefined;
    },
    async saveExecutionTarget(target) {
      targets.set(target.id, target);
    },
    async listLegacyRefs(tenantId) {
      return [...legacyRefs.values()].filter((row) => row.tenantId === tenantId);
    },
    async upsertLegacyRef(ref) {
      const key = `${ref.tenantId}:${ref.projectRef}`;
      const existing = legacyRefs.get(key);
      if (!existing) {
        legacyRefs.set(key, ref);
        return;
      }
      if (
        existing.applicationId &&
        ref.applicationId &&
        existing.applicationId !== ref.applicationId
      ) {
        return;
      }
      if (existing.applicationId && !ref.applicationId) {
        return;
      }
      legacyRefs.set(key, {
        ...existing,
        ...(ref.applicationId
          ? { applicationId: ref.applicationId, origin: ref.origin }
          : {}),
        updatedAt: ref.updatedAt,
      });
    },
  };
}
