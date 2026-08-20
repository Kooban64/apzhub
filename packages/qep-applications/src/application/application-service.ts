import { randomUUID } from "node:crypto";

import {
  assertNoRawSecrets,
  isApplicationStatus,
  normaliseApplicationKey,
} from "../domain/guards";
import type {
  ApplicationStatus,
  CreateApplicationInput,
  CreateEnvironmentInput,
  CreateExecutionTargetInput,
  EnvironmentCategory,
  ExecutionTargetStatus,
  QepApplication,
  QepApplicationEnvironment,
  QepApplicationExecutionTarget,
  QepApplicationLegacyRef,
  QepApplicationRepositoryLink,
  UpdateApplicationInput,
} from "../domain/types";
import { EXECUTION_TARGET_TYPES } from "../domain/types";
import type { ApplicationListFilter, ApplicationRepository } from "./repository";
import { mergeDeterministicLegacyClaims } from "../domain/application-context-resolver";

const ENV_CATEGORIES: readonly EnvironmentCategory[] = [
  "development",
  "test",
  "staging",
  "production",
  "custom",
];

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

export type ApplicationService = {
  create(input: CreateApplicationInput): Promise<QepApplication>;
  list(filter: ApplicationListFilter): Promise<readonly QepApplication[]>;
  get(tenantId: string, applicationId: string): Promise<QepApplication>;
  update(
    tenantId: string,
    applicationId: string,
    actorId: string,
    patch: UpdateApplicationInput,
  ): Promise<QepApplication>;
  archive(
    tenantId: string,
    applicationId: string,
    actorId: string,
  ): Promise<QepApplication>;
  attachRepository(
    tenantId: string,
    applicationId: string,
    scmRepositoryId: string,
    actorId: string,
  ): Promise<QepApplicationRepositoryLink>;
  listRepositories(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly QepApplicationRepositoryLink[]>;
  createEnvironment(
    tenantId: string,
    applicationId: string,
    input: CreateEnvironmentInput,
  ): Promise<QepApplicationEnvironment>;
  listEnvironments(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly QepApplicationEnvironment[]>;
  getEnvironment(
    tenantId: string,
    applicationId: string,
    environmentId: string,
  ): Promise<QepApplicationEnvironment>;
  createExecutionTarget(
    tenantId: string,
    applicationId: string,
    input: CreateExecutionTargetInput,
  ): Promise<QepApplicationExecutionTarget>;
  listExecutionTargets(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly QepApplicationExecutionTarget[]>;
  getExecutionTarget(
    tenantId: string,
    applicationId: string,
    targetId: string,
  ): Promise<QepApplicationExecutionTarget>;
  syncDeterministicLegacyMappings(tenantId: string): Promise<void>;
  recordObservedProjectRefs(
    tenantId: string,
    projectRefs: readonly string[],
  ): Promise<void>;
  listLegacyRefs(tenantId: string): Promise<readonly QepApplicationLegacyRef[]>;
};

export function createApplicationService(
  repository: ApplicationRepository,
): ApplicationService {
  async function requireApp(
    tenantId: string,
    applicationId: string,
  ): Promise<QepApplication> {
    const app = await repository.get(tenantId, applicationId);
    if (!app || app.tenantId !== tenantId) {
      throw new Error("application.not_found");
    }
    return app;
  }

  async function syncDeterministicLegacyMappings(tenantId: string): Promise<void> {
    const applications = await repository.list({ tenantId, includeArchived: true });
    const claims = mergeDeterministicLegacyClaims(applications);
    const timestamp = nowIso();
    for (const claim of claims) {
      await repository.upsertLegacyRef({
        id: newId("qappl"),
        tenantId,
        projectRef: claim.projectRef,
        applicationId: claim.applicationId,
        origin: claim.origin,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
  }

  return {
    async create(input) {
      const name = input.name.trim();
      if (!name) throw new Error("application.name_required");
      if (name.length > 120) throw new Error("application.name_too_long");
      const key = normaliseApplicationKey(input.key);
      const existing = await repository.getByKey(input.tenantId, key);
      if (existing && existing.status !== "archived") {
        throw new Error("application.key_conflict");
      }
      const timestamp = nowIso();
      const status: ApplicationStatus =
        input.status && isApplicationStatus(input.status) ? input.status : "setup";
      if (status === "archived") throw new Error("application.status_invalid");
      const application: QepApplication = {
        id: input.id?.trim() || newId("qapp"),
        tenantId: input.tenantId,
        key,
        name,
        ...(input.description?.trim() ? { description: input.description.trim() } : {}),
        status,
        ...(input.ownerUserId?.trim() ? { ownerUserId: input.ownerUserId.trim() } : {}),
        ...(input.legacyQualityProjectId
          ? { legacyQualityProjectId: input.legacyQualityProjectId }
          : {}),
        revision: 1,
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: input.actorId,
        updatedBy: input.actorId,
      };
      await repository.save(application);
      await syncDeterministicLegacyMappings(input.tenantId);
      return application;
    },

    list(filter) {
      return repository.list(filter);
    },

    async get(tenantId, applicationId) {
      return requireApp(tenantId, applicationId);
    },

    async update(tenantId, applicationId, actorId, patch) {
      const current = await requireApp(tenantId, applicationId);
      if (current.status === "archived") throw new Error("application.archived");
      const nextStatus = patch.status;
      if (nextStatus && !isApplicationStatus(nextStatus)) {
        throw new Error("application.status_invalid");
      }
      const name = patch.name?.trim();
      if (name !== undefined && !name) throw new Error("application.name_required");
      const next: QepApplication = {
        ...current,
        ...(name ? { name } : {}),
        ...(patch.description !== undefined
          ? patch.description?.trim()
            ? { description: patch.description.trim() }
            : { description: undefined }
          : {}),
        ...(patch.ownerUserId !== undefined
          ? patch.ownerUserId?.trim()
            ? { ownerUserId: patch.ownerUserId.trim() }
            : { ownerUserId: undefined }
          : {}),
        ...(nextStatus ? { status: nextStatus } : {}),
        revision: current.revision + 1,
        updatedAt: nowIso(),
        updatedBy: actorId,
        ...(nextStatus === "archived" ? { archivedAt: nowIso() } : {}),
      };
      await repository.save(next);
      return next;
    },

    async archive(tenantId, applicationId, actorId) {
      return this.update(tenantId, applicationId, actorId, { status: "archived" });
    },

    async attachRepository(tenantId, applicationId, scmRepositoryId, actorId) {
      await requireApp(tenantId, applicationId);
      const repoId = scmRepositoryId.trim();
      if (!repoId) throw new Error("application.repository_required");
      const existing = await repository.listRepositoryLinks(tenantId, applicationId);
      const found = existing.find((row) => row.scmRepositoryId === repoId);
      if (found) return found;
      const link: QepApplicationRepositoryLink = {
        id: newId("qappr"),
        tenantId,
        applicationId,
        scmRepositoryId: repoId,
        createdAt: nowIso(),
        createdBy: actorId,
      };
      await repository.attachRepository(link);
      return link;
    },

    listRepositories(tenantId, applicationId) {
      return repository.listRepositoryLinks(tenantId, applicationId);
    },

    async createEnvironment(tenantId, applicationId, input) {
      await requireApp(tenantId, applicationId);
      const name = input.name.trim();
      if (!name) throw new Error("application.environment.name_required");
      if (!ENV_CATEGORIES.includes(input.category)) {
        throw new Error("application.environment.category_invalid");
      }
      const environment: QepApplicationEnvironment = {
        id: newId("qappe"),
        tenantId,
        applicationId,
        name,
        category: input.category,
        ...(input.description?.trim() ? { description: input.description.trim() } : {}),
        ...(input.baseUrl?.trim() ? { baseUrl: input.baseUrl.trim() } : {}),
        status: input.status ?? "active",
        ...(input.metadata ? { metadata: input.metadata } : {}),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        createdBy: input.actorId,
        updatedBy: input.actorId,
      };
      await repository.saveEnvironment(environment);
      return environment;
    },

    async listEnvironments(tenantId, applicationId) {
      await requireApp(tenantId, applicationId);
      return repository.listEnvironments(tenantId, applicationId);
    },

    async getEnvironment(tenantId, applicationId, environmentId) {
      await requireApp(tenantId, applicationId);
      const row = await repository.getEnvironment(tenantId, environmentId);
      if (!row || row.applicationId !== applicationId) {
        throw new Error("application.environment.not_found");
      }
      return row;
    },

    async createExecutionTarget(tenantId, applicationId, input) {
      await requireApp(tenantId, applicationId);
      const name = input.name.trim();
      if (!name) throw new Error("application.execution_target.name_required");
      const targetType = input.targetType.trim();
      if (!targetType) throw new Error("application.execution_target.type_required");
      if (!(EXECUTION_TARGET_TYPES as readonly string[]).includes(targetType)) {
        throw new Error("application.execution_target.type_invalid");
      }
      assertNoRawSecrets(input.config);
      if (input.environmentId) {
        const env = await repository.getEnvironment(tenantId, input.environmentId);
        if (!env || env.applicationId !== applicationId) {
          throw new Error("application.environment.not_found");
        }
      }
      const status: ExecutionTargetStatus = input.status ?? "not_configured";
      const target: QepApplicationExecutionTarget = {
        id: newId("qappt"),
        tenantId,
        applicationId,
        ...(input.environmentId ? { environmentId: input.environmentId } : {}),
        name,
        targetType,
        status,
        config: input.config ?? {},
        createdAt: nowIso(),
        updatedAt: nowIso(),
        createdBy: input.actorId,
        updatedBy: input.actorId,
      };
      await repository.saveExecutionTarget(target);
      return target;
    },

    async listExecutionTargets(tenantId, applicationId) {
      await requireApp(tenantId, applicationId);
      return repository.listExecutionTargets(tenantId, applicationId);
    },

    async getExecutionTarget(tenantId, applicationId, targetId) {
      await requireApp(tenantId, applicationId);
      const row = await repository.getExecutionTarget(tenantId, targetId);
      if (!row || row.applicationId !== applicationId) {
        throw new Error("application.execution_target.not_found");
      }
      return row;
    },

    async syncDeterministicLegacyMappings(tenantId) {
      return syncDeterministicLegacyMappings(tenantId);
    },

    async recordObservedProjectRefs(tenantId, projectRefs) {
      const timestamp = nowIso();
      const existing = await repository.listLegacyRefs(tenantId);
      const known = new Set(existing.map((row) => row.projectRef));
      for (const raw of projectRefs) {
        const projectRef = raw.trim();
        if (!projectRef || known.has(projectRef)) continue;
        known.add(projectRef);
        const row: QepApplicationLegacyRef = {
          id: newId("qappl"),
          tenantId,
          projectRef,
          origin: "observed",
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        await repository.upsertLegacyRef(row);
      }
    },

    listLegacyRefs(tenantId) {
      return repository.listLegacyRefs(tenantId);
    },
  };
}
