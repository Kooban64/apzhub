import { randomUUID } from "node:crypto";

import {
  assertApplicationBound,
  assertNoRawSecrets,
  assertNotInfrastructureAlias,
  assertSameApplication,
  isCriterionState,
  isDeviceClass,
  isDiscipline,
  isHostKind,
  isIssuePriority,
  isOptionalTraceKind,
  requireText,
} from "../domain/guards";
import { deriveWorkProgress, liveElapsedMs } from "../domain/progress";
import type {
  CaptureCounts,
  CreateContextInput,
  CreateCriterionInput,
  CreatePlanInput,
  CreateSessionInput,
  CriterionResultState,
  DeviceClass,
  EvidenceTargetKind,
  ExperienceActivityRecord,
  ExploratoryArea,
  ExploratorySessionRecord,
  ExperiencePlanRecord,
  IssuePriority,
  PresentedExperienceActivity,
  PresentedExperiencePlan,
  PresentedExploratorySession,
  QualityHostKind,
  QualityLifecycleState,
  VerificationDiscipline,
  ViewportMatrixCell,
} from "../domain/types";
import { newOpaqueId } from "./in-memory-repository";
import type { ExperienceRepository } from "./repository";

function nowIso(): string {
  return new Date().toISOString();
}

function historyId(): string {
  return `qeh_${randomUUID().replaceAll("-", "")}`;
}

const ALLOWED_EVIDENCE: readonly EvidenceTargetKind[] = [
  "exploratory_session",
  "experience_verification",
  "quality_observation",
  "quality_issue",
  "experience_criterion",
  "experience_context",
];

async function captureCounts(
  repository: ExperienceRepository,
  tenantId: string,
  hostKind: QualityHostKind,
  hostId: string,
  extraIds: readonly string[] = [],
): Promise<CaptureCounts> {
  const [observations, issues, notes, evidence] = await Promise.all([
    repository.listObservations(tenantId, hostKind, hostId),
    repository.listIssues(tenantId, hostKind, hostId),
    repository.listNotes(tenantId, hostKind, hostId),
    repository.countEvidenceForHost(tenantId, hostKind, hostId, extraIds),
  ]);
  return {
    observations: observations.length,
    issues: issues.length,
    notes: notes.length,
    evidence,
  };
}

function durationOf(row: {
  readonly status: string;
  readonly elapsedMs: number;
  readonly startedAt?: string;
  readonly pausedAt?: string;
  readonly updatedAt: string;
}): number {
  return liveElapsedMs({
    status: row.status,
    elapsedMs: row.elapsedMs,
    startedAt: row.status === "in_progress" ? row.updatedAt : row.startedAt,
    pausedAt: row.pausedAt,
  });
}

export type ExperienceService = {
  createSession(input: CreateSessionInput): Promise<PresentedExploratorySession>;
  getSession(tenantId: string, id: string): Promise<PresentedExploratorySession>;
  listSessions(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly PresentedExploratorySession[]>;
  updateCharter(input: {
    readonly tenantId: string;
    readonly sessionId: string;
    readonly actorId: string;
    readonly name?: string;
    readonly mission?: string;
    readonly scope?: string;
    readonly sessionNotes?: string;
    readonly areas?: readonly string[];
  }): Promise<PresentedExploratorySession>;
  addArea(input: {
    readonly tenantId: string;
    readonly sessionId: string;
    readonly actorId: string;
    readonly prompt: string;
  }): Promise<PresentedExploratorySession>;
  markAreaExplored(input: {
    readonly tenantId: string;
    readonly sessionId: string;
    readonly areaId: string;
    readonly actorId: string;
  }): Promise<PresentedExploratorySession>;
  transitionSession(input: {
    readonly tenantId: string;
    readonly sessionId: string;
    readonly actorId: string;
    readonly action: "start" | "pause" | "resume" | "complete" | "block";
  }): Promise<PresentedExploratorySession>;

  createPlan(input: CreatePlanInput): Promise<PresentedExperiencePlan>;
  getPlan(tenantId: string, id: string): Promise<PresentedExperiencePlan>;
  listPlans(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly PresentedExperiencePlan[]>;
  addContext(input: {
    readonly tenantId: string;
    readonly planId: string;
    readonly actorId: string;
    readonly context: CreateContextInput;
  }): Promise<PresentedExperiencePlan>;
  addCriterion(input: {
    readonly tenantId: string;
    readonly planId: string;
    readonly actorId: string;
    readonly criterion: CreateCriterionInput;
  }): Promise<PresentedExperiencePlan>;
  setDisciplines(input: {
    readonly tenantId: string;
    readonly planId: string;
    readonly actorId: string;
    readonly disciplines: readonly string[];
  }): Promise<PresentedExperiencePlan>;

  startActivity(input: {
    readonly tenantId: string;
    readonly planId: string;
    readonly actorId: string;
    readonly testerName?: string;
  }): Promise<PresentedExperienceActivity>;
  getActivity(tenantId: string, id: string): Promise<PresentedExperienceActivity>;
  getLatestActivity(
    tenantId: string,
    planId: string,
  ): Promise<PresentedExperienceActivity | undefined>;
  transitionActivity(input: {
    readonly tenantId: string;
    readonly activityId: string;
    readonly actorId: string;
    readonly action: "pause" | "resume" | "complete" | "block";
  }): Promise<PresentedExperienceActivity>;
  activateContext(input: {
    readonly tenantId: string;
    readonly activityId: string;
    readonly contextId: string;
    readonly actorId: string;
  }): Promise<PresentedExperienceActivity>;
  completeContext(input: {
    readonly tenantId: string;
    readonly activityId: string;
    readonly contextId: string;
    readonly actorId: string;
  }): Promise<PresentedExperienceActivity>;
  recordCriterionResult(input: {
    readonly tenantId: string;
    readonly activityId: string;
    readonly criterionId: string;
    readonly contextId: string;
    readonly actorId: string;
    readonly state: string;
    readonly concernFound?: boolean;
    readonly note?: string;
  }): Promise<PresentedExperienceActivity>;

  addObservation(input: {
    readonly tenantId: string;
    readonly hostKind: string;
    readonly hostId: string;
    readonly actorId: string;
    readonly title: string;
    readonly body: string;
    readonly contextId?: string;
    readonly criterionId?: string;
  }): Promise<ObservationOut>;
  addIssue(input: {
    readonly tenantId: string;
    readonly hostKind: string;
    readonly hostId: string;
    readonly actorId: string;
    readonly title: string;
    readonly body: string;
    readonly observationId?: string;
    readonly priority?: string;
    readonly contextId?: string;
    readonly criterionId?: string;
  }): Promise<IssueOut>;
  addNote(input: {
    readonly tenantId: string;
    readonly hostKind: string;
    readonly hostId: string;
    readonly actorId: string;
    readonly body: string;
  }): Promise<NoteOut>;
  getIssue(tenantId: string, issueId: string): Promise<NonNullable<IssueOut>>;
  dismissIssue(input: {
    readonly tenantId: string;
    readonly issueId: string;
    readonly actorId: string;
  }): Promise<IssueOut>;
  resolveIssue(input: {
    readonly tenantId: string;
    readonly issueId: string;
    readonly actorId: string;
  }): Promise<IssueOut>;
  linkIssueDefect(input: {
    readonly tenantId: string;
    readonly issueId: string;
    readonly defectId: string;
    readonly actorId: string;
    readonly promoted?: boolean;
  }): Promise<IssueOut>;
  attachEvidence(input: {
    readonly tenantId: string;
    readonly actorId: string;
    readonly evidenceId: string;
    readonly targetKind: string;
    readonly targetId: string;
  }): Promise<void>;
  addTrace(input: {
    readonly tenantId: string;
    readonly actorId: string;
    readonly fromKind: "exploratory_session" | "experience_plan";
    readonly fromId: string;
    readonly toKind: string;
    readonly toId: string;
  }): Promise<void>;
};

type ObservationOut = Awaited<ReturnType<ExperienceRepository["getObservation"]>>;
type IssueOut = Awaited<ReturnType<ExperienceRepository["getIssue"]>>;
type NoteOut = {
  readonly id: string;
  readonly body: string;
  readonly createdAt: string;
  readonly createdBy: string;
};

async function presentSession(
  repository: ExperienceRepository,
  session: ExploratorySessionRecord,
): Promise<PresentedExploratorySession> {
  const [areas, history, observations, issues, notes, traces] = await Promise.all([
    repository.listAreas(session.tenantId, session.id),
    repository.listSessionHistory(session.tenantId, session.id),
    repository.listObservations(session.tenantId, "exploratory_session", session.id),
    repository.listIssues(session.tenantId, "exploratory_session", session.id),
    repository.listNotes(session.tenantId, "exploratory_session", session.id),
    repository.listTraces(session.tenantId, "exploratory_session", session.id),
  ]);
  const extraIds = [
    ...observations.map((item) => item.id),
    ...issues.map((item) => item.id),
  ];
  const counts = await captureCounts(
    repository,
    session.tenantId,
    "exploratory_session",
    session.id,
    extraIds,
  );
  const explored = areas.filter((area) => area.explored).length;
  return {
    ...session,
    areas,
    history,
    observations,
    issues,
    notes,
    traces,
    counts,
    progress: deriveWorkProgress(explored, areas.length),
    durationMs: durationOf(session),
  };
}

function viewportStatus(
  contextId: string,
  results: readonly { contextId: string; state: string }[],
  activated: boolean,
  criteriaCount: number,
): ViewportMatrixCell["status"] {
  const forContext = results.filter((row) => row.contextId === contextId);
  if (
    criteriaCount > 0 &&
    forContext.filter((row) => row.state === "verified").length >= criteriaCount
  ) {
    return "verified";
  }
  if (activated || forContext.length > 0) return "in_progress";
  return "pending";
}

async function presentPlan(
  repository: ExperienceRepository,
  plan: ExperiencePlanRecord,
): Promise<PresentedExperiencePlan> {
  const [disciplines, contexts, criteria, activities, traces] = await Promise.all([
    repository.listDisciplines(plan.tenantId, plan.id),
    repository.listContexts(plan.tenantId, plan.id),
    repository.listCriteria(plan.tenantId, plan.id),
    repository.listActivities(plan.tenantId, plan.id),
    repository.listTraces(plan.tenantId, "experience_plan", plan.id),
  ]);
  const latest = activities[0];
  let counts: CaptureCounts = { observations: 0, issues: 0, notes: 0, evidence: 0 };
  let progress = deriveWorkProgress(0, criteria.length * Math.max(contexts.length, 1));
  if (latest) {
    const presented = await presentActivity(repository, latest);
    counts = presented.counts;
    progress = presented.progress;
  } else {
    progress = deriveWorkProgress(0, criteria.length * Math.max(contexts.length, 0));
  }
  return {
    ...plan,
    disciplines,
    contexts,
    criteria,
    traces,
    counts,
    progress,
    ...(latest ? { latestActivityId: latest.id } : {}),
  };
}

async function presentActivity(
  repository: ExperienceRepository,
  activity: ExperienceActivityRecord,
): Promise<PresentedExperienceActivity> {
  const planRow = await repository.getPlan(activity.tenantId, activity.planId);
  if (!planRow) throw new Error("experience_activity.plan_not_found");
  const [
    disciplines,
    contexts,
    criteria,
    results,
    contextActivity,
    history,
    observations,
    issues,
    notes,
    traces,
  ] = await Promise.all([
    repository.listDisciplines(activity.tenantId, planRow.id),
    repository.listContexts(activity.tenantId, planRow.id),
    repository.listCriteria(activity.tenantId, planRow.id),
    repository.listCriterionResults(activity.tenantId, activity.id),
    repository.listContextActivity(activity.tenantId, activity.id),
    repository.listActivityHistory(activity.tenantId, activity.id),
    repository.listObservations(
      activity.tenantId,
      "experience_verification",
      activity.id,
    ),
    repository.listIssues(activity.tenantId, "experience_verification", activity.id),
    repository.listNotes(activity.tenantId, "experience_verification", activity.id),
    repository.listTraces(activity.tenantId, "experience_plan", planRow.id),
  ]);
  const extraIds = [
    ...observations.map((item) => item.id),
    ...issues.map((item) => item.id),
    ...results.flatMap((row) => [row.criterionId, row.contextId]),
  ];
  const counts = await captureCounts(
    repository,
    activity.tenantId,
    "experience_verification",
    activity.id,
    extraIds,
  );
  const applicable = criteria.length * contexts.length;
  const completed = results.filter(
    (row) => row.state === "verified" || row.state === "partially_verified",
  ).length;
  const activated = new Set(contextActivity.map((row) => row.contextId));
  const viewportMatrix: ViewportMatrixCell[] = contexts.map((context) => ({
    contextId: context.id,
    label: context.label,
    deviceClass: context.deviceClass,
    status: viewportStatus(
      context.id,
      results,
      activated.has(context.id),
      criteria.length,
    ),
  }));
  return {
    ...activity,
    plan: {
      ...planRow,
      disciplines,
      contexts,
      criteria,
      traces,
      counts,
      progress: deriveWorkProgress(completed, applicable),
      latestActivityId: activity.id,
    },
    results,
    contextActivity,
    viewportMatrix,
    progress: deriveWorkProgress(completed, applicable),
    counts,
    durationMs: durationOf(activity),
    history,
    observations,
    issues,
    notes,
  };
}

async function requireHost(
  repository: ExperienceRepository,
  tenantId: string,
  hostKind: QualityHostKind,
  hostId: string,
): Promise<{ applicationId: string }> {
  if (hostKind === "exploratory_session") {
    const session = await repository.getSession(tenantId, hostId);
    if (!session) throw new Error("exploratory_session.not_found");
    return { applicationId: session.applicationId };
  }
  const activity = await repository.getActivity(tenantId, hostId);
  if (!activity) throw new Error("experience_activity.not_found");
  return { applicationId: activity.applicationId };
}

function applyLifecycle(
  current: QualityLifecycleState,
  action: "start" | "pause" | "resume" | "complete" | "block",
): QualityLifecycleState {
  if (
    action === "start" &&
    (current === "draft" || current === "planned" || current === "paused")
  ) {
    return "in_progress";
  }
  if (action === "pause" && current === "in_progress") return "paused";
  if (action === "resume" && current === "paused") return "in_progress";
  if (action === "complete" && (current === "in_progress" || current === "paused"))
    return "completed";
  if (action === "block" && current !== "completed") return "blocked";
  throw new Error(`quality_lifecycle.invalid:${current}:${action}`);
}

export function createExperienceService(
  repository: ExperienceRepository,
): ExperienceService {
  return {
    async createSession(input) {
      assertApplicationBound(input.applicationId, "exploratory_session");
      const name = requireText(input.name, "exploratory_session.name");
      const mission = requireText(input.mission, "exploratory_session.mission");
      const scope = requireText(input.scope, "exploratory_session.scope");
      assertNoRawSecrets(mission, "exploratory_session.mission");
      assertNoRawSecrets(scope, "exploratory_session.scope");
      const n = await repository.nextKeyNumber(
        input.tenantId,
        input.applicationId,
        "exploratory_session",
      );
      const now = nowIso();
      const session: ExploratorySessionRecord = {
        id: newOpaqueId("qes"),
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        number: `EXS-${n}`,
        name,
        status: "draft",
        testerId: input.testerId?.trim() || input.actorId,
        ...(input.testerName ? { testerName: input.testerName } : {}),
        ...(input.environmentId ? { environmentId: input.environmentId } : {}),
        ...(input.environmentName ? { environmentName: input.environmentName } : {}),
        mission,
        scope,
        ...(input.sessionNotes ? { sessionNotes: input.sessionNotes } : {}),
        elapsedMs: 0,
        createdAt: now,
        createdBy: input.actorId,
        updatedAt: now,
        updatedBy: input.actorId,
      };
      await repository.saveSession(session);
      const areaRows: ExploratoryArea[] = (input.areas ?? []).map((prompt, index) => ({
        id: newOpaqueId("qea"),
        prompt: requireText(prompt, "exploratory_session.area"),
        sequence: index,
        explored: false,
      }));
      await repository.saveAreas(input.tenantId, session.id, areaRows);
      await repository.appendSessionHistory(input.tenantId, session.id, {
        id: historyId(),
        eventType: "session_created",
        detail: session.number,
        actorId: input.actorId,
        occurredAt: now,
      });
      return presentSession(repository, session);
    },

    async getSession(tenantId, id) {
      const session = await repository.getSession(tenantId, id);
      if (!session) throw new Error("exploratory_session.not_found");
      return presentSession(repository, session);
    },

    async listSessions(tenantId, applicationId) {
      assertApplicationBound(applicationId, "exploratory_session");
      const rows = await repository.listSessions(tenantId, applicationId);
      return Promise.all(rows.map((row) => presentSession(repository, row)));
    },

    async updateCharter(input) {
      const current = await repository.getSession(input.tenantId, input.sessionId);
      if (!current) throw new Error("exploratory_session.not_found");
      const now = nowIso();
      const next: ExploratorySessionRecord = {
        ...current,
        ...(input.name
          ? { name: requireText(input.name, "exploratory_session.name") }
          : {}),
        ...(input.mission
          ? { mission: requireText(input.mission, "exploratory_session.mission") }
          : {}),
        ...(input.scope
          ? { scope: requireText(input.scope, "exploratory_session.scope") }
          : {}),
        ...(input.sessionNotes !== undefined
          ? { sessionNotes: input.sessionNotes }
          : {}),
        updatedAt: now,
        updatedBy: input.actorId,
      };
      await repository.saveSession(next);
      if (input.areas) {
        const existing = await repository.listAreas(input.tenantId, input.sessionId);
        const areaRows: ExploratoryArea[] = input.areas.map((prompt, index) => {
          const prior = existing[index];
          return {
            id: prior?.id ?? newOpaqueId("qea"),
            prompt: requireText(prompt, "exploratory_session.area"),
            sequence: index,
            explored: prior?.explored ?? false,
            ...(prior?.exploredAt ? { exploredAt: prior.exploredAt } : {}),
          };
        });
        await repository.saveAreas(input.tenantId, input.sessionId, areaRows);
      }
      await repository.appendSessionHistory(input.tenantId, input.sessionId, {
        id: historyId(),
        eventType: "charter_updated",
        actorId: input.actorId,
        occurredAt: now,
      });
      return presentSession(repository, next);
    },

    async addArea(input) {
      const current = await repository.getSession(input.tenantId, input.sessionId);
      if (!current) throw new Error("exploratory_session.not_found");
      const existing = await repository.listAreas(input.tenantId, input.sessionId);
      await repository.saveAreas(input.tenantId, input.sessionId, [
        ...existing,
        {
          id: newOpaqueId("qea"),
          prompt: requireText(input.prompt, "exploratory_session.area"),
          sequence: existing.length,
          explored: false,
        },
      ]);
      await repository.appendSessionHistory(input.tenantId, input.sessionId, {
        id: historyId(),
        eventType: "area_added",
        detail: input.prompt,
        actorId: input.actorId,
        occurredAt: nowIso(),
      });
      return presentSession(repository, current);
    },

    async markAreaExplored(input) {
      const current = await repository.getSession(input.tenantId, input.sessionId);
      if (!current) throw new Error("exploratory_session.not_found");
      const existing = await repository.listAreas(input.tenantId, input.sessionId);
      const now = nowIso();
      await repository.saveAreas(
        input.tenantId,
        input.sessionId,
        existing.map((area) =>
          area.id === input.areaId
            ? { ...area, explored: true, exploredAt: now }
            : area,
        ),
      );
      await repository.appendSessionHistory(input.tenantId, input.sessionId, {
        id: historyId(),
        eventType: "area_explored",
        detail: input.areaId,
        actorId: input.actorId,
        occurredAt: now,
      });
      return presentSession(repository, current);
    },

    async transitionSession(input) {
      const current = await repository.getSession(input.tenantId, input.sessionId);
      if (!current) throw new Error("exploratory_session.not_found");
      const now = nowIso();
      const nextStatus = applyLifecycle(current.status, input.action);
      let elapsedMs = current.elapsedMs;
      if (input.action === "pause" && current.status === "in_progress") {
        elapsedMs = durationOf(current);
      }
      const next: ExploratorySessionRecord = {
        ...current,
        status: nextStatus,
        elapsedMs,
        updatedAt: now,
        updatedBy: input.actorId,
        ...(input.action === "start" && !current.startedAt ? { startedAt: now } : {}),
        ...(input.action === "pause" ? { pausedAt: now } : {}),
        ...(input.action === "resume" ? { pausedAt: undefined } : {}),
        ...(input.action === "complete"
          ? { completedAt: now, pausedAt: undefined }
          : {}),
      };
      await repository.saveSession(next);
      await repository.appendSessionHistory(input.tenantId, input.sessionId, {
        id: historyId(),
        eventType: `session_${input.action === "start" ? "started" : input.action === "pause" ? "paused" : input.action === "resume" ? "resumed" : input.action === "complete" ? "completed" : "blocked"}`,
        actorId: input.actorId,
        occurredAt: now,
      });
      return presentSession(repository, next);
    },

    async createPlan(input) {
      assertApplicationBound(input.applicationId, "experience_plan");
      const name = requireText(input.name, "experience_plan.name");
      const mission = requireText(input.mission, "experience_plan.mission");
      const scope = requireText(input.scope, "experience_plan.scope");
      const n = await repository.nextKeyNumber(
        input.tenantId,
        input.applicationId,
        "experience_plan",
      );
      const now = nowIso();
      const plan = {
        id: newOpaqueId("uxp"),
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        number: `UXP-${n}`,
        name,
        status: "draft" as const,
        ownerId: input.ownerId?.trim() || input.actorId,
        ...(input.ownerName ? { ownerName: input.ownerName } : {}),
        ...(input.environmentId ? { environmentId: input.environmentId } : {}),
        ...(input.environmentName ? { environmentName: input.environmentName } : {}),
        mission,
        scope,
        createdAt: now,
        createdBy: input.actorId,
        updatedAt: now,
        updatedBy: input.actorId,
      };
      await repository.savePlan(plan);
      const disciplines = (input.disciplines ?? [])
        .map((value) => value.trim())
        .filter(isDiscipline);
      await repository.saveDisciplines(
        input.tenantId,
        plan.id,
        input.applicationId,
        disciplines,
      );
      await repository.appendPlanHistory(input.tenantId, plan.id, {
        id: historyId(),
        eventType: "plan_created",
        detail: plan.number,
        actorId: input.actorId,
        occurredAt: now,
      });
      return presentPlan(repository, plan);
    },

    async getPlan(tenantId, id) {
      const plan = await repository.getPlan(tenantId, id);
      if (!plan) throw new Error("experience_plan.not_found");
      return presentPlan(repository, plan);
    },

    async listPlans(tenantId, applicationId) {
      assertApplicationBound(applicationId, "experience_plan");
      const rows = await repository.listPlans(tenantId, applicationId);
      return Promise.all(rows.map((row) => presentPlan(repository, row)));
    },

    async addContext(input) {
      const plan = await repository.getPlan(input.tenantId, input.planId);
      if (!plan) throw new Error("experience_plan.not_found");
      const deviceClass = input.context.deviceClass.trim().toLowerCase();
      assertNotInfrastructureAlias(deviceClass, "experience_context");
      if (!isDeviceClass(deviceClass))
        throw new Error("experience_context.device_class_invalid");
      const existing = await repository.listContexts(input.tenantId, input.planId);
      const now = nowIso();
      await repository.saveContext({
        id: newOpaqueId("uxx"),
        planId: plan.id,
        label: requireText(input.context.label, "experience_context.label"),
        deviceClass: deviceClass as DeviceClass,
        ...(input.context.viewportWidth
          ? { viewportWidth: input.context.viewportWidth }
          : {}),
        ...(input.context.viewportHeight
          ? { viewportHeight: input.context.viewportHeight }
          : {}),
        ...(input.context.orientation
          ? { orientation: input.context.orientation }
          : {}),
        ...(input.context.browser ? { browser: input.context.browser } : {}),
        ...(input.context.browserVersion
          ? { browserVersion: input.context.browserVersion }
          : {}),
        ...(input.context.operatingSystem
          ? { operatingSystem: input.context.operatingSystem }
          : {}),
        ...(input.context.deviceProfile
          ? { deviceProfile: input.context.deviceProfile }
          : {}),
        sequence: existing.length,
        tenantId: input.tenantId,
        applicationId: plan.applicationId,
        createdAt: now,
        createdBy: input.actorId,
      });
      await repository.appendPlanHistory(input.tenantId, plan.id, {
        id: historyId(),
        eventType: "context_added",
        detail: input.context.label,
        actorId: input.actorId,
        occurredAt: now,
      });
      return presentPlan(repository, plan);
    },

    async addCriterion(input) {
      const plan = await repository.getPlan(input.tenantId, input.planId);
      if (!plan) throw new Error("experience_plan.not_found");
      if (!isDiscipline(input.criterion.discipline)) {
        throw new Error("experience_criterion.discipline_invalid");
      }
      const existing = await repository.listCriteria(input.tenantId, input.planId);
      const now = nowIso();
      await repository.saveCriterion({
        id: newOpaqueId("uxc"),
        planId: plan.id,
        discipline: input.criterion.discipline as VerificationDiscipline,
        statement: requireText(
          input.criterion.statement,
          "experience_criterion.statement",
        ),
        sequence: existing.length,
        tenantId: input.tenantId,
        applicationId: plan.applicationId,
        createdAt: now,
        createdBy: input.actorId,
      });
      await repository.appendPlanHistory(input.tenantId, plan.id, {
        id: historyId(),
        eventType: "criterion_added",
        actorId: input.actorId,
        occurredAt: now,
      });
      return presentPlan(repository, plan);
    },

    async setDisciplines(input) {
      const plan = await repository.getPlan(input.tenantId, input.planId);
      if (!plan) throw new Error("experience_plan.not_found");
      const disciplines = input.disciplines.filter(isDiscipline);
      await repository.saveDisciplines(
        input.tenantId,
        plan.id,
        plan.applicationId,
        disciplines,
      );
      return presentPlan(repository, plan);
    },

    async startActivity(input) {
      const plan = await repository.getPlan(input.tenantId, input.planId);
      if (!plan) throw new Error("experience_plan.not_found");
      const n = await repository.nextKeyNumber(
        input.tenantId,
        plan.applicationId,
        "experience_activity",
      );
      const now = nowIso();
      const activity: ExperienceActivityRecord = {
        id: newOpaqueId("qxa"),
        tenantId: input.tenantId,
        applicationId: plan.applicationId,
        planId: plan.id,
        number: `UXA-${n}`,
        status: "in_progress",
        testerId: input.actorId,
        ...(input.testerName ? { testerName: input.testerName } : {}),
        ...(plan.environmentId ? { environmentId: plan.environmentId } : {}),
        ...(plan.environmentName ? { environmentName: plan.environmentName } : {}),
        startedAt: now,
        elapsedMs: 0,
        createdAt: now,
        createdBy: input.actorId,
        updatedAt: now,
        updatedBy: input.actorId,
      };
      await repository.saveActivity(activity);
      await repository.savePlan({
        ...plan,
        status: "in_progress",
        updatedAt: now,
        updatedBy: input.actorId,
      });
      await repository.appendActivityHistory(input.tenantId, activity.id, {
        id: historyId(),
        eventType: "verification_started",
        actorId: input.actorId,
        occurredAt: now,
      });
      const contexts = await repository.listContexts(input.tenantId, plan.id);
      if (contexts[0]) {
        await repository.saveContextActivity({
          id: newOpaqueId("qxc"),
          activityId: activity.id,
          contextId: contexts[0].id,
          activatedAt: now,
          tenantId: input.tenantId,
          applicationId: plan.applicationId,
        });
        await repository.saveActivity({
          ...activity,
          currentContextId: contexts[0].id,
        });
        await repository.appendActivityHistory(input.tenantId, activity.id, {
          id: historyId(),
          eventType: "viewport_activated",
          detail: contexts[0].label,
          actorId: input.actorId,
          occurredAt: now,
        });
      }
      const stored = await repository.getActivity(input.tenantId, activity.id);
      return presentActivity(repository, stored ?? activity);
    },

    async getActivity(tenantId, id) {
      const activity = await repository.getActivity(tenantId, id);
      if (!activity) throw new Error("experience_activity.not_found");
      return presentActivity(repository, activity);
    },

    async getLatestActivity(tenantId, planId) {
      const activities = await repository.listActivities(tenantId, planId);
      if (!activities[0]) return undefined;
      return presentActivity(repository, activities[0]);
    },

    async transitionActivity(input) {
      const current = await repository.getActivity(input.tenantId, input.activityId);
      if (!current) throw new Error("experience_activity.not_found");
      const now = nowIso();
      const mapped =
        input.action === "pause" ||
        input.action === "resume" ||
        input.action === "complete" ||
        input.action === "block"
          ? input.action
          : "pause";
      const nextStatus = applyLifecycle(current.status, mapped);
      const elapsedMs =
        input.action === "pause" ? durationOf(current) : current.elapsedMs;
      const next: ExperienceActivityRecord = {
        ...current,
        status: nextStatus,
        elapsedMs,
        updatedAt: now,
        updatedBy: input.actorId,
        ...(input.action === "pause" ? { pausedAt: now } : {}),
        ...(input.action === "resume" ? { pausedAt: undefined } : {}),
        ...(input.action === "complete"
          ? { completedAt: now, pausedAt: undefined }
          : {}),
      };
      await repository.saveActivity(next);
      const plan = await repository.getPlan(input.tenantId, current.planId);
      if (plan && input.action === "complete") {
        await repository.savePlan({
          ...plan,
          status: "completed",
          updatedAt: now,
          updatedBy: input.actorId,
        });
      }
      await repository.appendActivityHistory(input.tenantId, input.activityId, {
        id: historyId(),
        eventType: `verification_${input.action === "pause" ? "paused" : input.action === "resume" ? "resumed" : input.action === "complete" ? "completed" : "blocked"}`,
        actorId: input.actorId,
        occurredAt: now,
      });
      return presentActivity(repository, next);
    },

    async activateContext(input) {
      const activity = await repository.getActivity(input.tenantId, input.activityId);
      if (!activity) throw new Error("experience_activity.not_found");
      const context = await repository.getContext(input.tenantId, input.contextId);
      if (!context || context.planId !== activity.planId) {
        throw new Error("experience_context.not_found");
      }
      assertSameApplication(
        activity.applicationId,
        context.applicationId,
        "experience_context",
      );
      const now = nowIso();
      await repository.saveContextActivity({
        id: newOpaqueId("qxc"),
        activityId: activity.id,
        contextId: context.id,
        activatedAt: now,
        tenantId: input.tenantId,
        applicationId: activity.applicationId,
      });
      await repository.saveActivity({
        ...activity,
        currentContextId: context.id,
        updatedAt: now,
        updatedBy: input.actorId,
      });
      await repository.appendActivityHistory(input.tenantId, activity.id, {
        id: historyId(),
        eventType: "viewport_activated",
        detail: context.label,
        actorId: input.actorId,
        occurredAt: now,
      });
      const stored = await repository.getActivity(input.tenantId, activity.id);
      return presentActivity(repository, stored ?? activity);
    },

    async completeContext(input) {
      const activity = await repository.getActivity(input.tenantId, input.activityId);
      if (!activity) throw new Error("experience_activity.not_found");
      const existing = await repository.listContextActivity(
        input.tenantId,
        activity.id,
      );
      const now = nowIso();
      const current = existing.find((row) => row.contextId === input.contextId);
      if (current) {
        await repository.saveContextActivity({
          ...current,
          completedAt: now,
          tenantId: input.tenantId,
          applicationId: activity.applicationId,
        });
      }
      await repository.appendActivityHistory(input.tenantId, activity.id, {
        id: historyId(),
        eventType: "viewport_completed",
        actorId: input.actorId,
        occurredAt: now,
      });
      return presentActivity(repository, activity);
    },

    async recordCriterionResult(input) {
      const activity = await repository.getActivity(input.tenantId, input.activityId);
      if (!activity) throw new Error("experience_activity.not_found");
      if (!isCriterionState(input.state))
        throw new Error("criterion_result.state_invalid");
      const criterion = await repository.getCriterion(
        input.tenantId,
        input.criterionId,
      );
      const context = await repository.getContext(input.tenantId, input.contextId);
      if (!criterion || criterion.planId !== activity.planId) {
        throw new Error("experience_criterion.not_found");
      }
      if (!context || context.planId !== activity.planId) {
        throw new Error("experience_context.not_found");
      }
      const now = nowIso();
      const state = input.state as CriterionResultState;
      await repository.saveCriterionResult({
        id: newOpaqueId("uxr"),
        activityId: activity.id,
        criterionId: criterion.id,
        contextId: context.id,
        state,
        concernFound: input.concernFound === true,
        ...(input.note ? { note: input.note } : {}),
        recordedAt: now,
        recordedBy: input.actorId,
        tenantId: input.tenantId,
        applicationId: activity.applicationId,
      });
      await repository.appendActivityHistory(input.tenantId, activity.id, {
        id: historyId(),
        eventType: "criterion_recorded",
        detail: `${state}${input.concernFound ? "+concern" : ""}`,
        actorId: input.actorId,
        occurredAt: now,
      });
      return presentActivity(repository, activity);
    },

    async addObservation(input) {
      if (!isHostKind(input.hostKind))
        throw new Error("quality_observation.host_invalid");
      const host = await requireHost(
        repository,
        input.tenantId,
        input.hostKind,
        input.hostId,
      );
      const now = nowIso();
      const row = {
        id: newOpaqueId("qob"),
        tenantId: input.tenantId,
        applicationId: host.applicationId,
        hostKind: input.hostKind,
        hostId: input.hostId,
        title: requireText(input.title, "quality_observation.title"),
        body: requireText(input.body, "quality_observation.body"),
        ...(input.contextId ? { contextId: input.contextId } : {}),
        ...(input.criterionId ? { criterionId: input.criterionId } : {}),
        createdAt: now,
        createdBy: input.actorId,
      };
      await repository.saveObservation(row);
      await appendHostHistory(
        repository,
        input.tenantId,
        input.hostKind,
        input.hostId,
        {
          eventType: "observation_added",
          detail: row.title,
          actorId: input.actorId,
          occurredAt: now,
        },
      );
      return row;
    },

    async addIssue(input) {
      if (!isHostKind(input.hostKind)) throw new Error("quality_issue.host_invalid");
      const host = await requireHost(
        repository,
        input.tenantId,
        input.hostKind,
        input.hostId,
      );
      if (input.observationId) {
        const observation = await repository.getObservation(
          input.tenantId,
          input.observationId,
        );
        if (!observation || observation.hostId !== input.hostId) {
          throw new Error("quality_observation.not_found");
        }
      }
      const now = nowIso();
      const priority = (input.priority ?? "medium").trim();
      const row = {
        id: newOpaqueId("qis"),
        tenantId: input.tenantId,
        applicationId: host.applicationId,
        hostKind: input.hostKind,
        hostId: input.hostId,
        ...(input.observationId ? { observationId: input.observationId } : {}),
        title: requireText(input.title, "quality_issue.title"),
        body: requireText(input.body, "quality_issue.body"),
        priority: (isIssuePriority(priority) ? priority : "medium") as IssuePriority,
        status: "open" as const,
        ...(input.contextId ? { contextId: input.contextId } : {}),
        ...(input.criterionId ? { criterionId: input.criterionId } : {}),
        createdAt: now,
        createdBy: input.actorId,
        updatedAt: now,
        updatedBy: input.actorId,
      };
      await repository.saveIssue(row);
      await appendHostHistory(
        repository,
        input.tenantId,
        input.hostKind,
        input.hostId,
        {
          eventType: "issue_created",
          detail: row.title,
          actorId: input.actorId,
          occurredAt: now,
        },
      );
      return row;
    },

    async addNote(input) {
      if (!isHostKind(input.hostKind)) throw new Error("quality_note.host_invalid");
      const host = await requireHost(
        repository,
        input.tenantId,
        input.hostKind,
        input.hostId,
      );
      const now = nowIso();
      const row = {
        id: newOpaqueId("qnt"),
        tenantId: input.tenantId,
        applicationId: host.applicationId,
        hostKind: input.hostKind,
        hostId: input.hostId,
        body: requireText(input.body, "quality_note.body"),
        createdAt: now,
        createdBy: input.actorId,
      };
      await repository.saveNote(row);
      await appendHostHistory(
        repository,
        input.tenantId,
        input.hostKind,
        input.hostId,
        {
          eventType: "note_added",
          actorId: input.actorId,
          occurredAt: now,
        },
      );
      return row;
    },

    async getIssue(tenantId, issueId) {
      const issue = await repository.getIssue(tenantId, issueId);
      if (!issue) throw new Error("quality_issue.not_found");
      return issue;
    },
    async dismissIssue(input) {
      return setIssueStatus(repository, input, "dismissed");
    },
    async resolveIssue(input) {
      return setIssueStatus(repository, input, "resolved");
    },
    async linkIssueDefect(input) {
      const issue = await repository.getIssue(input.tenantId, input.issueId);
      if (!issue) throw new Error("quality_issue.not_found");
      const now = nowIso();
      const next = {
        ...issue,
        defectId: requireText(input.defectId, "quality_issue.defect"),
        status: input.promoted ? ("promoted" as const) : ("linked" as const),
        updatedAt: now,
        updatedBy: input.actorId,
      };
      await repository.saveIssue(next);
      await appendHostHistory(
        repository,
        input.tenantId,
        issue.hostKind,
        issue.hostId,
        {
          eventType: input.promoted
            ? "issue_promoted_to_defect"
            : "issue_linked_to_defect",
          detail: input.defectId,
          actorId: input.actorId,
          occurredAt: now,
        },
      );
      return next;
    },

    async attachEvidence(input) {
      if (!(ALLOWED_EVIDENCE as readonly string[]).includes(input.targetKind)) {
        throw new Error("quality_evidence.target_invalid");
      }
      const targetKind = input.targetKind as EvidenceTargetKind;
      const applicationId = await resolveTargetApplication(
        repository,
        input.tenantId,
        targetKind,
        input.targetId,
      );
      if (repository.evidenceExists) {
        const exists = await repository.evidenceExists(
          input.tenantId,
          input.evidenceId,
        );
        if (!exists) throw new Error("quality_evidence.not_found");
      }
      const now = nowIso();
      await repository.saveEvidenceLink({
        id: newOpaqueId("qel"),
        evidenceId: requireText(input.evidenceId, "quality_evidence.id"),
        targetKind,
        targetId: input.targetId,
        createdAt: now,
        createdBy: input.actorId,
        tenantId: input.tenantId,
        applicationId,
      });
      if (repository.associateEvidenceSoR) {
        await repository.associateEvidenceSoR({
          tenantId: input.tenantId,
          actorId: input.actorId,
          evidenceId: input.evidenceId,
          targetCapability: targetKind,
          targetId: input.targetId,
        });
      }
      let hostKind: QualityHostKind | undefined;
      let hostId: string | undefined;
      if (targetKind === "exploratory_session") {
        hostKind = "exploratory_session";
        hostId = input.targetId;
      } else if (targetKind === "experience_verification") {
        hostKind = "experience_verification";
        hostId = input.targetId;
      } else if (targetKind === "quality_observation") {
        const observation = await repository.getObservation(
          input.tenantId,
          input.targetId,
        );
        hostKind = observation?.hostKind;
        hostId = observation?.hostId;
      } else if (targetKind === "quality_issue") {
        const issue = await repository.getIssue(input.tenantId, input.targetId);
        hostKind = issue?.hostKind;
        hostId = issue?.hostId;
      }
      if (hostKind && hostId) {
        await appendHostHistory(repository, input.tenantId, hostKind, hostId, {
          eventType: "evidence_attached",
          detail: input.evidenceId,
          actorId: input.actorId,
          occurredAt: now,
        });
      }
    },

    async addTrace(input) {
      if (!isOptionalTraceKind(input.toKind))
        throw new Error("quality_trace.kind_invalid");
      const applicationId =
        input.fromKind === "exploratory_session"
          ? (await repository.getSession(input.tenantId, input.fromId))?.applicationId
          : (await repository.getPlan(input.tenantId, input.fromId))?.applicationId;
      if (!applicationId) throw new Error(`${input.fromKind}.not_found`);
      await repository.saveTrace({
        id: newOpaqueId("qtl"),
        fromKind: input.fromKind,
        fromId: input.fromId,
        toKind: input.toKind,
        toId: requireText(input.toId, "quality_trace.target"),
        createdAt: nowIso(),
        createdBy: input.actorId,
        tenantId: input.tenantId,
        applicationId,
      });
    },
  };
}

async function setIssueStatus(
  repository: ExperienceRepository,
  input: {
    readonly tenantId: string;
    readonly issueId: string;
    readonly actorId: string;
  },
  status: "dismissed" | "resolved",
) {
  const issue = await repository.getIssue(input.tenantId, input.issueId);
  if (!issue) throw new Error("quality_issue.not_found");
  const now = nowIso();
  const next = { ...issue, status, updatedAt: now, updatedBy: input.actorId };
  await repository.saveIssue(next);
  return next;
}

async function appendHostHistory(
  repository: ExperienceRepository,
  tenantId: string,
  hostKind: QualityHostKind,
  hostId: string,
  entry: { eventType: string; detail?: string; actorId: string; occurredAt: string },
): Promise<void> {
  const payload = { id: historyId(), ...entry };
  if (hostKind === "exploratory_session") {
    await repository.appendSessionHistory(tenantId, hostId, payload);
    return;
  }
  await repository.appendActivityHistory(tenantId, hostId, payload);
}

async function resolveTargetApplication(
  repository: ExperienceRepository,
  tenantId: string,
  targetKind: EvidenceTargetKind,
  targetId: string,
): Promise<string> {
  if (targetKind === "exploratory_session") {
    const session = await repository.getSession(tenantId, targetId);
    if (!session) throw new Error("exploratory_session.not_found");
    return session.applicationId;
  }
  if (targetKind === "experience_verification") {
    const activity = await repository.getActivity(tenantId, targetId);
    if (!activity) throw new Error("experience_activity.not_found");
    return activity.applicationId;
  }
  if (targetKind === "quality_observation") {
    const observation = await repository.getObservation(tenantId, targetId);
    if (!observation) throw new Error("quality_observation.not_found");
    return observation.applicationId;
  }
  if (targetKind === "quality_issue") {
    const issue = await repository.getIssue(tenantId, targetId);
    if (!issue) throw new Error("quality_issue.not_found");
    return issue.applicationId;
  }
  if (targetKind === "experience_criterion") {
    const criterion = await repository.getCriterion(tenantId, targetId);
    if (!criterion) throw new Error("experience_criterion.not_found");
    return criterion.applicationId;
  }
  const context = await repository.getContext(tenantId, targetId);
  if (!context) throw new Error("experience_context.not_found");
  return context.applicationId;
}
