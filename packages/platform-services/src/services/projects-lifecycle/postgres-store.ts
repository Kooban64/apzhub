import {
  getDb,
  platformProjectBaseline,
  platformProjectLifecycle,
  platformProjectLifecycleTransition,
  platformProjectLifecycleWaiver,
} from "@apzhub/config/db";
import { and, asc, desc, eq, inArray } from "drizzle-orm";

import type {
  LifecycleTransitionRecord,
  LifecycleWaiver,
  ProjectBaseline,
  ProjectLifecycleRecord,
  ProjectLifecycleStage,
} from "@apzhub/platform-service-contracts";

import type { ProjectsLifecycleStore } from "./memory-store";

function mapLifecycle(
  row: typeof platformProjectLifecycle.$inferSelect,
): ProjectLifecycleRecord {
  return Object.freeze({
    projectId: row.projectId,
    tenantId: row.tenantId,
    stage: row.stage as ProjectLifecycleStage,
    classification: (row.classification ??
      undefined) as ProjectLifecycleRecord["classification"],
    deliveryModel: (row.deliveryModel ??
      undefined) as ProjectLifecycleRecord["deliveryModel"],
    executionCharacteristic:
      (row.executionCharacteristic as ProjectLifecycleRecord["executionCharacteristic"]) ??
      "unspecified",
    governanceProfileId: row.governanceProfileId ?? undefined,
    governanceProfileVersion: row.governanceProfileVersion ?? undefined,
    templateId: row.templateId ?? undefined,
    templateVersion: row.templateVersion ?? undefined,
    ownerUserId: row.ownerUserId ?? undefined,
    programmeId: row.programmeId ?? undefined,
    customerLabel: row.customerLabel ?? undefined,
    targetEndAt: row.targetEndAt?.toISOString(),
    successCriteria: row.successCriteria ?? undefined,
    nextMilestoneIntent: row.nextMilestoneIntent ?? undefined,
    continuousDeliveryWaiver: row.continuousDeliveryWaiver,
    milestoneFreeWaiver: row.milestoneFreeWaiver,
    coreTeamUserIds: Object.freeze([...(row.coreTeamUserIds ?? [])]),
    closureOutcome: (row.closureOutcome ??
      undefined) as ProjectLifecycleRecord["closureOutcome"],
    closureSummary: row.closureSummary ?? undefined,
    holdReason: row.holdReason ?? undefined,
    activeBaselineId: row.activeBaselineId ?? undefined,
    wizardStep: row.wizardStep ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

export function createPostgresProjectsLifecycleStore(): ProjectsLifecycleStore {
  const db = getDb();

  return {
    async getLifecycle(tenantId, projectId) {
      const rows = await db
        .select()
        .from(platformProjectLifecycle)
        .where(
          and(
            eq(platformProjectLifecycle.tenantId, tenantId),
            eq(platformProjectLifecycle.projectId, projectId),
          ),
        )
        .limit(1);
      return rows[0] ? mapLifecycle(rows[0]) : null;
    },

    async upsertLifecycle(tenantId, record) {
      const values = {
        projectId: record.projectId,
        tenantId,
        stage: record.stage,
        classification: record.classification ?? null,
        deliveryModel: record.deliveryModel ?? null,
        executionCharacteristic: record.executionCharacteristic,
        governanceProfileId: record.governanceProfileId ?? null,
        governanceProfileVersion: record.governanceProfileVersion ?? null,
        templateId: record.templateId ?? null,
        templateVersion: record.templateVersion ?? null,
        ownerUserId: record.ownerUserId ?? null,
        programmeId: record.programmeId ?? null,
        customerLabel: record.customerLabel ?? null,
        targetEndAt: record.targetEndAt ? new Date(record.targetEndAt) : null,
        successCriteria: record.successCriteria ?? null,
        nextMilestoneIntent: record.nextMilestoneIntent ?? null,
        continuousDeliveryWaiver: record.continuousDeliveryWaiver,
        milestoneFreeWaiver: record.milestoneFreeWaiver,
        coreTeamUserIds: [...record.coreTeamUserIds],
        closureOutcome: record.closureOutcome ?? null,
        closureSummary: record.closureSummary ?? null,
        holdReason: record.holdReason ?? null,
        activeBaselineId: record.activeBaselineId ?? null,
        wizardStep: record.wizardStep ?? null,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
      };
      await db
        .insert(platformProjectLifecycle)
        .values(values)
        .onConflictDoUpdate({
          target: platformProjectLifecycle.projectId,
          set: { ...values, createdAt: undefined },
        });
      return record;
    },

    async listLifecycles(tenantId, stages) {
      const rows = stages?.length
        ? await db
            .select()
            .from(platformProjectLifecycle)
            .where(
              and(
                eq(platformProjectLifecycle.tenantId, tenantId),
                inArray(platformProjectLifecycle.stage, [...stages]),
              ),
            )
        : await db
            .select()
            .from(platformProjectLifecycle)
            .where(eq(platformProjectLifecycle.tenantId, tenantId));
      return Object.freeze(rows.map(mapLifecycle));
    },

    async listBaselines(tenantId, projectId) {
      const rows = await db
        .select()
        .from(platformProjectBaseline)
        .where(
          and(
            eq(platformProjectBaseline.tenantId, tenantId),
            eq(platformProjectBaseline.projectId, projectId),
          ),
        )
        .orderBy(asc(platformProjectBaseline.version));
      return Object.freeze(
        rows.map((row) =>
          Object.freeze({
            id: row.id,
            projectId: row.projectId,
            version: row.version,
            kind: row.kind as ProjectBaseline["kind"],
            targetEndAt: row.targetEndAt?.toISOString(),
            successCriteria: row.successCriteria ?? undefined,
            milestoneSnapshot: Object.freeze(
              (row.milestoneSnapshot as ProjectBaseline["milestoneSnapshot"]) ?? [],
            ),
            reason: row.reason ?? undefined,
            approvedBy: row.approvedBy ?? undefined,
            createdAt: row.createdAt.toISOString(),
            createdBy: row.createdBy,
          }),
        ),
      );
    },

    async addBaseline(tenantId, baseline) {
      await db.insert(platformProjectBaseline).values({
        id: baseline.id,
        tenantId,
        projectId: baseline.projectId,
        version: baseline.version,
        kind: baseline.kind,
        targetEndAt: baseline.targetEndAt ? new Date(baseline.targetEndAt) : null,
        successCriteria: baseline.successCriteria ?? null,
        milestoneSnapshot: [...baseline.milestoneSnapshot],
        reason: baseline.reason ?? null,
        approvedBy: baseline.approvedBy ?? null,
        createdAt: new Date(baseline.createdAt),
        createdBy: baseline.createdBy,
      });
      return baseline;
    },

    async listTransitions(tenantId, projectId) {
      const rows = await db
        .select()
        .from(platformProjectLifecycleTransition)
        .where(
          and(
            eq(platformProjectLifecycleTransition.tenantId, tenantId),
            eq(platformProjectLifecycleTransition.projectId, projectId),
          ),
        )
        .orderBy(desc(platformProjectLifecycleTransition.at));
      return Object.freeze(
        rows.map((row): LifecycleTransitionRecord =>
          Object.freeze({
            id: row.id,
            projectId: row.projectId,
            from: row.fromStage as LifecycleTransitionRecord["from"],
            to: row.toStage as LifecycleTransitionRecord["to"],
            reason: row.reason ?? undefined,
            outcome: (row.outcome ?? undefined) as LifecycleTransitionRecord["outcome"],
            actorUserId: row.actorUserId,
            at: row.at.toISOString(),
            auditNote: row.auditNote,
          }),
        ),
      );
    },

    async addTransition(tenantId, record) {
      await db.insert(platformProjectLifecycleTransition).values({
        id: record.id,
        tenantId,
        projectId: record.projectId,
        fromStage: record.from,
        toStage: record.to,
        reason: record.reason ?? null,
        outcome: record.outcome ?? null,
        actorUserId: record.actorUserId,
        at: new Date(record.at),
        auditNote: record.auditNote,
      });
      return record;
    },

    async listWaivers(tenantId, projectId) {
      const rows = await db
        .select()
        .from(platformProjectLifecycleWaiver)
        .where(
          and(
            eq(platformProjectLifecycleWaiver.tenantId, tenantId),
            eq(platformProjectLifecycleWaiver.projectId, projectId),
          ),
        );
      return Object.freeze(
        rows.map((row): LifecycleWaiver =>
          Object.freeze({
            id: row.id,
            projectId: row.projectId,
            policyKey: row.policyKey,
            reason: row.reason,
            authorisedBy: row.authorisedBy,
            at: row.at.toISOString(),
          }),
        ),
      );
    },

    async addWaiver(tenantId, waiver) {
      await db.insert(platformProjectLifecycleWaiver).values({
        id: waiver.id,
        tenantId,
        projectId: waiver.projectId,
        policyKey: waiver.policyKey,
        reason: waiver.reason,
        authorisedBy: waiver.authorisedBy,
        at: new Date(waiver.at),
      });
      return waiver;
    },
  };
}
