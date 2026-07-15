/**
 * In-memory TestingClient implementation for APZTCMS-010 workbench UI.
 * No persistence, services, or repository imports.
 */

import type { TestingClient, TestingClientRequestOptions } from "./client";
import { TestingClientError } from "./errors";
import type {
  AdminSettingViewModel,
  ApprovalDecisionInput,
  AutomationRunViewModel,
  CaseViewModel,
  CertificationApprovalViewModel,
  CertificationAuditViewModel,
  CertificationViewModel,
  CoverageSummaryViewModel,
  DefectLinkViewModel,
  EvidenceViewModel,
  ExecutionViewModel,
  PlanViewModel,
  QualitySummaryViewModel,
  ReleaseReadinessViewModel,
  ReportPlaceholderViewModel,
  RequirementViewModel,
  SuiteViewModel,
  TestingCollectionResult,
  TestingListParams,
} from "./types";

export const FIXTURE_IDS = {
  plan: "plan_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1",
  suite: "suite_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa2",
  case: "case_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa3",
  execution: "exec_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa4",
  evidence: "evid_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa5",
  automation: "auto_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa6",
  certification: "cert_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa7",
  release: "rel_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa8",
} as const;

const MOCK_ACTOR = "qa.lead@example.com";
const BASE_TIMESTAMP = "2026-07-10T10:00:00.000Z";

type MutableCertification = {
  id: string;
  name: string;
  state: string;
  recommendation: string;
  recommendationAdvisoryOnly: true;
  gates: CertificationViewModel["gates"][number][];
  approvals: CertificationApprovalViewModel[];
  audit: CertificationAuditViewModel[];
  updatedAt: string;
};

type MockState = {
  requirements: RequirementViewModel[];
  plans: PlanViewModel[];
  suites: SuiteViewModel[];
  cases: CaseViewModel[];
  executions: ExecutionViewModel[];
  evidence: EvidenceViewModel[];
  automationRuns: AutomationRunViewModel[];
  coverage: CoverageSummaryViewModel[];
  defects: DefectLinkViewModel[];
  qualitySummaries: QualitySummaryViewModel[];
  certifications: MutableCertification[];
  releaseReadiness: ReleaseReadinessViewModel[];
  reports: ReportPlaceholderViewModel[];
  adminSettings: AdminSettingViewModel[];
  nextId: number;
};

function nowIso(): string {
  return new Date().toISOString();
}

function checkAborted(options?: TestingClientRequestOptions): void {
  if (options?.signal?.aborted) {
    throw new TestingClientError("Request aborted.", "ABORTED", 499);
  }
}

function notFound(entity: string, id: string): never {
  throw new TestingClientError(`${entity} not found: ${id}`, "NOT_FOUND", 404);
}

function nextGeneratedId(prefix: string, counter: number): string {
  return `${prefix}_${String(counter).padStart(32, "0")}`;
}

function filterList<T extends Record<string, unknown>>(
  items: readonly T[],
  params?: TestingListParams,
): TestingCollectionResult<T> {
  let next = [...items];
  const search = params?.search?.trim().toLowerCase();
  if (params?.status) {
    next = next.filter((item) => item.status === params.status);
  }
  if (search) {
    next = next.filter((item) => {
      const haystack = Object.values(item)
        .filter((value) => typeof value === "string")
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }
  if (params?.sort) {
    const sortKey = params.sort;
    const order = params.order ?? "asc";
    next.sort((left, right) => {
      const leftValue = String(left[sortKey] ?? "");
      const rightValue = String(right[sortKey] ?? "");
      const cmp = leftValue.localeCompare(rightValue);
      return order === "desc" ? -cmp : cmp;
    });
  }
  return { items: next, total: next.length };
}

function createInitialState(): MockState {
  const plan: PlanViewModel = {
    id: FIXTURE_IDS.plan,
    name: "Release 2.4 Regression",
    status: "active",
    version: "2.4.0",
    suiteCount: 1,
    updatedAt: BASE_TIMESTAMP,
  };

  const suite: SuiteViewModel = {
    id: FIXTURE_IDS.suite,
    name: "Authentication & Access",
    planId: FIXTURE_IDS.plan,
    planName: plan.name,
    caseCount: 1,
    status: "active",
    updatedAt: BASE_TIMESTAMP,
  };

  const testCase: CaseViewModel = {
    id: FIXTURE_IDS.case,
    key: "TC-AUTH-001",
    title: "Verify SSO silent handoff",
    suiteId: FIXTURE_IDS.suite,
    suiteName: suite.name,
    priority: "high",
    status: "ready",
    automationEligible: true,
    updatedAt: BASE_TIMESTAMP,
  };

  const execution: ExecutionViewModel = {
    id: FIXTURE_IDS.execution,
    caseKey: testCase.key,
    caseTitle: testCase.title,
    status: "not_started",
    assignee: "qa.analyst@example.com",
    progressLabel: "0 / 3 steps",
    updatedAt: BASE_TIMESTAMP,
  };

  const evidence: EvidenceViewModel = {
    id: FIXTURE_IDS.evidence,
    title: "SSO redirect capture",
    kind: "screenshot",
    contentType: "image/png",
    sizeBytes: 0,
    status: "registered",
    linkedExecutionId: FIXTURE_IDS.execution,
    createdAt: BASE_TIMESTAMP,
  };

  const certification: MutableCertification = {
    id: FIXTURE_IDS.certification,
    name: "Release 2.4 Certification",
    state: "pending_approval",
    recommendation: "ready_for_approval",
    recommendationAdvisoryOnly: true,
    gates: [
      {
        id: "gate-coverage",
        name: "Requirement coverage",
        status: "pass",
        reason: "98% of planned requirements covered by executed cases.",
        evaluatedAt: BASE_TIMESTAMP,
        evaluator: "coverage-engine",
      },
      {
        id: "gate-defects",
        name: "Open critical defects",
        status: "warning",
        reason: "One P2 defect remains open with approved waiver.",
        evaluatedAt: BASE_TIMESTAMP,
        evaluator: "defect-engine",
      },
      {
        id: "gate-automation",
        name: "Automation stability",
        status: "fail",
        reason: "Nightly suite failed on auth adapter smoke test.",
        evaluatedAt: BASE_TIMESTAMP,
        evaluator: "automation-engine",
      },
    ],
    approvals: [
      {
        id: "approval-initial-review",
        stage: "technical_review",
        decision: "review",
        actor: "qa.lead@example.com",
        decidedAt: "2026-07-09T14:30:00.000Z",
        comment: "Automation gate failure requires waiver review.",
      },
    ],
    audit: [
      {
        id: "audit-created",
        action: "certification.created",
        actor: "system",
        at: "2026-07-08T09:00:00.000Z",
        detail: "Certification record created for Release 2.4.",
      },
      {
        id: "audit-gates-evaluated",
        action: "certification.gates_evaluated",
        actor: "certification-engine",
        at: "2026-07-09T12:00:00.000Z",
        detail: "Gate evaluation completed with 1 pass, 1 warning, 1 fail.",
      },
    ],
    updatedAt: BASE_TIMESTAMP,
  };

  return {
    requirements: [
      {
        id: "req-auth-sso",
        key: "REQ-AUTH-12",
        title: "Single sign-on silent session handoff",
        status: "approved",
        priority: "high",
        updatedAt: BASE_TIMESTAMP,
      },
      {
        id: "req-auth-mfa",
        key: "REQ-AUTH-18",
        title: "Multi-factor authentication enforcement",
        status: "in_review",
        priority: "medium",
        updatedAt: BASE_TIMESTAMP,
      },
    ],
    plans: [plan],
    suites: [suite],
    cases: [testCase],
    executions: [execution],
    evidence: [evidence],
    automationRuns: [
      {
        id: FIXTURE_IDS.automation,
        adapter: "playwright",
        status: "completed",
        passed: 42,
        failed: 2,
        skipped: 1,
        importedAt: BASE_TIMESTAMP,
      },
    ],
    coverage: [
      {
        id: "cov-requirements",
        dimension: "Requirements",
        covered: 49,
        total: 50,
        percentLabel: "98%",
        status: "healthy",
      },
      {
        id: "cov-cases",
        dimension: "Test cases",
        covered: 120,
        total: 128,
        percentLabel: "94%",
        status: "attention",
      },
    ],
    defects: [
      {
        id: "def-auth-timeout",
        title: "Intermittent SSO timeout on mobile Safari",
        severity: "P2",
        status: "open",
        linkedCaseKey: testCase.key,
        sourceLabel: "Execution feedback",
        updatedAt: BASE_TIMESTAMP,
      },
    ],
    qualitySummaries: [
      {
        id: "quality-release-24",
        title: "Release 2.4 quality posture",
        status: "attention",
        summary: "Coverage strong; automation stability and one open P2 require review.",
        updatedAt: BASE_TIMESTAMP,
      },
    ],
    certifications: [certification],
    releaseReadiness: [
      {
        id: FIXTURE_IDS.release,
        releaseLabel: "2.4.0",
        overallStatus: "conditional",
        dimensions: [
          {
            name: "Certification",
            status: "pending_approval",
            detail: "Awaiting final approval with automation waiver.",
          },
          {
            name: "Defects",
            status: "warning",
            detail: "One P2 open with waiver.",
          },
        ],
        updatedAt: BASE_TIMESTAMP,
      },
    ],
    reports: [
      {
        id: "report-execution-summary",
        title: "Execution summary",
        description: "Planned execution rollup report.",
        status: "placeholder",
      },
      {
        id: "report-certification-audit",
        title: "Certification audit trail",
        description: "Approval and gate history export.",
        status: "placeholder",
      },
    ],
    adminSettings: [
      {
        id: "admin-retention",
        label: "Evidence retention (days)",
        value: "365",
        editable: false,
      },
      {
        id: "admin-adapter",
        label: "Default automation adapter",
        value: "playwright",
        editable: false,
      },
    ],
    nextId: 100,
  };
}

function toCertificationViewModel(cert: MutableCertification): CertificationViewModel {
  return {
    id: cert.id,
    name: cert.name,
    state: cert.state,
    recommendation: cert.recommendation,
    recommendationAdvisoryOnly: true,
    gates: cert.gates,
    approvals: cert.approvals,
    audit: cert.audit,
    updatedAt: cert.updatedAt,
  };
}

function findPlan(state: MockState, planId: string): PlanViewModel {
  const plan = state.plans.find((item) => item.id === planId);
  if (!plan) notFound("Plan", planId);
  return plan;
}

function findSuite(state: MockState, suiteId: string): SuiteViewModel {
  const suite = state.suites.find((item) => item.id === suiteId);
  if (!suite) notFound("Suite", suiteId);
  return suite;
}

function findCase(state: MockState, caseId: string): CaseViewModel {
  const testCase = state.cases.find((item) => item.id === caseId);
  if (!testCase) notFound("Case", caseId);
  return testCase;
}

function findExecution(state: MockState, executionId: string): ExecutionViewModel {
  const execution = state.executions.find((item) => item.id === executionId);
  if (!execution) notFound("Execution", executionId);
  return execution;
}

function findCertification(state: MockState, certificationId: string): MutableCertification {
  const certification = state.certifications.find((item) => item.id === certificationId);
  if (!certification) notFound("Certification", certificationId);
  return certification;
}

function updatePlanSuiteCount(state: MockState, planId: string): void {
  const plan = findPlan(state, planId);
  const suiteCount = state.suites.filter((item) => item.planId === planId).length;
  const index = state.plans.findIndex((item) => item.id === planId);
  state.plans[index] = { ...plan, suiteCount, updatedAt: nowIso() };
}

function updateSuiteCaseCount(state: MockState, suiteId: string): void {
  const suite = findSuite(state, suiteId);
  const caseCount = state.cases.filter((item) => item.suiteId === suiteId).length;
  const index = state.suites.findIndex((item) => item.id === suiteId);
  state.suites[index] = { ...suite, caseCount, updatedAt: nowIso() };
}

export function createMockTestingClient(): TestingClient {
  const state = createInitialState();

  return {
    async getDashboard(options) {
      checkAborted(options);
      const certificationLabels = state.certifications
        .slice(0, 3)
        .map((item) => item.name)
        .join(", ");
      const executionLabels = state.executions
        .slice(0, 3)
        .map((item) => `${item.caseKey} (${item.status})`)
        .join(", ");

      const runningCount = state.executions.filter((item) => item.status === "in_progress").length;
      const pendingCount = state.certifications.filter(
        (item) => item.state === "pending_approval" || item.state === "in_review",
      ).length;

      const executionValue = executionLabels
        ? `${runningCount} running — ${executionLabels}`
        : `${runningCount} running`;
      const certificationValue = certificationLabels
        ? `${pendingCount} pending — ${certificationLabels}`
        : `${pendingCount} pending`;

      return {
        headline: "Testing & Certification overview",
        cards: [
          {
            id: "card-plans",
            label: "Active plans",
            value: `${state.plans.filter((item) => item.status === "active").length} active`,
            tone: "neutral",
          },
          {
            id: "card-executions",
            label: "Executions in progress",
            value: executionValue,
            tone: "success",
          },
          {
            id: "card-certifications",
            label: "Certifications pending",
            value: certificationValue,
            tone: "warning",
          },
          {
            id: "card-defects",
            label: "Open defects",
            value: `${state.defects.filter((item) => item.status === "open").length} open`,
            tone: "danger",
          },
        ],
        recentCertifications: state.certifications
          .slice(0, 3)
          .map(toCertificationViewModel),
        recentExecutions: state.executions.slice(0, 3),
      };
    },

    async listRequirements(params, options) {
      checkAborted(options);
      return filterList(state.requirements, params);
    },

    async listPlans(params, options) {
      checkAborted(options);
      return filterList(state.plans, params);
    },

    async getPlan(planId, options) {
      checkAborted(options);
      return findPlan(state, planId);
    },

    async createPlan(input, options) {
      checkAborted(options);
      state.nextId += 1;
      const plan: PlanViewModel = {
        id: nextGeneratedId("plan", state.nextId),
        name: input.name,
        status: "draft",
        version: "0.1.0",
        suiteCount: 0,
        updatedAt: nowIso(),
      };
      state.plans.push(plan);
      return plan;
    },

    async listSuites(params, options) {
      checkAborted(options);
      return filterList(state.suites, params);
    },

    async createSuite(input, options) {
      checkAborted(options);
      const plan = findPlan(state, input.planId);
      state.nextId += 1;
      const suite: SuiteViewModel = {
        id: nextGeneratedId("suite", state.nextId),
        name: input.name,
        planId: plan.id,
        planName: plan.name,
        caseCount: 0,
        status: "draft",
        updatedAt: nowIso(),
      };
      state.suites.push(suite);
      updatePlanSuiteCount(state, plan.id);
      return suite;
    },

    async listCases(params, options) {
      checkAborted(options);
      return filterList(state.cases, params);
    },

    async createCase(input, options) {
      checkAborted(options);
      const suite = findSuite(state, input.suiteId);
      state.nextId += 1;
      const testCase: CaseViewModel = {
        id: nextGeneratedId("case", state.nextId),
        key: `TC-${String(state.nextId).padStart(4, "0")}`,
        title: input.title,
        suiteId: suite.id,
        suiteName: suite.name,
        priority: "medium",
        status: "draft",
        automationEligible: false,
        updatedAt: nowIso(),
      };
      state.cases.push(testCase);
      updateSuiteCaseCount(state, suite.id);
      return testCase;
    },

    async listExecutions(params, options) {
      checkAborted(options);
      return filterList(state.executions, params);
    },

    async getExecution(executionId, options) {
      checkAborted(options);
      return findExecution(state, executionId);
    },

    async startExecution(input, options) {
      checkAborted(options);
      const testCase = findCase(state, input.caseId);
      const existingIndex = state.executions.findIndex(
        (item) => item.caseKey === testCase.key,
      );
      const updatedAt = nowIso();
      if (existingIndex >= 0) {
        const existing = state.executions[existingIndex];
        if (!existing) notFound("Execution", input.caseId);
        const updated: ExecutionViewModel = {
          id: existing.id,
          caseKey: existing.caseKey,
          caseTitle: existing.caseTitle,
          status: "in_progress",
          assignee: existing.assignee,
          progressLabel: "1 / 3 steps",
          updatedAt,
        };
        state.executions[existingIndex] = updated;
        return updated;
      }

      state.nextId += 1;
      const execution: ExecutionViewModel = {
        id: nextGeneratedId("exec", state.nextId),
        caseKey: testCase.key,
        caseTitle: testCase.title,
        status: "in_progress",
        assignee: MOCK_ACTOR,
        progressLabel: "1 / 3 steps",
        updatedAt,
      };
      state.executions.push(execution);
      return execution;
    },

    async pauseExecution(executionId, options) {
      checkAborted(options);
      const execution = findExecution(state, executionId);
      const index = state.executions.findIndex((item) => item.id === executionId);
      const updated: ExecutionViewModel = {
        ...execution,
        status: "paused",
        updatedAt: nowIso(),
      };
      state.executions[index] = updated;
      return updated;
    },

    async resumeExecution(executionId, options) {
      checkAborted(options);
      const execution = findExecution(state, executionId);
      const index = state.executions.findIndex((item) => item.id === executionId);
      const updated: ExecutionViewModel = {
        ...execution,
        status: "in_progress",
        updatedAt: nowIso(),
      };
      state.executions[index] = updated;
      return updated;
    },

    async listEvidence(params, options) {
      checkAborted(options);
      return filterList(state.evidence, params);
    },

    async submitEvidence(input, options) {
      checkAborted(options);
      findExecution(state, input.executionId);
      state.nextId += 1;
      const item: EvidenceViewModel = {
        id: nextGeneratedId("evid", state.nextId),
        title: input.title,
        kind: "note",
        contentType: "text/plain",
        sizeBytes: 0,
        status: "registered",
        linkedExecutionId: input.executionId,
        createdAt: nowIso(),
      };
      state.evidence.push(item);
      return item;
    },

    async listAutomationRuns(params, options) {
      checkAborted(options);
      return filterList(state.automationRuns, params);
    },

    async listCoverage(options) {
      checkAborted(options);
      return { items: state.coverage, total: state.coverage.length };
    },

    async listDefects(params, options) {
      checkAborted(options);
      return filterList(state.defects, params);
    },

    async listQualitySummaries(options) {
      checkAborted(options);
      return { items: state.qualitySummaries, total: state.qualitySummaries.length };
    },

    async listCertifications(params, options) {
      checkAborted(options);
      const items = state.certifications.map(toCertificationViewModel);
      return filterList(items, params);
    },

    async getCertification(certificationId, options) {
      checkAborted(options);
      return toCertificationViewModel(findCertification(state, certificationId));
    },

    async decideCertification(input, options) {
      checkAborted(options);
      const certification = findCertification(state, input.certificationId);
      const index = state.certifications.findIndex((item) => item.id === input.certificationId);
      const decidedAt = nowIso();
      const stateByDecision: Record<ApprovalDecisionInput["decision"], string> = {
        approve: "approved",
        reject: "rejected",
        review: "in_review",
      };

      const approval: CertificationApprovalViewModel = {
        id: nextGeneratedId("approval", ++state.nextId),
        stage: "final_decision",
        decision: input.decision,
        actor: MOCK_ACTOR,
        decidedAt,
        comment: input.comment ?? null,
      };

      const audit: CertificationAuditViewModel = {
        id: nextGeneratedId("audit", ++state.nextId),
        action: `certification.${input.decision}`,
        actor: MOCK_ACTOR,
        at: decidedAt,
        detail:
          input.comment ??
          `Certification decision recorded: ${input.decision.replace("_", " ")}.`,
      };

      const updated: MutableCertification = {
        ...certification,
        state: stateByDecision[input.decision],
        recommendation: certification.recommendation,
        recommendationAdvisoryOnly: true,
        approvals: [...certification.approvals, approval],
        audit: [...certification.audit, audit],
        updatedAt: decidedAt,
      };
      state.certifications[index] = updated;
      return toCertificationViewModel(updated);
    },

    async archiveCertification(certificationId, options) {
      checkAborted(options);
      const certification = findCertification(state, certificationId);
      const index = state.certifications.findIndex((item) => item.id === certificationId);
      const archivedAt = nowIso();
      const audit: CertificationAuditViewModel = {
        id: nextGeneratedId("audit", ++state.nextId),
        action: "certification.archived",
        actor: MOCK_ACTOR,
        at: archivedAt,
        detail: "Certification archived and removed from active review queue.",
      };
      const updated: MutableCertification = {
        ...certification,
        state: "archived",
        recommendationAdvisoryOnly: true,
        audit: [...certification.audit, audit],
        updatedAt: archivedAt,
      };
      state.certifications[index] = updated;
      return toCertificationViewModel(updated);
    },

    async listReleaseReadiness(options) {
      checkAborted(options);
      return { items: state.releaseReadiness, total: state.releaseReadiness.length };
    },

    async listReportPlaceholders(options) {
      checkAborted(options);
      return { items: state.reports, total: state.reports.length };
    },

    async listAdminSettings(options) {
      checkAborted(options);
      return { items: state.adminSettings, total: state.adminSettings.length };
    },
  };
}
