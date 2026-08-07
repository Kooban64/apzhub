import {
  getDb,
  platformOperationalPolicy,
  platformOrgGovernanceProfile,
} from "@apzhub/config/db";
import { and, eq } from "drizzle-orm";

import type {
  GovernancePublishStatus,
  OperationalPolicy,
  OperationalPolicyArea,
  OrgGovernanceProfile,
  ProjectClassification,
  ProjectDeliveryModel,
} from "@apzhub/platform-service-contracts";

import type { ProjectsGovernanceStore } from "./memory-store";

function mapProfile(
  row: typeof platformOrgGovernanceProfile.$inferSelect,
): OrgGovernanceProfile {
  return Object.freeze({
    id: row.id,
    key: row.key,
    name: row.name,
    version: row.version,
    scope: "organisation" as const,
    status: row.status as GovernancePublishStatus,
    requiresHoldDecision: row.requiresHoldDecision,
    requiresClosureApproval: row.requiresClosureApproval,
    requiresEvidenceOnClose: row.requiresEvidenceOnClose,
    initiationRequiresMilestone: row.initiationRequiresMilestone,
    milestoneDateToleranceDays: row.milestoneDateToleranceDays,
    waitingBreachEscalationDays: row.waitingBreachEscalationDays,
    allowedDeliveryModels: Object.freeze([
      ...(row.allowedDeliveryModels as ProjectDeliveryModel[]),
    ]),
    allowedClassifications: Object.freeze([
      ...(row.allowedClassifications as ProjectClassification[]),
    ]),
    boundPolicyIds: Object.freeze([...(row.boundPolicyIds ?? [])]),
    effectiveFrom: row.effectiveFrom?.toISOString(),
    publishedAt: row.publishedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    archivedAt: row.archivedAt?.toISOString(),
  });
}

function mapPolicy(
  row: typeof platformOperationalPolicy.$inferSelect,
): OperationalPolicy {
  return Object.freeze({
    id: row.id,
    key: row.key,
    name: row.name,
    version: row.version,
    status: row.status as GovernancePublishStatus,
    areas: Object.freeze([...(row.areas as OperationalPolicyArea[])]),
    rules: Object.freeze({ ...(row.rules ?? {}) }),
    boundProfileIds: Object.freeze([...(row.boundProfileIds ?? [])]),
    effectiveFrom: row.effectiveFrom?.toISOString(),
    publishedAt: row.publishedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    archivedAt: row.archivedAt?.toISOString(),
  });
}

export function createPostgresProjectsGovernanceStore(): ProjectsGovernanceStore {
  const db = getDb();
  return {
    async listProfiles(tenantId) {
      const rows = await db
        .select()
        .from(platformOrgGovernanceProfile)
        .where(eq(platformOrgGovernanceProfile.tenantId, tenantId));
      return Object.freeze(rows.map(mapProfile));
    },
    async getProfile(tenantId, id) {
      const rows = await db
        .select()
        .from(platformOrgGovernanceProfile)
        .where(
          and(
            eq(platformOrgGovernanceProfile.tenantId, tenantId),
            eq(platformOrgGovernanceProfile.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? mapProfile(rows[0]) : null;
    },
    async upsertProfile(tenantId, row) {
      const values = {
        id: row.id,
        tenantId,
        key: row.key,
        name: row.name,
        version: row.version,
        scope: row.scope,
        status: row.status,
        requiresHoldDecision: row.requiresHoldDecision,
        requiresClosureApproval: row.requiresClosureApproval,
        requiresEvidenceOnClose: row.requiresEvidenceOnClose,
        initiationRequiresMilestone: row.initiationRequiresMilestone,
        milestoneDateToleranceDays: row.milestoneDateToleranceDays,
        waitingBreachEscalationDays: row.waitingBreachEscalationDays,
        allowedDeliveryModels: [...row.allowedDeliveryModels],
        allowedClassifications: [...row.allowedClassifications],
        boundPolicyIds: [...row.boundPolicyIds],
        effectiveFrom: row.effectiveFrom ? new Date(row.effectiveFrom) : null,
        publishedAt: row.publishedAt ? new Date(row.publishedAt) : null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        archivedAt: row.archivedAt ? new Date(row.archivedAt) : null,
      };
      await db
        .insert(platformOrgGovernanceProfile)
        .values(values)
        .onConflictDoUpdate({
          target: platformOrgGovernanceProfile.id,
          set: { ...values, createdAt: undefined },
        });
      return Object.freeze({ ...row });
    },
    async listPolicies(tenantId) {
      const rows = await db
        .select()
        .from(platformOperationalPolicy)
        .where(eq(platformOperationalPolicy.tenantId, tenantId));
      return Object.freeze(rows.map(mapPolicy));
    },
    async getPolicy(tenantId, id) {
      const rows = await db
        .select()
        .from(platformOperationalPolicy)
        .where(
          and(
            eq(platformOperationalPolicy.tenantId, tenantId),
            eq(platformOperationalPolicy.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? mapPolicy(rows[0]) : null;
    },
    async upsertPolicy(tenantId, row) {
      const values = {
        id: row.id,
        tenantId,
        key: row.key,
        name: row.name,
        version: row.version,
        status: row.status,
        areas: [...row.areas],
        rules: { ...row.rules },
        boundProfileIds: [...row.boundProfileIds],
        effectiveFrom: row.effectiveFrom ? new Date(row.effectiveFrom) : null,
        publishedAt: row.publishedAt ? new Date(row.publishedAt) : null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        archivedAt: row.archivedAt ? new Date(row.archivedAt) : null,
      };
      await db
        .insert(platformOperationalPolicy)
        .values(values)
        .onConflictDoUpdate({
          target: platformOperationalPolicy.id,
          set: { ...values, createdAt: undefined },
        });
      return Object.freeze({ ...row });
    },
  };
}
