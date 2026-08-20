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

export type ExperienceRepository = {
  nextKeyNumber(
    tenantId: string,
    applicationId: string,
    kind: "exploratory_session" | "experience_plan" | "experience_activity",
  ): Promise<number>;

  saveSession(row: ExploratorySessionRecord): Promise<void>;
  getSession(
    tenantId: string,
    id: string,
  ): Promise<ExploratorySessionRecord | undefined>;
  listSessions(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly ExploratorySessionRecord[]>;
  saveAreas(
    tenantId: string,
    sessionId: string,
    areas: readonly ExploratoryArea[],
  ): Promise<void>;
  listAreas(tenantId: string, sessionId: string): Promise<readonly ExploratoryArea[]>;
  appendSessionHistory(
    tenantId: string,
    sessionId: string,
    entry: QualityHistoryEntry,
  ): Promise<void>;
  listSessionHistory(
    tenantId: string,
    sessionId: string,
  ): Promise<readonly QualityHistoryEntry[]>;

  savePlan(row: ExperiencePlanRecord): Promise<void>;
  getPlan(tenantId: string, id: string): Promise<ExperiencePlanRecord | undefined>;
  listPlans(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly ExperiencePlanRecord[]>;
  saveDisciplines(
    tenantId: string,
    planId: string,
    applicationId: string,
    disciplines: readonly VerificationDiscipline[],
  ): Promise<void>;
  listDisciplines(
    tenantId: string,
    planId: string,
  ): Promise<readonly VerificationDiscipline[]>;
  saveContext(
    row: ExperienceContextRecord & {
      tenantId: string;
      applicationId: string;
      createdAt: string;
      createdBy: string;
    },
  ): Promise<void>;
  listContexts(
    tenantId: string,
    planId: string,
  ): Promise<readonly ExperienceContextRecord[]>;
  getContext(
    tenantId: string,
    id: string,
  ): Promise<(ExperienceContextRecord & { applicationId: string }) | undefined>;
  saveCriterion(
    row: ExperienceCriterionRecord & {
      tenantId: string;
      applicationId: string;
      createdAt: string;
      createdBy: string;
    },
  ): Promise<void>;
  listCriteria(
    tenantId: string,
    planId: string,
  ): Promise<readonly ExperienceCriterionRecord[]>;
  getCriterion(
    tenantId: string,
    id: string,
  ): Promise<(ExperienceCriterionRecord & { applicationId: string }) | undefined>;
  appendPlanHistory(
    tenantId: string,
    planId: string,
    entry: QualityHistoryEntry,
  ): Promise<void>;
  listPlanHistory(
    tenantId: string,
    planId: string,
  ): Promise<readonly QualityHistoryEntry[]>;

  saveActivity(row: ExperienceActivityRecord): Promise<void>;
  getActivity(
    tenantId: string,
    id: string,
  ): Promise<ExperienceActivityRecord | undefined>;
  listActivities(
    tenantId: string,
    planId: string,
  ): Promise<readonly ExperienceActivityRecord[]>;
  saveCriterionResult(
    row: CriterionResultRecord & { tenantId: string; applicationId: string },
  ): Promise<void>;
  listCriterionResults(
    tenantId: string,
    activityId: string,
  ): Promise<readonly CriterionResultRecord[]>;
  saveContextActivity(
    row: ContextActivityRecord & { tenantId: string; applicationId: string },
  ): Promise<void>;
  listContextActivity(
    tenantId: string,
    activityId: string,
  ): Promise<readonly ContextActivityRecord[]>;
  appendActivityHistory(
    tenantId: string,
    activityId: string,
    entry: QualityHistoryEntry,
  ): Promise<void>;
  listActivityHistory(
    tenantId: string,
    activityId: string,
  ): Promise<readonly QualityHistoryEntry[]>;

  saveObservation(row: ObservationRecord): Promise<void>;
  getObservation(tenantId: string, id: string): Promise<ObservationRecord | undefined>;
  listObservations(
    tenantId: string,
    hostKind: string,
    hostId: string,
  ): Promise<readonly ObservationRecord[]>;
  saveIssue(row: IssueRecord): Promise<void>;
  getIssue(tenantId: string, id: string): Promise<IssueRecord | undefined>;
  listIssues(
    tenantId: string,
    hostKind: string,
    hostId: string,
  ): Promise<readonly IssueRecord[]>;
  saveNote(row: NoteRecord): Promise<void>;
  listNotes(
    tenantId: string,
    hostKind: string,
    hostId: string,
  ): Promise<readonly NoteRecord[]>;

  saveEvidenceLink(
    row: EvidenceLinkRecord & { tenantId: string; applicationId: string },
  ): Promise<void>;
  listEvidenceLinks(
    tenantId: string,
    targetKind: string,
    targetId: string,
  ): Promise<readonly EvidenceLinkRecord[]>;
  countEvidence(
    tenantId: string,
    targetKind: string,
    targetId: string,
  ): Promise<number>;
  countEvidenceForHost(
    tenantId: string,
    hostKind: string,
    hostId: string,
    extraTargetIds: readonly string[],
  ): Promise<number>;

  saveTrace(
    row: TraceLinkRecord & { tenantId: string; applicationId: string },
  ): Promise<void>;
  listTraces(
    tenantId: string,
    fromKind: string,
    fromId: string,
  ): Promise<readonly TraceLinkRecord[]>;

  evidenceExists?(tenantId: string, evidenceId: string): Promise<boolean>;
  associateEvidenceSoR?(input: {
    readonly tenantId: string;
    readonly actorId: string;
    readonly evidenceId: string;
    readonly targetCapability: string;
    readonly targetId: string;
  }): Promise<void>;
};
