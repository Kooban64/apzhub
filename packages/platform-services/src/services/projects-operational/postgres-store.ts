import {
  getDb,
  platformProjectCheckpoint,
  platformProjectCommitment,
  platformProjectDependency,
  platformProjectException,
  platformProjectOperationalHistory,
  platformProjectOpsDecision,
  platformProjectWaiting,
} from "@apzhub/config/db";
import { and, desc, eq } from "drizzle-orm";

import type {
  CompletionEvidence,
  DependencyRef,
  OperationalHistoryEntry,
  OpsDecisionLink,
  ProjectCheckpoint,
  ProjectCommitment,
  ProjectDependency,
  ProjectException,
  ProjectOpsDecision,
  ProjectWaiting,
} from "@apzhub/platform-service-contracts";

import type { ProjectsOperationalStore } from "./memory-store";

function ts(value?: string) {
  return value ? new Date(value) : null;
}

function mapCommitment(
  row: typeof platformProjectCommitment.$inferSelect,
): ProjectCommitment {
  return Object.freeze({
    id: row.id,
    projectId: row.projectId,
    statement: row.statement,
    ownerUserId: row.ownerUserId,
    dueAt: row.dueAt?.toISOString(),
    status: row.status as ProjectCommitment["status"],
    waiters: Object.freeze([...(row.waiters ?? [])]),
    failureConsequence: row.failureConsequence ?? undefined,
    milestoneId: row.milestoneId ?? undefined,
    waitingId: row.waitingId ?? undefined,
    baselineVersionId: row.baselineVersionId ?? undefined,
    blockedByDependencyIds: Object.freeze([...(row.blockedByDependencyIds ?? [])]),
    priority: row.priority as ProjectCommitment["priority"],
    completionEvidence: Object.freeze([
      ...((row.completionEvidence as CompletionEvidence[]) ?? []),
    ]),
    blocksGoLive: row.blocksGoLive,
    cancelReason: row.cancelReason ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
  });
}

function mapWaiting(row: typeof platformProjectWaiting.$inferSelect): ProjectWaiting {
  return Object.freeze({
    id: row.id,
    projectId: row.projectId,
    subject: row.subject,
    category: row.category as ProjectWaiting["category"],
    since: row.since.toISOString(),
    chaseOwnerUserId: row.chaseOwnerUserId,
    status: row.status as ProjectWaiting["status"],
    partyLabel: row.partyLabel ?? undefined,
    slaDays: row.slaDays,
    failureConsequence: row.failureConsequence ?? undefined,
    linkedCommitmentId: row.linkedCommitmentId ?? undefined,
    linkedDecisionId: row.linkedDecisionId ?? undefined,
    linkedMilestoneId: row.linkedMilestoneId ?? undefined,
    resolvedAt: row.resolvedAt?.toISOString(),
    resolveNote: row.resolveNote ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
  });
}

function mapDep(row: typeof platformProjectDependency.$inferSelect): ProjectDependency {
  return Object.freeze({
    id: row.id,
    projectId: row.projectId,
    fromRef: Object.freeze({ ...(row.fromRef as unknown as DependencyRef) }),
    toRef: Object.freeze({ ...(row.toRef as unknown as DependencyRef) }),
    kind: row.kind as ProjectDependency["kind"],
    status: row.status as ProjectDependency["status"],
    failureConsequence: row.failureConsequence ?? undefined,
    ownerUserId: row.ownerUserId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
  });
}

function mapDecision(
  row: typeof platformProjectOpsDecision.$inferSelect,
): ProjectOpsDecision {
  return Object.freeze({
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    status: row.status as ProjectOpsDecision["status"],
    decisionMakerUserId: row.decisionMakerUserId,
    dueAt: row.dueAt?.toISOString(),
    context: row.context ?? undefined,
    outcome: row.outcome ?? undefined,
    failureConsequence: row.failureConsequence ?? undefined,
    links: Object.freeze([...((row.links as OpsDecisionLink[]) ?? [])]),
    deferReason: row.deferReason ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
  });
}

function mapCheckpoint(
  row: typeof platformProjectCheckpoint.$inferSelect,
): ProjectCheckpoint {
  return Object.freeze({
    id: row.id,
    projectId: row.projectId,
    key: row.key,
    name: row.name,
    status: row.status as ProjectCheckpoint["status"],
    requiredByProfile: row.requiredByProfile,
    releaseClass: row.releaseClass,
    workflowBinding: row.workflowBinding ?? undefined,
    dueAt: row.dueAt?.toISOString(),
    anchorMilestoneId: row.anchorMilestoneId ?? undefined,
    decisionId: row.decisionId ?? undefined,
    waiverActor: row.waiverActor ?? undefined,
    waiverReason: row.waiverReason ?? undefined,
    waivedAt: row.waivedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function mapException(
  row: typeof platformProjectException.$inferSelect,
): ProjectException {
  return Object.freeze({
    id: row.id,
    projectId: row.projectId,
    type: row.type as ProjectException["type"],
    severity: row.severity as ProjectException["severity"],
    status: row.status as ProjectException["status"],
    outcome: (row.outcome ?? undefined) as ProjectException["outcome"],
    subjectRef: Object.freeze({ ...(row.subjectRef as { type: string; id: string }) }),
    detectedAt: row.detectedAt.toISOString(),
    reason: row.reason,
    impactSummary: row.impactSummary,
    failureConsequence: row.failureConsequence ?? undefined,
    requiredDecisionId: row.requiredDecisionId ?? undefined,
    escalationState: row.escalationState as ProjectException["escalationState"],
    resolutionNote: row.resolutionNote ?? undefined,
    concludedAt: row.concludedAt?.toISOString(),
    concludedBy: row.concludedBy ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function mapHistory(
  row: typeof platformProjectOperationalHistory.$inferSelect,
): OperationalHistoryEntry {
  return Object.freeze({
    id: row.id,
    projectId: row.projectId,
    objectType: row.objectType,
    objectId: row.objectId,
    kind: row.kind,
    summary: row.summary,
    detail: row.detail ?? undefined,
    actorUserId: row.actorUserId,
    at: row.at.toISOString(),
  });
}

export function createPostgresProjectsOperationalStore(): ProjectsOperationalStore {
  const db = getDb();

  return {
    async listCommitments(tenantId, projectId) {
      const rows = await db
        .select()
        .from(platformProjectCommitment)
        .where(
          and(
            eq(platformProjectCommitment.tenantId, tenantId),
            eq(platformProjectCommitment.projectId, projectId),
          ),
        );
      return rows.map(mapCommitment);
    },
    async getCommitment(tenantId, projectId, id) {
      const rows = await db
        .select()
        .from(platformProjectCommitment)
        .where(
          and(
            eq(platformProjectCommitment.tenantId, tenantId),
            eq(platformProjectCommitment.projectId, projectId),
            eq(platformProjectCommitment.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? mapCommitment(rows[0]) : null;
    },
    async upsertCommitment(tenantId, item) {
      await db
        .insert(platformProjectCommitment)
        .values({
          id: item.id,
          tenantId,
          projectId: item.projectId,
          statement: item.statement,
          ownerUserId: item.ownerUserId,
          dueAt: ts(item.dueAt),
          status: item.status,
          waiters: [...item.waiters],
          failureConsequence: item.failureConsequence ?? null,
          milestoneId: item.milestoneId ?? null,
          waitingId: item.waitingId ?? null,
          baselineVersionId: item.baselineVersionId ?? null,
          blockedByDependencyIds: [...item.blockedByDependencyIds],
          priority: item.priority,
          completionEvidence: [...item.completionEvidence],
          blocksGoLive: item.blocksGoLive,
          cancelReason: item.cancelReason ?? null,
          createdBy: item.createdBy,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
        .onConflictDoUpdate({
          target: platformProjectCommitment.id,
          set: {
            statement: item.statement,
            ownerUserId: item.ownerUserId,
            dueAt: ts(item.dueAt),
            status: item.status,
            waiters: [...item.waiters],
            failureConsequence: item.failureConsequence ?? null,
            milestoneId: item.milestoneId ?? null,
            waitingId: item.waitingId ?? null,
            baselineVersionId: item.baselineVersionId ?? null,
            blockedByDependencyIds: [...item.blockedByDependencyIds],
            priority: item.priority,
            completionEvidence: [...item.completionEvidence],
            blocksGoLive: item.blocksGoLive,
            cancelReason: item.cancelReason ?? null,
            updatedAt: new Date(item.updatedAt),
          },
        });
      return item;
    },

    async listWaiting(tenantId, projectId) {
      const rows = await db
        .select()
        .from(platformProjectWaiting)
        .where(
          and(
            eq(platformProjectWaiting.tenantId, tenantId),
            eq(platformProjectWaiting.projectId, projectId),
          ),
        );
      return rows.map(mapWaiting);
    },
    async getWaiting(tenantId, projectId, id) {
      const rows = await db
        .select()
        .from(platformProjectWaiting)
        .where(
          and(
            eq(platformProjectWaiting.tenantId, tenantId),
            eq(platformProjectWaiting.projectId, projectId),
            eq(platformProjectWaiting.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? mapWaiting(rows[0]) : null;
    },
    async upsertWaiting(tenantId, item) {
      await db
        .insert(platformProjectWaiting)
        .values({
          id: item.id,
          tenantId,
          projectId: item.projectId,
          subject: item.subject,
          category: item.category,
          since: new Date(item.since),
          chaseOwnerUserId: item.chaseOwnerUserId,
          status: item.status,
          partyLabel: item.partyLabel ?? null,
          slaDays: item.slaDays,
          failureConsequence: item.failureConsequence ?? null,
          linkedCommitmentId: item.linkedCommitmentId ?? null,
          linkedDecisionId: item.linkedDecisionId ?? null,
          linkedMilestoneId: item.linkedMilestoneId ?? null,
          resolvedAt: ts(item.resolvedAt),
          resolveNote: item.resolveNote ?? null,
          createdBy: item.createdBy,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
        .onConflictDoUpdate({
          target: platformProjectWaiting.id,
          set: {
            subject: item.subject,
            category: item.category,
            since: new Date(item.since),
            chaseOwnerUserId: item.chaseOwnerUserId,
            status: item.status,
            partyLabel: item.partyLabel ?? null,
            slaDays: item.slaDays,
            failureConsequence: item.failureConsequence ?? null,
            linkedCommitmentId: item.linkedCommitmentId ?? null,
            linkedDecisionId: item.linkedDecisionId ?? null,
            linkedMilestoneId: item.linkedMilestoneId ?? null,
            resolvedAt: ts(item.resolvedAt),
            resolveNote: item.resolveNote ?? null,
            updatedAt: new Date(item.updatedAt),
          },
        });
      return item;
    },

    async listDependencies(tenantId, projectId) {
      const rows = await db
        .select()
        .from(platformProjectDependency)
        .where(
          and(
            eq(platformProjectDependency.tenantId, tenantId),
            eq(platformProjectDependency.projectId, projectId),
          ),
        );
      return rows.map(mapDep);
    },
    async upsertDependency(tenantId, item) {
      await db
        .insert(platformProjectDependency)
        .values({
          id: item.id,
          tenantId,
          projectId: item.projectId,
          fromRef: { ...item.fromRef },
          toRef: { ...item.toRef },
          kind: item.kind,
          status: item.status,
          failureConsequence: item.failureConsequence ?? null,
          ownerUserId: item.ownerUserId ?? null,
          createdBy: item.createdBy,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
        .onConflictDoUpdate({
          target: platformProjectDependency.id,
          set: {
            fromRef: { ...item.fromRef },
            toRef: { ...item.toRef },
            kind: item.kind,
            status: item.status,
            failureConsequence: item.failureConsequence ?? null,
            ownerUserId: item.ownerUserId ?? null,
            updatedAt: new Date(item.updatedAt),
          },
        });
      return item;
    },

    async listDecisions(tenantId, projectId) {
      const rows = await db
        .select()
        .from(platformProjectOpsDecision)
        .where(
          and(
            eq(platformProjectOpsDecision.tenantId, tenantId),
            eq(platformProjectOpsDecision.projectId, projectId),
          ),
        );
      return rows.map(mapDecision);
    },
    async getDecision(tenantId, projectId, id) {
      const rows = await db
        .select()
        .from(platformProjectOpsDecision)
        .where(
          and(
            eq(platformProjectOpsDecision.tenantId, tenantId),
            eq(platformProjectOpsDecision.projectId, projectId),
            eq(platformProjectOpsDecision.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? mapDecision(rows[0]) : null;
    },
    async upsertDecision(tenantId, item) {
      await db
        .insert(platformProjectOpsDecision)
        .values({
          id: item.id,
          tenantId,
          projectId: item.projectId,
          title: item.title,
          status: item.status,
          decisionMakerUserId: item.decisionMakerUserId,
          dueAt: ts(item.dueAt),
          context: item.context ?? null,
          outcome: item.outcome ?? null,
          failureConsequence: item.failureConsequence ?? null,
          links: [...item.links],
          deferReason: item.deferReason ?? null,
          createdBy: item.createdBy,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
        .onConflictDoUpdate({
          target: platformProjectOpsDecision.id,
          set: {
            title: item.title,
            status: item.status,
            decisionMakerUserId: item.decisionMakerUserId,
            dueAt: ts(item.dueAt),
            context: item.context ?? null,
            outcome: item.outcome ?? null,
            failureConsequence: item.failureConsequence ?? null,
            links: [...item.links],
            deferReason: item.deferReason ?? null,
            updatedAt: new Date(item.updatedAt),
          },
        });
      return item;
    },

    async listCheckpoints(tenantId, projectId) {
      const rows = await db
        .select()
        .from(platformProjectCheckpoint)
        .where(
          and(
            eq(platformProjectCheckpoint.tenantId, tenantId),
            eq(platformProjectCheckpoint.projectId, projectId),
          ),
        );
      return rows.map(mapCheckpoint);
    },
    async getCheckpoint(tenantId, projectId, id) {
      const rows = await db
        .select()
        .from(platformProjectCheckpoint)
        .where(
          and(
            eq(platformProjectCheckpoint.tenantId, tenantId),
            eq(platformProjectCheckpoint.projectId, projectId),
            eq(platformProjectCheckpoint.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? mapCheckpoint(rows[0]) : null;
    },
    async upsertCheckpoint(tenantId, item) {
      await db
        .insert(platformProjectCheckpoint)
        .values({
          id: item.id,
          tenantId,
          projectId: item.projectId,
          key: item.key,
          name: item.name,
          status: item.status,
          requiredByProfile: item.requiredByProfile,
          releaseClass: item.releaseClass,
          workflowBinding: item.workflowBinding ?? null,
          dueAt: ts(item.dueAt),
          anchorMilestoneId: item.anchorMilestoneId ?? null,
          decisionId: item.decisionId ?? null,
          waiverActor: item.waiverActor ?? null,
          waiverReason: item.waiverReason ?? null,
          waivedAt: ts(item.waivedAt),
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
        .onConflictDoUpdate({
          target: platformProjectCheckpoint.id,
          set: {
            key: item.key,
            name: item.name,
            status: item.status,
            requiredByProfile: item.requiredByProfile,
            releaseClass: item.releaseClass,
            workflowBinding: item.workflowBinding ?? null,
            dueAt: ts(item.dueAt),
            anchorMilestoneId: item.anchorMilestoneId ?? null,
            decisionId: item.decisionId ?? null,
            waiverActor: item.waiverActor ?? null,
            waiverReason: item.waiverReason ?? null,
            waivedAt: ts(item.waivedAt),
            updatedAt: new Date(item.updatedAt),
          },
        });
      return item;
    },

    async listExceptions(tenantId, projectId) {
      const rows = await db
        .select()
        .from(platformProjectException)
        .where(
          and(
            eq(platformProjectException.tenantId, tenantId),
            eq(platformProjectException.projectId, projectId),
          ),
        );
      return rows.map(mapException);
    },
    async getException(tenantId, projectId, id) {
      const rows = await db
        .select()
        .from(platformProjectException)
        .where(
          and(
            eq(platformProjectException.tenantId, tenantId),
            eq(platformProjectException.projectId, projectId),
            eq(platformProjectException.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? mapException(rows[0]) : null;
    },
    async upsertException(tenantId, item) {
      await db
        .insert(platformProjectException)
        .values({
          id: item.id,
          tenantId,
          projectId: item.projectId,
          type: item.type,
          severity: item.severity,
          status: item.status,
          outcome: item.outcome ?? null,
          subjectRef: { ...item.subjectRef },
          detectedAt: new Date(item.detectedAt),
          reason: item.reason,
          impactSummary: item.impactSummary,
          failureConsequence: item.failureConsequence ?? null,
          requiredDecisionId: item.requiredDecisionId ?? null,
          escalationState: item.escalationState,
          resolutionNote: item.resolutionNote ?? null,
          concludedAt: ts(item.concludedAt),
          concludedBy: item.concludedBy ?? null,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
        .onConflictDoUpdate({
          target: platformProjectException.id,
          set: {
            type: item.type,
            severity: item.severity,
            status: item.status,
            outcome: item.outcome ?? null,
            subjectRef: { ...item.subjectRef },
            detectedAt: new Date(item.detectedAt),
            reason: item.reason,
            impactSummary: item.impactSummary,
            failureConsequence: item.failureConsequence ?? null,
            requiredDecisionId: item.requiredDecisionId ?? null,
            escalationState: item.escalationState,
            resolutionNote: item.resolutionNote ?? null,
            concludedAt: ts(item.concludedAt),
            concludedBy: item.concludedBy ?? null,
            updatedAt: new Date(item.updatedAt),
          },
        });
      return item;
    },

    async addHistory(tenantId, entry) {
      await db.insert(platformProjectOperationalHistory).values({
        id: entry.id,
        tenantId,
        projectId: entry.projectId,
        objectType: entry.objectType,
        objectId: entry.objectId,
        kind: entry.kind,
        summary: entry.summary,
        detail: entry.detail ?? null,
        actorUserId: entry.actorUserId,
        at: new Date(entry.at),
      });
    },
    async listHistory(tenantId, projectId, objectType, objectId) {
      const rows = await db
        .select()
        .from(platformProjectOperationalHistory)
        .where(
          and(
            eq(platformProjectOperationalHistory.tenantId, tenantId),
            eq(platformProjectOperationalHistory.projectId, projectId),
            eq(platformProjectOperationalHistory.objectType, objectType),
            eq(platformProjectOperationalHistory.objectId, objectId),
          ),
        )
        .orderBy(desc(platformProjectOperationalHistory.at));
      return rows.map(mapHistory);
    },
  };
}
