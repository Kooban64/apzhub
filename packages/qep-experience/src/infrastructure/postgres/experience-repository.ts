import {
  getDatabaseExecutor,
  qepDefinitionKeyCounter,
  qepEvidence,
  qepEvidenceRelationship,
  qepExperienceActivityHistory,
  qepExperienceContext,
  qepExperienceContextActivity,
  qepExperienceCriterion,
  qepExperienceCriterionResult,
  qepExperiencePlan,
  qepExperiencePlanDiscipline,
  qepExperiencePlanHistory,
  qepExperienceVerificationActivity,
  qepExploratoryArea,
  qepExploratorySession,
  qepExploratorySessionHistory,
  qepQualityEvidenceLink,
  qepQualityIssue,
  qepQualityNote,
  qepQualityObservation,
  qepQualityTraceLink,
  type DatabaseExecutor,
} from "@apzhub/config";
import { and, desc, eq, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type {
  ContextActivityRecord,
  CriterionResultRecord,
  EvidenceLinkRecord,
  ExperienceActivityRecord,
  ExperienceContextRecord,
  ExperienceCriterionRecord,
  ExperiencePlanRecord,
  ExploratoryArea,
  ExploratorySessionRecord,
  IssueRecord,
  NoteRecord,
  ObservationRecord,
  QualityHistoryEntry,
  QualityLifecycleState,
  TraceLinkRecord,
  VerificationDiscipline,
} from "../../domain/types";
import type { ExperienceRepository } from "../../application/repository";

function exec(db: DatabaseExecutor): DatabaseExecutor {
  return getDatabaseExecutor(db);
}

function iso(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

function reqIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function createPostgresExperienceRepository(
  db: DatabaseExecutor,
): ExperienceRepository {
  const run = () => exec(db);

  return {
    async nextKeyNumber(tenantId, applicationId, kind) {
      const rows = await run()
        .select()
        .from(qepDefinitionKeyCounter)
        .where(
          and(
            eq(qepDefinitionKeyCounter.tenantId, tenantId),
            eq(qepDefinitionKeyCounter.applicationId, applicationId),
            eq(qepDefinitionKeyCounter.kind, kind),
          ),
        )
        .limit(1);
      const current = rows[0];
      if (!current) {
        await run().insert(qepDefinitionKeyCounter).values({
          tenantId,
          applicationId,
          kind,
          nextValue: 102,
        });
        return 101;
      }
      const value = current.nextValue;
      await run()
        .update(qepDefinitionKeyCounter)
        .set({ nextValue: value + 1 })
        .where(
          and(
            eq(qepDefinitionKeyCounter.tenantId, tenantId),
            eq(qepDefinitionKeyCounter.applicationId, applicationId),
            eq(qepDefinitionKeyCounter.kind, kind),
          ),
        );
      return value;
    },

    async saveSession(row) {
      const values = {
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        number: row.number,
        name: row.name,
        status: row.status,
        testerId: row.testerId,
        testerName: row.testerName ?? null,
        environmentId: row.environmentId ?? null,
        environmentName: row.environmentName ?? null,
        mission: row.mission,
        scope: row.scope,
        sessionNotes: row.sessionNotes ?? null,
        startedAt: row.startedAt ? new Date(row.startedAt) : null,
        pausedAt: row.pausedAt ? new Date(row.pausedAt) : null,
        completedAt: row.completedAt ? new Date(row.completedAt) : null,
        elapsedMs: row.elapsedMs,
        createdAt: new Date(row.createdAt),
        createdBy: row.createdBy,
        updatedAt: new Date(row.updatedAt),
        updatedBy: row.updatedBy,
      };
      await run().insert(qepExploratorySession).values(values).onConflictDoUpdate({
        target: qepExploratorySession.id,
        set: values,
      });
    },

    async getSession(tenantId, id) {
      const rows = await run()
        .select()
        .from(qepExploratorySession)
        .where(
          and(
            eq(qepExploratorySession.tenantId, tenantId),
            eq(qepExploratorySession.id, id),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row) return undefined;
      return mapSession(row);
    },

    async listSessions(tenantId, applicationId) {
      const rows = await run()
        .select()
        .from(qepExploratorySession)
        .where(
          and(
            eq(qepExploratorySession.tenantId, tenantId),
            eq(qepExploratorySession.applicationId, applicationId),
          ),
        )
        .orderBy(desc(qepExploratorySession.updatedAt));
      return rows.map(mapSession);
    },

    async saveAreas(tenantId, sessionId, areas) {
      await run()
        .delete(qepExploratoryArea)
        .where(
          and(
            eq(qepExploratoryArea.tenantId, tenantId),
            eq(qepExploratoryArea.sessionId, sessionId),
          ),
        );
      if (areas.length === 0) return;
      const session = await this.getSession(tenantId, sessionId);
      if (!session) return;
      await run()
        .insert(qepExploratoryArea)
        .values(
          areas.map((area) => ({
            id: area.id,
            tenantId,
            applicationId: session.applicationId,
            sessionId,
            prompt: area.prompt,
            sequence: area.sequence,
            explored: area.explored,
            exploredAt: area.exploredAt ? new Date(area.exploredAt) : null,
            createdAt: new Date(),
            createdBy: session.updatedBy,
          })),
        );
    },

    async listAreas(tenantId, sessionId) {
      const rows = await run()
        .select()
        .from(qepExploratoryArea)
        .where(
          and(
            eq(qepExploratoryArea.tenantId, tenantId),
            eq(qepExploratoryArea.sessionId, sessionId),
          ),
        );
      return rows
        .map((row): ExploratoryArea => ({
          id: row.id,
          prompt: row.prompt,
          sequence: row.sequence,
          explored: row.explored,
          ...(iso(row.exploredAt) ? { exploredAt: iso(row.exploredAt) } : {}),
        }))
        .sort((a, b) => a.sequence - b.sequence);
    },

    async appendSessionHistory(tenantId, sessionId, entry) {
      await run()
        .insert(qepExploratorySessionHistory)
        .values({
          id: entry.id,
          tenantId,
          sessionId,
          eventType: entry.eventType,
          detail: entry.detail ?? null,
          payload: null,
          actorId: entry.actorId,
          occurredAt: new Date(entry.occurredAt),
        });
    },

    async listSessionHistory(tenantId, sessionId) {
      const rows = await run()
        .select()
        .from(qepExploratorySessionHistory)
        .where(
          and(
            eq(qepExploratorySessionHistory.tenantId, tenantId),
            eq(qepExploratorySessionHistory.sessionId, sessionId),
          ),
        );
      return rows
        .map(mapHistory)
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    },

    async savePlan(row) {
      const values = {
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        number: row.number,
        name: row.name,
        status: row.status,
        ownerId: row.ownerId,
        ownerName: row.ownerName ?? null,
        environmentId: row.environmentId ?? null,
        environmentName: row.environmentName ?? null,
        mission: row.mission,
        scope: row.scope,
        createdAt: new Date(row.createdAt),
        createdBy: row.createdBy,
        updatedAt: new Date(row.updatedAt),
        updatedBy: row.updatedBy,
      };
      await run()
        .insert(qepExperiencePlan)
        .values(values)
        .onConflictDoUpdate({ target: qepExperiencePlan.id, set: values });
    },

    async getPlan(tenantId, id) {
      const rows = await run()
        .select()
        .from(qepExperiencePlan)
        .where(
          and(eq(qepExperiencePlan.tenantId, tenantId), eq(qepExperiencePlan.id, id)),
        )
        .limit(1);
      return rows[0] ? mapPlan(rows[0]) : undefined;
    },

    async listPlans(tenantId, applicationId) {
      const rows = await run()
        .select()
        .from(qepExperiencePlan)
        .where(
          and(
            eq(qepExperiencePlan.tenantId, tenantId),
            eq(qepExperiencePlan.applicationId, applicationId),
          ),
        )
        .orderBy(desc(qepExperiencePlan.updatedAt));
      return rows.map(mapPlan);
    },

    async saveDisciplines(tenantId, planId, applicationId, disciplines) {
      await run()
        .delete(qepExperiencePlanDiscipline)
        .where(
          and(
            eq(qepExperiencePlanDiscipline.tenantId, tenantId),
            eq(qepExperiencePlanDiscipline.planId, planId),
          ),
        );
      if (disciplines.length === 0) return;
      await run()
        .insert(qepExperiencePlanDiscipline)
        .values(
          disciplines.map((discipline, sequence) => ({
            id: `uxd_${randomUUID().replaceAll("-", "")}`,
            tenantId,
            applicationId,
            planId,
            discipline,
            sequence,
          })),
        );
    },

    async listDisciplines(tenantId, planId) {
      const rows = await run()
        .select()
        .from(qepExperiencePlanDiscipline)
        .where(
          and(
            eq(qepExperiencePlanDiscipline.tenantId, tenantId),
            eq(qepExperiencePlanDiscipline.planId, planId),
          ),
        );
      return rows
        .sort((a, b) => a.sequence - b.sequence)
        .map((row) => row.discipline as VerificationDiscipline);
    },

    async saveContext(row) {
      await run()
        .insert(qepExperienceContext)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          planId: row.planId,
          label: row.label,
          deviceClass: row.deviceClass,
          viewportWidth: row.viewportWidth ?? null,
          viewportHeight: row.viewportHeight ?? null,
          orientation: row.orientation ?? null,
          browser: row.browser ?? null,
          browserVersion: row.browserVersion ?? null,
          operatingSystem: row.operatingSystem ?? null,
          deviceProfile: row.deviceProfile ?? null,
          sequence: row.sequence,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
        })
        .onConflictDoUpdate({
          target: qepExperienceContext.id,
          set: {
            label: row.label,
            deviceClass: row.deviceClass,
            viewportWidth: row.viewportWidth ?? null,
            viewportHeight: row.viewportHeight ?? null,
          },
        });
    },

    async listContexts(tenantId, planId) {
      const rows = await run()
        .select()
        .from(qepExperienceContext)
        .where(
          and(
            eq(qepExperienceContext.tenantId, tenantId),
            eq(qepExperienceContext.planId, planId),
          ),
        );
      return rows.sort((a, b) => a.sequence - b.sequence).map(mapContext);
    },

    async getContext(tenantId, id) {
      const rows = await run()
        .select()
        .from(qepExperienceContext)
        .where(
          and(
            eq(qepExperienceContext.tenantId, tenantId),
            eq(qepExperienceContext.id, id),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row) return undefined;
      return { ...mapContext(row), applicationId: row.applicationId };
    },

    async saveCriterion(row) {
      await run()
        .insert(qepExperienceCriterion)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          planId: row.planId,
          discipline: row.discipline,
          statement: row.statement,
          sequence: row.sequence,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
        })
        .onConflictDoNothing();
    },

    async listCriteria(tenantId, planId) {
      const rows = await run()
        .select()
        .from(qepExperienceCriterion)
        .where(
          and(
            eq(qepExperienceCriterion.tenantId, tenantId),
            eq(qepExperienceCriterion.planId, planId),
          ),
        );
      return rows.sort((a, b) => a.sequence - b.sequence).map(mapCriterion);
    },

    async getCriterion(tenantId, id) {
      const rows = await run()
        .select()
        .from(qepExperienceCriterion)
        .where(
          and(
            eq(qepExperienceCriterion.tenantId, tenantId),
            eq(qepExperienceCriterion.id, id),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row) return undefined;
      return { ...mapCriterion(row), applicationId: row.applicationId };
    },

    async appendPlanHistory(tenantId, planId, entry) {
      await run()
        .insert(qepExperiencePlanHistory)
        .values({
          id: entry.id,
          tenantId,
          planId,
          eventType: entry.eventType,
          detail: entry.detail ?? null,
          payload: null,
          actorId: entry.actorId,
          occurredAt: new Date(entry.occurredAt),
        });
    },

    async listPlanHistory(tenantId, planId) {
      const rows = await run()
        .select()
        .from(qepExperiencePlanHistory)
        .where(
          and(
            eq(qepExperiencePlanHistory.tenantId, tenantId),
            eq(qepExperiencePlanHistory.planId, planId),
          ),
        );
      return rows
        .map(mapHistory)
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    },

    async saveActivity(row) {
      const values = {
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        planId: row.planId,
        number: row.number,
        status: row.status,
        testerId: row.testerId,
        testerName: row.testerName ?? null,
        currentContextId: row.currentContextId ?? null,
        environmentId: row.environmentId ?? null,
        environmentName: row.environmentName ?? null,
        startedAt: row.startedAt ? new Date(row.startedAt) : null,
        pausedAt: row.pausedAt ? new Date(row.pausedAt) : null,
        completedAt: row.completedAt ? new Date(row.completedAt) : null,
        elapsedMs: row.elapsedMs,
        createdAt: new Date(row.createdAt),
        createdBy: row.createdBy,
        updatedAt: new Date(row.updatedAt),
        updatedBy: row.updatedBy,
      };
      await run()
        .insert(qepExperienceVerificationActivity)
        .values(values)
        .onConflictDoUpdate({
          target: qepExperienceVerificationActivity.id,
          set: values,
        });
    },

    async getActivity(tenantId, id) {
      const rows = await run()
        .select()
        .from(qepExperienceVerificationActivity)
        .where(
          and(
            eq(qepExperienceVerificationActivity.tenantId, tenantId),
            eq(qepExperienceVerificationActivity.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? mapActivity(rows[0]) : undefined;
    },

    async listActivities(tenantId, planId) {
      const rows = await run()
        .select()
        .from(qepExperienceVerificationActivity)
        .where(
          and(
            eq(qepExperienceVerificationActivity.tenantId, tenantId),
            eq(qepExperienceVerificationActivity.planId, planId),
          ),
        )
        .orderBy(desc(qepExperienceVerificationActivity.updatedAt));
      return rows.map(mapActivity);
    },

    async saveCriterionResult(row) {
      await run()
        .insert(qepExperienceCriterionResult)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          activityId: row.activityId,
          criterionId: row.criterionId,
          contextId: row.contextId,
          state: row.state,
          concernFound: row.concernFound,
          note: row.note ?? null,
          recordedAt: new Date(row.recordedAt),
          recordedBy: row.recordedBy,
        })
        .onConflictDoUpdate({
          target: [
            qepExperienceCriterionResult.activityId,
            qepExperienceCriterionResult.criterionId,
            qepExperienceCriterionResult.contextId,
          ],
          set: {
            state: row.state,
            concernFound: row.concernFound,
            note: row.note ?? null,
            recordedAt: new Date(row.recordedAt),
            recordedBy: row.recordedBy,
          },
        });
    },

    async listCriterionResults(tenantId, activityId) {
      const rows = await run()
        .select()
        .from(qepExperienceCriterionResult)
        .where(
          and(
            eq(qepExperienceCriterionResult.tenantId, tenantId),
            eq(qepExperienceCriterionResult.activityId, activityId),
          ),
        );
      return rows.map(mapResult);
    },

    async saveContextActivity(row) {
      await run()
        .insert(qepExperienceContextActivity)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          activityId: row.activityId,
          contextId: row.contextId,
          activatedAt: new Date(row.activatedAt),
          completedAt: row.completedAt ? new Date(row.completedAt) : null,
        })
        .onConflictDoUpdate({
          target: [
            qepExperienceContextActivity.activityId,
            qepExperienceContextActivity.contextId,
          ],
          set: {
            completedAt: row.completedAt ? new Date(row.completedAt) : null,
          },
        });
    },

    async listContextActivity(tenantId, activityId) {
      const rows = await run()
        .select()
        .from(qepExperienceContextActivity)
        .where(
          and(
            eq(qepExperienceContextActivity.tenantId, tenantId),
            eq(qepExperienceContextActivity.activityId, activityId),
          ),
        );
      return rows.map(mapContextActivity);
    },

    async appendActivityHistory(tenantId, activityId, entry) {
      await run()
        .insert(qepExperienceActivityHistory)
        .values({
          id: entry.id,
          tenantId,
          activityId,
          eventType: entry.eventType,
          detail: entry.detail ?? null,
          payload: null,
          actorId: entry.actorId,
          occurredAt: new Date(entry.occurredAt),
        });
    },

    async listActivityHistory(tenantId, activityId) {
      const rows = await run()
        .select()
        .from(qepExperienceActivityHistory)
        .where(
          and(
            eq(qepExperienceActivityHistory.tenantId, tenantId),
            eq(qepExperienceActivityHistory.activityId, activityId),
          ),
        );
      return rows
        .map(mapHistory)
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    },

    async saveObservation(row) {
      await run()
        .insert(qepQualityObservation)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          hostKind: row.hostKind,
          hostId: row.hostId,
          title: row.title,
          body: row.body,
          contextId: row.contextId ?? null,
          criterionId: row.criterionId ?? null,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
        });
    },

    async getObservation(tenantId, id) {
      const rows = await run()
        .select()
        .from(qepQualityObservation)
        .where(
          and(
            eq(qepQualityObservation.tenantId, tenantId),
            eq(qepQualityObservation.id, id),
          ),
        )
        .limit(1);
      return rows[0] ? mapObservation(rows[0]) : undefined;
    },

    async listObservations(tenantId, hostKind, hostId) {
      const rows = await run()
        .select()
        .from(qepQualityObservation)
        .where(
          and(
            eq(qepQualityObservation.tenantId, tenantId),
            eq(qepQualityObservation.hostKind, hostKind),
            eq(qepQualityObservation.hostId, hostId),
          ),
        );
      return rows.map(mapObservation);
    },

    async saveIssue(row) {
      const values = {
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        hostKind: row.hostKind,
        hostId: row.hostId,
        observationId: row.observationId ?? null,
        title: row.title,
        body: row.body,
        priority: row.priority,
        status: row.status,
        contextId: row.contextId ?? null,
        criterionId: row.criterionId ?? null,
        defectId: row.defectId ?? null,
        createdAt: new Date(row.createdAt),
        createdBy: row.createdBy,
        updatedAt: new Date(row.updatedAt),
        updatedBy: row.updatedBy,
      };
      await run()
        .insert(qepQualityIssue)
        .values(values)
        .onConflictDoUpdate({ target: qepQualityIssue.id, set: values });
    },

    async getIssue(tenantId, id) {
      const rows = await run()
        .select()
        .from(qepQualityIssue)
        .where(and(eq(qepQualityIssue.tenantId, tenantId), eq(qepQualityIssue.id, id)))
        .limit(1);
      return rows[0] ? mapIssue(rows[0]) : undefined;
    },

    async listIssues(tenantId, hostKind, hostId) {
      const rows = await run()
        .select()
        .from(qepQualityIssue)
        .where(
          and(
            eq(qepQualityIssue.tenantId, tenantId),
            eq(qepQualityIssue.hostKind, hostKind),
            eq(qepQualityIssue.hostId, hostId),
          ),
        );
      return rows.map(mapIssue);
    },

    async saveNote(row) {
      await run()
        .insert(qepQualityNote)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          hostKind: row.hostKind,
          hostId: row.hostId,
          body: row.body,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
        });
    },

    async listNotes(tenantId, hostKind, hostId) {
      const rows = await run()
        .select()
        .from(qepQualityNote)
        .where(
          and(
            eq(qepQualityNote.tenantId, tenantId),
            eq(qepQualityNote.hostKind, hostKind),
            eq(qepQualityNote.hostId, hostId),
          ),
        );
      return rows.map(mapNote);
    },

    async saveEvidenceLink(row) {
      await run()
        .insert(qepQualityEvidenceLink)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          evidenceId: row.evidenceId,
          targetKind: row.targetKind,
          targetId: row.targetId,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
        })
        .onConflictDoNothing();
    },

    async listEvidenceLinks(tenantId, targetKind, targetId) {
      const rows = await run()
        .select()
        .from(qepQualityEvidenceLink)
        .where(
          and(
            eq(qepQualityEvidenceLink.tenantId, tenantId),
            eq(qepQualityEvidenceLink.targetKind, targetKind),
            eq(qepQualityEvidenceLink.targetId, targetId),
          ),
        );
      return rows.map(mapEvidence);
    },

    async countEvidence(tenantId, targetKind, targetId) {
      return (await this.listEvidenceLinks(tenantId, targetKind, targetId)).length;
    },

    async countEvidenceForHost(tenantId, hostKind, hostId, extraTargetIds) {
      const hostLinks = await this.listEvidenceLinks(tenantId, hostKind, hostId);
      const extra =
        extraTargetIds.length === 0
          ? []
          : await run()
              .select()
              .from(qepQualityEvidenceLink)
              .where(
                and(
                  eq(qepQualityEvidenceLink.tenantId, tenantId),
                  inArray(qepQualityEvidenceLink.targetId, [...extraTargetIds]),
                ),
              );
      return new Set(
        [...hostLinks, ...extra.map(mapEvidence)].map((row) => row.evidenceId),
      ).size;
    },

    async saveTrace(row) {
      await run()
        .insert(qepQualityTraceLink)
        .values({
          id: row.id,
          tenantId: row.tenantId,
          applicationId: row.applicationId,
          fromKind: row.fromKind,
          fromId: row.fromId,
          toKind: row.toKind,
          toId: row.toId,
          createdAt: new Date(row.createdAt),
          createdBy: row.createdBy,
        })
        .onConflictDoNothing();
    },

    async listTraces(tenantId, fromKind, fromId) {
      const rows = await run()
        .select()
        .from(qepQualityTraceLink)
        .where(
          and(
            eq(qepQualityTraceLink.tenantId, tenantId),
            eq(qepQualityTraceLink.fromKind, fromKind),
            eq(qepQualityTraceLink.fromId, fromId),
          ),
        );
      return rows.map(mapTrace);
    },

    async evidenceExists(tenantId, evidenceId) {
      const rows = await run()
        .select({ id: qepEvidence.id })
        .from(qepEvidence)
        .where(and(eq(qepEvidence.tenantId, tenantId), eq(qepEvidence.id, evidenceId)))
        .limit(1);
      return Boolean(rows[0]);
    },

    async associateEvidenceSoR(input) {
      await run()
        .insert(qepEvidenceRelationship)
        .values({
          id: `evr_${randomUUID().replaceAll("-", "")}`,
          tenantId: input.tenantId,
          evidenceId: input.evidenceId,
          targetCapability: input.targetCapability,
          targetId: input.targetId,
          relationType: "attached",
          createdAt: new Date(),
          createdBy: input.actorId,
          revision: 1,
        })
        .onConflictDoNothing();
    },
  };
}

function mapSession(
  row: typeof qepExploratorySession.$inferSelect,
): ExploratorySessionRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    number: row.number,
    name: row.name,
    status: row.status as QualityLifecycleState,
    testerId: row.testerId,
    ...(row.testerName ? { testerName: row.testerName } : {}),
    ...(row.environmentId ? { environmentId: row.environmentId } : {}),
    ...(row.environmentName ? { environmentName: row.environmentName } : {}),
    mission: row.mission,
    scope: row.scope,
    ...(row.sessionNotes ? { sessionNotes: row.sessionNotes } : {}),
    ...(iso(row.startedAt) ? { startedAt: iso(row.startedAt) } : {}),
    ...(iso(row.pausedAt) ? { pausedAt: iso(row.pausedAt) } : {}),
    ...(iso(row.completedAt) ? { completedAt: iso(row.completedAt) } : {}),
    elapsedMs: row.elapsedMs,
    createdAt: reqIso(row.createdAt),
    createdBy: row.createdBy,
    updatedAt: reqIso(row.updatedAt),
    updatedBy: row.updatedBy,
  };
}

function mapPlan(row: typeof qepExperiencePlan.$inferSelect): ExperiencePlanRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    number: row.number,
    name: row.name,
    status: row.status as QualityLifecycleState,
    ownerId: row.ownerId,
    ...(row.ownerName ? { ownerName: row.ownerName } : {}),
    ...(row.environmentId ? { environmentId: row.environmentId } : {}),
    ...(row.environmentName ? { environmentName: row.environmentName } : {}),
    mission: row.mission,
    scope: row.scope,
    createdAt: reqIso(row.createdAt),
    createdBy: row.createdBy,
    updatedAt: reqIso(row.updatedAt),
    updatedBy: row.updatedBy,
  };
}

function mapContext(
  row: typeof qepExperienceContext.$inferSelect,
): ExperienceContextRecord {
  return {
    id: row.id,
    planId: row.planId,
    label: row.label,
    deviceClass: row.deviceClass as ExperienceContextRecord["deviceClass"],
    ...(row.viewportWidth ? { viewportWidth: row.viewportWidth } : {}),
    ...(row.viewportHeight ? { viewportHeight: row.viewportHeight } : {}),
    ...(row.orientation ? { orientation: row.orientation } : {}),
    ...(row.browser ? { browser: row.browser } : {}),
    ...(row.browserVersion ? { browserVersion: row.browserVersion } : {}),
    ...(row.operatingSystem ? { operatingSystem: row.operatingSystem } : {}),
    ...(row.deviceProfile ? { deviceProfile: row.deviceProfile } : {}),
    sequence: row.sequence,
  };
}

function mapCriterion(
  row: typeof qepExperienceCriterion.$inferSelect,
): ExperienceCriterionRecord {
  return {
    id: row.id,
    planId: row.planId,
    discipline: row.discipline as VerificationDiscipline,
    statement: row.statement,
    sequence: row.sequence,
  };
}

function mapActivity(
  row: typeof qepExperienceVerificationActivity.$inferSelect,
): ExperienceActivityRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    planId: row.planId,
    number: row.number,
    status: row.status as QualityLifecycleState,
    testerId: row.testerId,
    ...(row.testerName ? { testerName: row.testerName } : {}),
    ...(row.currentContextId ? { currentContextId: row.currentContextId } : {}),
    ...(row.environmentId ? { environmentId: row.environmentId } : {}),
    ...(row.environmentName ? { environmentName: row.environmentName } : {}),
    ...(iso(row.startedAt) ? { startedAt: iso(row.startedAt) } : {}),
    ...(iso(row.pausedAt) ? { pausedAt: iso(row.pausedAt) } : {}),
    ...(iso(row.completedAt) ? { completedAt: iso(row.completedAt) } : {}),
    elapsedMs: row.elapsedMs,
    createdAt: reqIso(row.createdAt),
    createdBy: row.createdBy,
    updatedAt: reqIso(row.updatedAt),
    updatedBy: row.updatedBy,
  };
}

function mapResult(
  row: typeof qepExperienceCriterionResult.$inferSelect,
): CriterionResultRecord {
  return {
    id: row.id,
    activityId: row.activityId,
    criterionId: row.criterionId,
    contextId: row.contextId,
    state: row.state as CriterionResultRecord["state"],
    concernFound: row.concernFound,
    ...(row.note ? { note: row.note } : {}),
    recordedAt: reqIso(row.recordedAt),
    recordedBy: row.recordedBy,
  };
}

function mapContextActivity(
  row: typeof qepExperienceContextActivity.$inferSelect,
): ContextActivityRecord {
  return {
    id: row.id,
    activityId: row.activityId,
    contextId: row.contextId,
    activatedAt: reqIso(row.activatedAt),
    ...(iso(row.completedAt) ? { completedAt: iso(row.completedAt) } : {}),
  };
}

function mapHistory(row: {
  id: string;
  eventType: string;
  detail: string | null;
  actorId: string;
  occurredAt: Date;
}): QualityHistoryEntry {
  return {
    id: row.id,
    eventType: row.eventType,
    ...(row.detail ? { detail: row.detail } : {}),
    actorId: row.actorId,
    occurredAt: reqIso(row.occurredAt),
  };
}

function mapObservation(
  row: typeof qepQualityObservation.$inferSelect,
): ObservationRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    hostKind: row.hostKind as ObservationRecord["hostKind"],
    hostId: row.hostId,
    title: row.title,
    body: row.body,
    ...(row.contextId ? { contextId: row.contextId } : {}),
    ...(row.criterionId ? { criterionId: row.criterionId } : {}),
    createdAt: reqIso(row.createdAt),
    createdBy: row.createdBy,
  };
}

function mapIssue(row: typeof qepQualityIssue.$inferSelect): IssueRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    hostKind: row.hostKind as IssueRecord["hostKind"],
    hostId: row.hostId,
    ...(row.observationId ? { observationId: row.observationId } : {}),
    title: row.title,
    body: row.body,
    priority: row.priority as IssueRecord["priority"],
    status: row.status as IssueRecord["status"],
    ...(row.contextId ? { contextId: row.contextId } : {}),
    ...(row.criterionId ? { criterionId: row.criterionId } : {}),
    ...(row.defectId ? { defectId: row.defectId } : {}),
    createdAt: reqIso(row.createdAt),
    createdBy: row.createdBy,
    updatedAt: reqIso(row.updatedAt),
    updatedBy: row.updatedBy,
  };
}

function mapNote(row: typeof qepQualityNote.$inferSelect): NoteRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    hostKind: row.hostKind as NoteRecord["hostKind"],
    hostId: row.hostId,
    body: row.body,
    createdAt: reqIso(row.createdAt),
    createdBy: row.createdBy,
  };
}

function mapEvidence(
  row: typeof qepQualityEvidenceLink.$inferSelect,
): EvidenceLinkRecord {
  return {
    id: row.id,
    evidenceId: row.evidenceId,
    targetKind: row.targetKind as EvidenceLinkRecord["targetKind"],
    targetId: row.targetId,
    createdAt: reqIso(row.createdAt),
    createdBy: row.createdBy,
  };
}

function mapTrace(row: typeof qepQualityTraceLink.$inferSelect): TraceLinkRecord {
  return {
    id: row.id,
    fromKind: row.fromKind,
    fromId: row.fromId,
    toKind: row.toKind as TraceLinkRecord["toKind"],
    toId: row.toId,
    createdAt: reqIso(row.createdAt),
    createdBy: row.createdBy,
  };
}
