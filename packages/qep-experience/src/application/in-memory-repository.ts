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
  TraceLinkRecord,
  VerificationDiscipline,
} from "../domain/types";
import type { ExperienceRepository } from "./repository";

function key(tenantId: string, id: string): string {
  return `${tenantId}:${id}`;
}

export function createInMemoryExperienceRepository(): ExperienceRepository {
  const counters = new Map<string, number>();
  const sessions = new Map<string, ExploratorySessionRecord>();
  const areas = new Map<string, ExploratoryArea[]>();
  const sessionHistory = new Map<string, QualityHistoryEntry[]>();
  const plans = new Map<string, ExperiencePlanRecord>();
  const disciplines = new Map<string, VerificationDiscipline[]>();
  const contexts = new Map<
    string,
    ExperienceContextRecord & { tenantId: string; applicationId: string }
  >();
  const criteria = new Map<
    string,
    ExperienceCriterionRecord & { tenantId: string; applicationId: string }
  >();
  const planHistory = new Map<string, QualityHistoryEntry[]>();
  const activities = new Map<string, ExperienceActivityRecord>();
  const results = new Map<string, CriterionResultRecord>();
  const contextActivity = new Map<string, ContextActivityRecord>();
  const activityHistory = new Map<string, QualityHistoryEntry[]>();
  const observations = new Map<string, ObservationRecord>();
  const issues = new Map<string, IssueRecord>();
  const notes = new Map<string, NoteRecord>();
  const evidenceLinks = new Map<
    string,
    EvidenceLinkRecord & { tenantId: string; applicationId: string }
  >();
  const traces = new Map<
    string,
    TraceLinkRecord & { tenantId: string; applicationId: string }
  >();
  const knownEvidence = new Set<string>();
  const evidenceSoR: Array<{
    tenantId: string;
    evidenceId: string;
    targetCapability: string;
    targetId: string;
  }> = [];

  return {
    async nextKeyNumber(tenantId, applicationId, kind) {
      const id = `${tenantId}:${applicationId}:${kind}`;
      const next = (counters.get(id) ?? 100) + 1;
      counters.set(id, next);
      return next;
    },
    async saveSession(row) {
      sessions.set(key(row.tenantId, row.id), row);
    },
    async getSession(tenantId, id) {
      return sessions.get(key(tenantId, id));
    },
    async listSessions(tenantId, applicationId) {
      return [...sessions.values()]
        .filter(
          (row) => row.tenantId === tenantId && row.applicationId === applicationId,
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async saveAreas(tenantId, sessionId, next) {
      areas.set(key(tenantId, sessionId), [...next]);
    },
    async listAreas(tenantId, sessionId) {
      return areas.get(key(tenantId, sessionId)) ?? [];
    },
    async appendSessionHistory(tenantId, sessionId, entry) {
      const id = key(tenantId, sessionId);
      sessionHistory.set(id, [...(sessionHistory.get(id) ?? []), entry]);
    },
    async listSessionHistory(tenantId, sessionId) {
      return sessionHistory.get(key(tenantId, sessionId)) ?? [];
    },
    async savePlan(row) {
      plans.set(key(row.tenantId, row.id), row);
    },
    async getPlan(tenantId, id) {
      return plans.get(key(tenantId, id));
    },
    async listPlans(tenantId, applicationId) {
      return [...plans.values()]
        .filter(
          (row) => row.tenantId === tenantId && row.applicationId === applicationId,
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async saveDisciplines(_tenantId, planId, _applicationId, next) {
      disciplines.set(planId, [...next]);
    },
    async listDisciplines(_tenantId, planId) {
      return disciplines.get(planId) ?? [];
    },
    async saveContext(row) {
      contexts.set(key(row.tenantId ?? "", row.id), {
        ...row,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
      });
    },
    async listContexts(tenantId, planId) {
      return [...contexts.values()]
        .filter((row) => row.tenantId === tenantId && row.planId === planId)
        .sort((a, b) => a.sequence - b.sequence);
    },
    async getContext(tenantId, id) {
      const row = contexts.get(key(tenantId, id));
      return row;
    },
    async saveCriterion(row) {
      criteria.set(key(row.tenantId, row.id), row);
    },
    async listCriteria(tenantId, planId) {
      return [...criteria.values()]
        .filter((row) => row.tenantId === tenantId && row.planId === planId)
        .sort((a, b) => a.sequence - b.sequence);
    },
    async getCriterion(tenantId, id) {
      return criteria.get(key(tenantId, id));
    },
    async appendPlanHistory(tenantId, planId, entry) {
      const id = key(tenantId, planId);
      planHistory.set(id, [...(planHistory.get(id) ?? []), entry]);
    },
    async listPlanHistory(tenantId, planId) {
      return planHistory.get(key(tenantId, planId)) ?? [];
    },
    async saveActivity(row) {
      activities.set(key(row.tenantId, row.id), row);
    },
    async getActivity(tenantId, id) {
      return activities.get(key(tenantId, id));
    },
    async listActivities(tenantId, planId) {
      return [...activities.values()]
        .filter((row) => row.tenantId === tenantId && row.planId === planId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async saveCriterionResult(row) {
      results.set(`${row.activityId}:${row.criterionId}:${row.contextId}`, row);
    },
    async listCriterionResults(tenantId, activityId) {
      return [...results.values()].filter((row) => {
        const activity = activities.get(key(tenantId, row.activityId));
        return row.activityId === activityId && activity?.tenantId === tenantId;
      });
    },
    async saveContextActivity(row) {
      contextActivity.set(`${row.activityId}:${row.contextId}`, row);
    },
    async listContextActivity(tenantId, activityId) {
      return [...contextActivity.values()].filter((row) => {
        const activity = activities.get(key(tenantId, row.activityId));
        return row.activityId === activityId && activity?.tenantId === tenantId;
      });
    },
    async appendActivityHistory(tenantId, activityId, entry) {
      const id = key(tenantId, activityId);
      activityHistory.set(id, [...(activityHistory.get(id) ?? []), entry]);
    },
    async listActivityHistory(tenantId, activityId) {
      return activityHistory.get(key(tenantId, activityId)) ?? [];
    },
    async saveObservation(row) {
      observations.set(key(row.tenantId, row.id), row);
    },
    async getObservation(tenantId, id) {
      return observations.get(key(tenantId, id));
    },
    async listObservations(tenantId, hostKind, hostId) {
      return [...observations.values()].filter(
        (row) =>
          row.tenantId === tenantId &&
          row.hostKind === hostKind &&
          row.hostId === hostId,
      );
    },
    async saveIssue(row) {
      issues.set(key(row.tenantId, row.id), row);
    },
    async getIssue(tenantId, id) {
      return issues.get(key(tenantId, id));
    },
    async listIssues(tenantId, hostKind, hostId) {
      return [...issues.values()].filter(
        (row) =>
          row.tenantId === tenantId &&
          row.hostKind === hostKind &&
          row.hostId === hostId,
      );
    },
    async saveNote(row) {
      notes.set(key(row.tenantId, row.id), row);
    },
    async listNotes(tenantId, hostKind, hostId) {
      return [...notes.values()].filter(
        (row) =>
          row.tenantId === tenantId &&
          row.hostKind === hostKind &&
          row.hostId === hostId,
      );
    },
    async saveEvidenceLink(row) {
      evidenceLinks.set(`${row.evidenceId}:${row.targetKind}:${row.targetId}`, row);
    },
    async listEvidenceLinks(tenantId, targetKind, targetId) {
      return [...evidenceLinks.values()].filter(
        (row) =>
          row.tenantId === tenantId &&
          row.targetKind === targetKind &&
          row.targetId === targetId,
      );
    },
    async countEvidence(tenantId, targetKind, targetId) {
      return (await this.listEvidenceLinks(tenantId, targetKind, targetId)).length;
    },
    async countEvidenceForHost(tenantId, hostKind, hostId, extraTargetIds) {
      const ids = new Set<string>();
      for (const link of evidenceLinks.values()) {
        if (link.tenantId !== tenantId) continue;
        if (
          (link.targetKind === hostKind && link.targetId === hostId) ||
          extraTargetIds.includes(link.targetId)
        ) {
          ids.add(link.evidenceId);
        }
      }
      return ids.size;
    },
    async saveTrace(row) {
      traces.set(`${row.fromKind}:${row.fromId}:${row.toKind}:${row.toId}`, row);
    },
    async listTraces(tenantId, fromKind, fromId) {
      return [...traces.values()].filter(
        (row) =>
          row.tenantId === tenantId &&
          row.fromKind === fromKind &&
          row.fromId === fromId,
      );
    },
    async evidenceExists(tenantId, evidenceId) {
      return (
        knownEvidence.has(`${tenantId}:${evidenceId}`) || evidenceId.startsWith("ev_")
      );
    },
    async associateEvidenceSoR(input) {
      knownEvidence.add(`${input.tenantId}:${input.evidenceId}`);
      evidenceSoR.push({
        tenantId: input.tenantId,
        evidenceId: input.evidenceId,
        targetCapability: input.targetCapability,
        targetId: input.targetId,
      });
    },
  };
}

export function newOpaqueId(prefix: string): string {
  return `${prefix}_${randomUUID().replaceAll("-", "")}`;
}
