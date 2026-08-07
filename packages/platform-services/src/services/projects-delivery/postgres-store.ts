import {
  getDb,
  platformProjectAction,
  platformProjectDecision,
  platformProjectMilestone,
  platformProjectRisk,
} from "@apzhub/config/db";
import { and, asc, desc, eq } from "drizzle-orm";

import type {
  MilestoneId,
  ProjectActionItem,
  ProjectActionStatus,
  ProjectDecision,
  ProjectId,
  ProjectMilestone,
  ProjectMilestoneStatus,
  ProjectRisk,
  ProjectRiskLevel,
  ProjectRiskStatus,
} from "@apzhub/platform-service-contracts";

import type { ProjectsDeliveryStore } from "./memory-store";

function mapMilestone(
  row: typeof platformProjectMilestone.$inferSelect,
): ProjectMilestone {
  return Object.freeze({
    id: row.id as MilestoneId,
    projectId: row.projectId as ProjectId,
    name: row.name,
    description: row.description ?? undefined,
    targetDate: row.targetDate?.toISOString(),
    owner: row.owner ?? undefined,
    ownerUserId: row.ownerUserId ?? undefined,
    status: row.status as ProjectMilestoneStatus,
    confidence: (row.confidence as ProjectMilestone["confidence"]) ?? "medium",
    failureConsequence: row.failureConsequence ?? undefined,
    exitCriteria: row.exitCriteria ?? undefined,
    baselineDueAt: row.baselineDueAt?.toISOString(),
    sortKey: row.sortKey ?? 0,
    dependencyIds: Object.freeze([...(row.dependencyIds ?? [])]),
    progressPercent: row.progressPercent,
    achievementEvidence: Object.freeze([
      ...((row.achievementEvidence as ProjectMilestone["achievementEvidence"]) ?? []),
    ]),
    varianceDays: row.varianceDays ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function mapRisk(row: typeof platformProjectRisk.$inferSelect): ProjectRisk {
  return Object.freeze({
    id: row.id,
    projectId: row.projectId as ProjectId,
    title: row.title,
    description: row.description,
    probability: row.probability as ProjectRiskLevel,
    impact: row.impact as ProjectRiskLevel,
    mitigation: row.mitigation,
    owner: row.owner,
    reviewDate: row.reviewDate?.toISOString(),
    status: row.status as ProjectRiskStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function mapDecision(
  row: typeof platformProjectDecision.$inferSelect,
): ProjectDecision {
  return Object.freeze({
    id: row.id,
    projectId: row.projectId as ProjectId,
    decision: row.decision,
    rationale: row.rationale,
    owner: row.owner,
    decidedAt: row.decidedAt.toISOString(),
    outcome: row.outcome,
    relatedWork: row.relatedWork ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function mapAction(row: typeof platformProjectAction.$inferSelect): ProjectActionItem {
  return Object.freeze({
    id: row.id,
    projectId: row.projectId as ProjectId,
    title: row.title,
    owner: row.owner,
    dueDate: row.dueDate?.toISOString(),
    status: row.status as ProjectActionStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export function createPostgresProjectsDeliveryStore(): ProjectsDeliveryStore {
  return {
    async listMilestones(tenantId, projectId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformProjectMilestone)
        .where(
          and(
            eq(platformProjectMilestone.tenantId, tenantId),
            eq(platformProjectMilestone.projectId, projectId),
          ),
        )
        .orderBy(asc(platformProjectMilestone.targetDate));
      return rows.map(mapMilestone);
    },

    async upsertMilestone(tenantId, item) {
      const db = getDb();
      await db
        .insert(platformProjectMilestone)
        .values({
          id: item.id,
          tenantId,
          projectId: item.projectId,
          name: item.name,
          description: item.description ?? null,
          targetDate: item.targetDate ? new Date(item.targetDate) : null,
          owner: item.owner ?? null,
          ownerUserId: item.ownerUserId ?? null,
          status: item.status,
          confidence: item.confidence,
          failureConsequence: item.failureConsequence ?? null,
          exitCriteria: item.exitCriteria ?? null,
          baselineDueAt: item.baselineDueAt ? new Date(item.baselineDueAt) : null,
          sortKey: item.sortKey,
          dependencyIds: [...item.dependencyIds],
          progressPercent: item.progressPercent,
          achievementEvidence: [...item.achievementEvidence],
          varianceDays: item.varianceDays ?? null,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
        .onConflictDoUpdate({
          target: platformProjectMilestone.id,
          set: {
            name: item.name,
            description: item.description ?? null,
            targetDate: item.targetDate ? new Date(item.targetDate) : null,
            owner: item.owner ?? null,
            ownerUserId: item.ownerUserId ?? null,
            status: item.status,
            confidence: item.confidence,
            failureConsequence: item.failureConsequence ?? null,
            exitCriteria: item.exitCriteria ?? null,
            baselineDueAt: item.baselineDueAt ? new Date(item.baselineDueAt) : null,
            sortKey: item.sortKey,
            dependencyIds: [...item.dependencyIds],
            progressPercent: item.progressPercent,
            achievementEvidence: [...item.achievementEvidence],
            varianceDays: item.varianceDays ?? null,
            updatedAt: new Date(item.updatedAt),
          },
        });
      return item;
    },

    async listRisks(tenantId, projectId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformProjectRisk)
        .where(
          and(
            eq(platformProjectRisk.tenantId, tenantId),
            eq(platformProjectRisk.projectId, projectId),
          ),
        )
        .orderBy(desc(platformProjectRisk.updatedAt));
      return rows.map(mapRisk);
    },

    async upsertRisk(tenantId, item) {
      const db = getDb();
      await db
        .insert(platformProjectRisk)
        .values({
          id: item.id,
          tenantId,
          projectId: item.projectId,
          title: item.title,
          description: item.description,
          probability: item.probability,
          impact: item.impact,
          mitigation: item.mitigation,
          owner: item.owner,
          reviewDate: item.reviewDate ? new Date(item.reviewDate) : null,
          status: item.status,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
        .onConflictDoUpdate({
          target: platformProjectRisk.id,
          set: {
            title: item.title,
            description: item.description,
            probability: item.probability,
            impact: item.impact,
            mitigation: item.mitigation,
            owner: item.owner,
            reviewDate: item.reviewDate ? new Date(item.reviewDate) : null,
            status: item.status,
            updatedAt: new Date(item.updatedAt),
          },
        });
      return item;
    },

    async listDecisions(tenantId, projectId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformProjectDecision)
        .where(
          and(
            eq(platformProjectDecision.tenantId, tenantId),
            eq(platformProjectDecision.projectId, projectId),
          ),
        )
        .orderBy(desc(platformProjectDecision.decidedAt));
      return rows.map(mapDecision);
    },

    async upsertDecision(tenantId, item) {
      const db = getDb();
      await db
        .insert(platformProjectDecision)
        .values({
          id: item.id,
          tenantId,
          projectId: item.projectId,
          decision: item.decision,
          rationale: item.rationale,
          owner: item.owner,
          decidedAt: new Date(item.decidedAt),
          outcome: item.outcome,
          relatedWork: item.relatedWork ?? null,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
        .onConflictDoUpdate({
          target: platformProjectDecision.id,
          set: {
            decision: item.decision,
            rationale: item.rationale,
            owner: item.owner,
            decidedAt: new Date(item.decidedAt),
            outcome: item.outcome,
            relatedWork: item.relatedWork ?? null,
            updatedAt: new Date(item.updatedAt),
          },
        });
      return item;
    },

    async listActions(tenantId, projectId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformProjectAction)
        .where(
          and(
            eq(platformProjectAction.tenantId, tenantId),
            eq(platformProjectAction.projectId, projectId),
          ),
        )
        .orderBy(asc(platformProjectAction.dueDate));
      return rows.map(mapAction);
    },

    async upsertAction(tenantId, item) {
      const db = getDb();
      await db
        .insert(platformProjectAction)
        .values({
          id: item.id,
          tenantId,
          projectId: item.projectId,
          title: item.title,
          owner: item.owner,
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
          status: item.status,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
        .onConflictDoUpdate({
          target: platformProjectAction.id,
          set: {
            title: item.title,
            owner: item.owner,
            dueDate: item.dueDate ? new Date(item.dueDate) : null,
            status: item.status,
            updatedAt: new Date(item.updatedAt),
          },
        });
      return item;
    },
  };
}
