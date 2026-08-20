import {
  getDatabaseExecutor,
  qepApplication,
  qepApplicationEnvironment,
  qepApplicationExecutionTarget,
  qepApplicationLegacyRef,
  qepApplicationRepository,
  type DatabaseExecutor,
} from "@apzhub/config";
import { and, desc, eq } from "drizzle-orm";

import type {
  ApplicationStatus,
  EnvironmentCategory,
  EnvironmentStatus,
  ExecutionTargetStatus,
  QepApplication,
  QepApplicationEnvironment,
  QepApplicationExecutionTarget,
  QepApplicationLegacyRef,
  QepApplicationRepositoryLink,
  LegacyRefOrigin,
} from "../../domain/types";
import type {
  ApplicationListFilter,
  ApplicationRepository,
} from "../../application/repository";

function toApp(row: typeof qepApplication.$inferSelect): QepApplication {
  return {
    id: row.id,
    tenantId: row.tenantId,
    key: row.applicationKey,
    name: row.name,
    ...(row.description ? { description: row.description } : {}),
    status: row.status as ApplicationStatus,
    ...(row.ownerUserId ? { ownerUserId: row.ownerUserId } : {}),
    ...(row.legacyQualityProjectId
      ? { legacyQualityProjectId: row.legacyQualityProjectId }
      : {}),
    revision: row.revision,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    ...(row.archivedAt ? { archivedAt: row.archivedAt.toISOString() } : {}),
  };
}

function toLink(
  row: typeof qepApplicationRepository.$inferSelect,
): QepApplicationRepositoryLink {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    scmRepositoryId: row.scmRepositoryId,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
  };
}

function toEnv(
  row: typeof qepApplicationEnvironment.$inferSelect,
): QepApplicationEnvironment {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    name: row.name,
    category: row.category as EnvironmentCategory,
    ...(row.description ? { description: row.description } : {}),
    ...(row.baseUrl ? { baseUrl: row.baseUrl } : {}),
    status: row.status as EnvironmentStatus,
    ...(row.metadataJson ? { metadata: row.metadataJson } : {}),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

function toLegacyRef(
  row: typeof qepApplicationLegacyRef.$inferSelect,
): QepApplicationLegacyRef {
  return {
    id: row.id,
    tenantId: row.tenantId,
    projectRef: row.projectRef,
    ...(row.applicationId ? { applicationId: row.applicationId } : {}),
    origin: row.origin as LegacyRefOrigin,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toTarget(
  row: typeof qepApplicationExecutionTarget.$inferSelect,
): QepApplicationExecutionTarget {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    ...(row.environmentId ? { environmentId: row.environmentId } : {}),
    name: row.name,
    targetType: row.targetType,
    status: row.status as ExecutionTargetStatus,
    config: row.configJson,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createPostgresApplicationRepository(
  db: DatabaseExecutor,
): ApplicationRepository {
  const exec = () => getDatabaseExecutor(db);

  return {
    async get(tenantId, applicationId) {
      const rows = await exec()
        .select()
        .from(qepApplication)
        .where(
          and(
            eq(qepApplication.tenantId, tenantId),
            eq(qepApplication.id, applicationId),
          ),
        )
        .limit(1);
      return rows[0] ? toApp(rows[0]) : undefined;
    },

    async getByKey(tenantId, key) {
      const rows = await exec()
        .select()
        .from(qepApplication)
        .where(
          and(
            eq(qepApplication.tenantId, tenantId),
            eq(qepApplication.applicationKey, key),
          ),
        )
        .limit(1);
      return rows[0] ? toApp(rows[0]) : undefined;
    },

    async list(filter: ApplicationListFilter) {
      const rows = await exec()
        .select()
        .from(qepApplication)
        .where(eq(qepApplication.tenantId, filter.tenantId))
        .orderBy(desc(qepApplication.updatedAt));
      const q = filter.query?.trim().toLowerCase();
      return rows
        .map(toApp)
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
        });
    },

    async save(application) {
      const values = {
        id: application.id,
        tenantId: application.tenantId,
        applicationKey: application.key,
        name: application.name,
        description: application.description ?? null,
        status: application.status,
        ownerUserId: application.ownerUserId ?? null,
        legacyQualityProjectId: application.legacyQualityProjectId ?? null,
        revision: application.revision,
        createdAt: new Date(application.createdAt),
        updatedAt: new Date(application.updatedAt),
        createdBy: application.createdBy,
        updatedBy: application.updatedBy,
        archivedAt: application.archivedAt ? new Date(application.archivedAt) : null,
      };
      const existing = await exec()
        .select({ id: qepApplication.id })
        .from(qepApplication)
        .where(eq(qepApplication.id, application.id))
        .limit(1);
      if (existing[0]) {
        await exec()
          .update(qepApplication)
          .set({
            applicationKey: values.applicationKey,
            name: values.name,
            description: values.description,
            status: values.status,
            ownerUserId: values.ownerUserId,
            revision: values.revision,
            updatedAt: values.updatedAt,
            updatedBy: values.updatedBy,
            archivedAt: values.archivedAt,
          })
          .where(eq(qepApplication.id, application.id));
        return;
      }
      await exec().insert(qepApplication).values(values);
    },

    async listRepositoryLinks(tenantId, applicationId) {
      const rows = await exec()
        .select()
        .from(qepApplicationRepository)
        .where(
          and(
            eq(qepApplicationRepository.tenantId, tenantId),
            eq(qepApplicationRepository.applicationId, applicationId),
          ),
        );
      return rows.map(toLink);
    },

    async attachRepository(link) {
      const existing = await exec()
        .select({ id: qepApplicationRepository.id })
        .from(qepApplicationRepository)
        .where(
          and(
            eq(qepApplicationRepository.applicationId, link.applicationId),
            eq(qepApplicationRepository.scmRepositoryId, link.scmRepositoryId),
          ),
        )
        .limit(1);
      if (existing[0]) return;
      await exec()
        .insert(qepApplicationRepository)
        .values({
          id: link.id,
          tenantId: link.tenantId,
          applicationId: link.applicationId,
          scmRepositoryId: link.scmRepositoryId,
          createdAt: new Date(link.createdAt),
          createdBy: link.createdBy,
        });
    },

    async listEnvironments(tenantId, applicationId) {
      const rows = await exec()
        .select()
        .from(qepApplicationEnvironment)
        .where(
          and(
            eq(qepApplicationEnvironment.tenantId, tenantId),
            eq(qepApplicationEnvironment.applicationId, applicationId),
          ),
        );
      return rows.map(toEnv);
    },

    async getEnvironment(tenantId, environmentId) {
      const rows = await exec()
        .select()
        .from(qepApplicationEnvironment)
        .where(
          and(
            eq(qepApplicationEnvironment.tenantId, tenantId),
            eq(qepApplicationEnvironment.id, environmentId),
          ),
        )
        .limit(1);
      return rows[0] ? toEnv(rows[0]) : undefined;
    },

    async saveEnvironment(environment) {
      const values = {
        id: environment.id,
        tenantId: environment.tenantId,
        applicationId: environment.applicationId,
        name: environment.name,
        category: environment.category,
        description: environment.description ?? null,
        baseUrl: environment.baseUrl ?? null,
        status: environment.status,
        metadataJson: environment.metadata ? { ...environment.metadata } : null,
        createdAt: new Date(environment.createdAt),
        updatedAt: new Date(environment.updatedAt),
        createdBy: environment.createdBy,
        updatedBy: environment.updatedBy,
      };
      const existing = await exec()
        .select({ id: qepApplicationEnvironment.id })
        .from(qepApplicationEnvironment)
        .where(eq(qepApplicationEnvironment.id, environment.id))
        .limit(1);
      if (existing[0]) {
        await exec()
          .update(qepApplicationEnvironment)
          .set({
            name: values.name,
            category: values.category,
            description: values.description,
            baseUrl: values.baseUrl,
            status: values.status,
            metadataJson: values.metadataJson,
            updatedAt: values.updatedAt,
            updatedBy: values.updatedBy,
          })
          .where(eq(qepApplicationEnvironment.id, environment.id));
        return;
      }
      await exec().insert(qepApplicationEnvironment).values(values);
    },

    async listExecutionTargets(tenantId, applicationId) {
      const rows = await exec()
        .select()
        .from(qepApplicationExecutionTarget)
        .where(
          and(
            eq(qepApplicationExecutionTarget.tenantId, tenantId),
            eq(qepApplicationExecutionTarget.applicationId, applicationId),
          ),
        );
      return rows.map(toTarget);
    },

    async getExecutionTarget(tenantId, targetId) {
      const rows = await exec()
        .select()
        .from(qepApplicationExecutionTarget)
        .where(
          and(
            eq(qepApplicationExecutionTarget.tenantId, tenantId),
            eq(qepApplicationExecutionTarget.id, targetId),
          ),
        )
        .limit(1);
      return rows[0] ? toTarget(rows[0]) : undefined;
    },

    async saveExecutionTarget(target) {
      const values = {
        id: target.id,
        tenantId: target.tenantId,
        applicationId: target.applicationId,
        environmentId: target.environmentId ?? null,
        name: target.name,
        targetType: String(target.targetType),
        status: target.status,
        configJson: { ...target.config },
        createdAt: new Date(target.createdAt),
        updatedAt: new Date(target.updatedAt),
        createdBy: target.createdBy,
        updatedBy: target.updatedBy,
      };
      const existing = await exec()
        .select({ id: qepApplicationExecutionTarget.id })
        .from(qepApplicationExecutionTarget)
        .where(eq(qepApplicationExecutionTarget.id, target.id))
        .limit(1);
      if (existing[0]) {
        await exec()
          .update(qepApplicationExecutionTarget)
          .set({
            environmentId: values.environmentId,
            name: values.name,
            targetType: values.targetType,
            status: values.status,
            configJson: values.configJson,
            updatedAt: values.updatedAt,
            updatedBy: values.updatedBy,
          })
          .where(eq(qepApplicationExecutionTarget.id, target.id));
        return;
      }
      await exec().insert(qepApplicationExecutionTarget).values(values);
    },

    async listLegacyRefs(tenantId) {
      const rows = await exec()
        .select()
        .from(qepApplicationLegacyRef)
        .where(eq(qepApplicationLegacyRef.tenantId, tenantId));
      return rows.map(toLegacyRef);
    },

    async upsertLegacyRef(ref) {
      const existing = await exec()
        .select()
        .from(qepApplicationLegacyRef)
        .where(
          and(
            eq(qepApplicationLegacyRef.tenantId, ref.tenantId),
            eq(qepApplicationLegacyRef.projectRef, ref.projectRef),
          ),
        )
        .limit(1);
      const current = existing[0];
      if (!current) {
        await exec()
          .insert(qepApplicationLegacyRef)
          .values({
            id: ref.id,
            tenantId: ref.tenantId,
            projectRef: ref.projectRef,
            applicationId: ref.applicationId ?? null,
            origin: ref.origin,
            createdAt: new Date(ref.createdAt),
            updatedAt: new Date(ref.updatedAt),
          });
        return;
      }
      if (
        current.applicationId &&
        ref.applicationId &&
        current.applicationId !== ref.applicationId
      ) {
        return;
      }
      if (current.applicationId && !ref.applicationId) {
        return;
      }
      await exec()
        .update(qepApplicationLegacyRef)
        .set({
          ...(ref.applicationId
            ? { applicationId: ref.applicationId, origin: ref.origin }
            : {}),
          updatedAt: new Date(ref.updatedAt),
        })
        .where(eq(qepApplicationLegacyRef.id, current.id));
    },
  };
}
