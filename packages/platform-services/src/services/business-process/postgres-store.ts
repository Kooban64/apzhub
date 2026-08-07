import {
  getDb,
  platformBusinessJourney,
  platformBusinessProcessAudit,
  platformBusinessProcessInstance,
  platformBusinessProcessTemplate,
} from "@apzhub/config/db";
import { and, asc, desc, eq } from "drizzle-orm";

import type {
  BusinessJourney,
  BusinessJourneyStage,
  BusinessJourneyTransition,
  BusinessProcessAuditEntry,
  BusinessProcessInstance,
  BusinessProcessInstanceStatus,
  BusinessProcessPublicationStatus,
  BusinessProcessTemplate,
} from "@apzhub/platform-service-contracts";

import type { BusinessProcessStore } from "./memory-store";

function mapJourney(row: typeof platformBusinessJourney.$inferSelect): BusinessJourney {
  return Object.freeze({
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    summary: row.summary,
    outcomes: Object.freeze([...(row.outcomes ?? [])]),
    stages: Object.freeze([...(row.stages ?? [])] as BusinessJourneyStage[]),
    transitions: Object.freeze([
      ...(row.transitions ?? []),
    ] as BusinessJourneyTransition[]),
    processOwner: row.processOwner,
    businessSteward: row.businessSteward,
    version: row.version,
    publicationStatus: row.publicationStatus as BusinessProcessPublicationStatus,
    reviewCycleDays: row.reviewCycleDays ?? undefined,
    nextReviewAt: row.nextReviewAt?.toISOString(),
    templateKey: row.templateKey ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function mapTemplate(
  row: typeof platformBusinessProcessTemplate.$inferSelect,
): BusinessProcessTemplate {
  return Object.freeze({
    id: row.id,
    key: row.key,
    name: row.name,
    summary: row.summary,
    defaultOutcomes: Object.freeze([...(row.defaultOutcomes ?? [])]),
    defaultStages: Object.freeze([
      ...(row.defaultStages ?? []),
    ] as BusinessProcessTemplate["defaultStages"]),
    defaultTransitions: Object.freeze([
      ...(row.defaultTransitions ?? []),
    ] as BusinessProcessTemplate["defaultTransitions"]),
    version: row.version,
    editable: row.editable,
  });
}

function mapInstance(
  row: typeof platformBusinessProcessInstance.$inferSelect,
): BusinessProcessInstance {
  return Object.freeze({
    id: row.id,
    tenantId: row.tenantId,
    journeyId: row.journeyId,
    title: row.title,
    currentStageId: row.currentStageId,
    status: row.status as BusinessProcessInstanceStatus,
    enteredStageAt: row.enteredStageAt.toISOString(),
    dueAt: row.dueAt?.toISOString(),
    completedAt: row.completedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function mapAudit(
  row: typeof platformBusinessProcessAudit.$inferSelect,
): BusinessProcessAuditEntry {
  return Object.freeze({
    id: row.id,
    journeyId: row.journeyId,
    action: row.action,
    fromStatus:
      (row.fromStatus as BusinessProcessPublicationStatus | null) ?? undefined,
    toStatus: (row.toStatus as BusinessProcessPublicationStatus | null) ?? undefined,
    actor: row.actor,
    notes: row.notes ?? undefined,
    at: row.at.toISOString(),
  });
}

export function createPostgresBusinessProcessStore(): BusinessProcessStore {
  return {
    async listJourneys(tenantId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformBusinessJourney)
        .where(eq(platformBusinessJourney.tenantId, tenantId))
        .orderBy(desc(platformBusinessJourney.updatedAt));
      return rows.map(mapJourney);
    },

    async getJourney(tenantId, journeyId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformBusinessJourney)
        .where(
          and(
            eq(platformBusinessJourney.tenantId, tenantId),
            eq(platformBusinessJourney.id, journeyId),
          ),
        )
        .limit(1);
      return rows[0] ? mapJourney(rows[0]) : null;
    },

    async upsertJourney(item) {
      const db = getDb();
      await db
        .insert(platformBusinessJourney)
        .values({
          id: item.id,
          tenantId: item.tenantId,
          name: item.name,
          summary: item.summary,
          outcomes: [...item.outcomes],
          stages: [...item.stages],
          transitions: [...item.transitions],
          processOwner: item.processOwner,
          businessSteward: item.businessSteward,
          version: item.version,
          publicationStatus: item.publicationStatus,
          reviewCycleDays: item.reviewCycleDays ?? null,
          nextReviewAt: item.nextReviewAt ? new Date(item.nextReviewAt) : null,
          templateKey: item.templateKey ?? null,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
        .onConflictDoUpdate({
          target: platformBusinessJourney.id,
          set: {
            name: item.name,
            summary: item.summary,
            outcomes: [...item.outcomes],
            stages: [...item.stages],
            transitions: [...item.transitions],
            processOwner: item.processOwner,
            businessSteward: item.businessSteward,
            version: item.version,
            publicationStatus: item.publicationStatus,
            reviewCycleDays: item.reviewCycleDays ?? null,
            nextReviewAt: item.nextReviewAt ? new Date(item.nextReviewAt) : null,
            templateKey: item.templateKey ?? null,
            updatedAt: new Date(item.updatedAt),
          },
        });
      return item;
    },

    async listTemplates(tenantId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformBusinessProcessTemplate)
        .where(eq(platformBusinessProcessTemplate.tenantId, tenantId))
        .orderBy(asc(platformBusinessProcessTemplate.name));
      return rows.map(mapTemplate);
    },

    async upsertTemplate(item) {
      const db = getDb();
      const now = new Date();
      await db
        .insert(platformBusinessProcessTemplate)
        .values({
          id: item.id,
          tenantId: item.tenantId,
          key: item.key,
          name: item.name,
          summary: item.summary,
          defaultOutcomes: [...item.defaultOutcomes],
          defaultStages: [...item.defaultStages],
          defaultTransitions: [...item.defaultTransitions],
          version: item.version,
          editable: item.editable,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: platformBusinessProcessTemplate.id,
          set: {
            name: item.name,
            summary: item.summary,
            defaultOutcomes: [...item.defaultOutcomes],
            defaultStages: [...item.defaultStages],
            defaultTransitions: [...item.defaultTransitions],
            version: item.version,
            editable: item.editable,
            updatedAt: now,
          },
        });
      const { tenantId: _t, ...rest } = item;
      return rest;
    },

    async listInstances(tenantId, journeyId) {
      const db = getDb();
      const rows = journeyId
        ? await db
            .select()
            .from(platformBusinessProcessInstance)
            .where(
              and(
                eq(platformBusinessProcessInstance.tenantId, tenantId),
                eq(platformBusinessProcessInstance.journeyId, journeyId),
              ),
            )
            .orderBy(desc(platformBusinessProcessInstance.updatedAt))
        : await db
            .select()
            .from(platformBusinessProcessInstance)
            .where(eq(platformBusinessProcessInstance.tenantId, tenantId))
            .orderBy(desc(platformBusinessProcessInstance.updatedAt));
      return rows.map(mapInstance);
    },

    async upsertInstance(item) {
      const db = getDb();
      await db
        .insert(platformBusinessProcessInstance)
        .values({
          id: item.id,
          tenantId: item.tenantId,
          journeyId: item.journeyId,
          title: item.title,
          currentStageId: item.currentStageId,
          status: item.status,
          enteredStageAt: new Date(item.enteredStageAt),
          dueAt: item.dueAt ? new Date(item.dueAt) : null,
          completedAt: item.completedAt ? new Date(item.completedAt) : null,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })
        .onConflictDoUpdate({
          target: platformBusinessProcessInstance.id,
          set: {
            title: item.title,
            currentStageId: item.currentStageId,
            status: item.status,
            enteredStageAt: new Date(item.enteredStageAt),
            dueAt: item.dueAt ? new Date(item.dueAt) : null,
            completedAt: item.completedAt ? new Date(item.completedAt) : null,
            updatedAt: new Date(item.updatedAt),
          },
        });
      return item;
    },

    async listAudit(tenantId, journeyId) {
      const db = getDb();
      const rows = await db
        .select()
        .from(platformBusinessProcessAudit)
        .where(
          and(
            eq(platformBusinessProcessAudit.tenantId, tenantId),
            eq(platformBusinessProcessAudit.journeyId, journeyId),
          ),
        )
        .orderBy(desc(platformBusinessProcessAudit.at));
      return rows.map(mapAudit);
    },

    async appendAudit(tenantId, entry) {
      const db = getDb();
      await db.insert(platformBusinessProcessAudit).values({
        id: entry.id,
        tenantId,
        journeyId: entry.journeyId,
        action: entry.action,
        fromStatus: entry.fromStatus ?? null,
        toStatus: entry.toStatus ?? null,
        actor: entry.actor,
        notes: entry.notes ?? null,
        at: new Date(entry.at),
      });
      return entry;
    },
  };
}
