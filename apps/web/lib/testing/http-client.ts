/**
 * Typed Testing frontend client — calls ONLY `/api/v1/testing/*`.
 * Workbench UI stays behind the TestingClient contract; this transport is HTTP-only.
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
  CertificationGateViewModel,
  CertificationViewModel,
  CoverageSummaryViewModel,
  CreateCaseInput,
  CreatePlanInput,
  CreateSuiteInput,
  DashboardViewModel,
  DefectLinkViewModel,
  EvidenceSubmitInput,
  EvidenceViewModel,
  ExecutionViewModel,
  PlanViewModel,
  QualitySummaryViewModel,
  ReleaseReadinessViewModel,
  ReportPlaceholderViewModel,
  RequirementViewModel,
  StartExecutionInput,
  SuiteViewModel,
  TestingCollectionResult,
  TestingListParams,
} from "./types";

const API_BASE = "/api/v1";

type JsonRecord = Record<string, unknown>;
type TestingApiErrorEnvelope = {
  readonly error?: {
    readonly message?: string;
    readonly code?: string;
  };
  readonly meta?: {
    readonly correlationId?: string;
    readonly requestId?: string;
  };
};
type TestingApiSuccessEnvelope<T> = {
  readonly data: T;
  readonly meta?: JsonRecord;
};
type TestingApiCollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: JsonRecord;
  readonly meta?: JsonRecord;
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildQuery(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "boolean") {
      search.set(key, value ? "true" : "false");
      continue;
    }
    if (Array.isArray(value)) {
      search.set(key, value.join(","));
      continue;
    }
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function listQuery(params?: TestingListParams): string {
  return buildQuery({
    search: params?.search,
    sort: params?.sort,
    order: params?.order,
    status: params?.status,
  });
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestJson<T>(
  path: string,
  init: RequestInit & TestingClientRequestOptions = {},
): Promise<T> {
  if (!path.startsWith("/testing/")) {
    throw new TestingClientError(
      `Invalid Testing API path: ${path}`,
      "TESTING_CLIENT_ROUTE_VIOLATION",
      500,
    );
  }

  const { signal, correlationId, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (correlationId) {
    headers.set("x-correlation-id", correlationId);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    signal,
    credentials: "include",
    headers,
  });

  const body = await parseJson(response);
  const meta = isRecord(body) && isRecord(body.meta) ? body.meta : undefined;
  const responseCorrelationId =
    (typeof meta?.correlationId === "string" ? meta.correlationId : undefined) ??
    correlationId;
  const responseRequestId =
    typeof meta?.requestId === "string" ? meta.requestId : undefined;

  if (!response.ok) {
    const envelope = body as TestingApiErrorEnvelope | null;
    throw TestingClientError.fromHttp({
      status: response.status,
      message: envelope?.error?.message,
      code: envelope?.error?.code,
      correlationId: responseCorrelationId,
      requestId: responseRequestId ?? envelope?.meta?.requestId,
    });
  }

  return body as T;
}

async function getData<T>(
  path: string,
  map: (value: unknown) => T,
  options?: TestingClientRequestOptions,
): Promise<T> {
  const envelope = await requestJson<TestingApiSuccessEnvelope<unknown>>(path, {
    method: "GET",
    ...options,
  });
  return map(envelope.data);
}

async function getCollection<T>(
  path: string,
  map: (value: unknown) => T,
  options?: TestingClientRequestOptions,
): Promise<TestingCollectionResult<T>> {
  const envelope = await requestJson<TestingApiCollectionEnvelope<unknown>>(path, {
    method: "GET",
    ...options,
  });
  return collectionFromEnvelope(envelope, map);
}

async function mutateData<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body: unknown,
  map: (value: unknown) => T,
  options?: TestingClientRequestOptions,
): Promise<T> {
  const envelope = await requestJson<TestingApiSuccessEnvelope<unknown>>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    ...options,
  });
  return map(envelope.data);
}

function collectionFromEnvelope<T>(
  envelope: TestingApiCollectionEnvelope<unknown>,
  map: (value: unknown) => T,
): TestingCollectionResult<T> {
  const rawItems = Array.isArray(envelope.data)
    ? envelope.data
    : isRecord(envelope.data) && Array.isArray(envelope.data.items)
      ? envelope.data.items
      : [];
  const total =
    numberAt(envelope.page, "total") ??
    numberAt(envelope.meta, "total") ??
    (isRecord(envelope.data) ? numberAt(envelope.data, "total") : undefined) ??
    rawItems.length;
  return {
    items: rawItems.map(map),
    total,
  };
}

function emptyCollection<T>(): TestingCollectionResult<T> {
  return { items: [], total: 0 };
}

function stringAt(record: unknown, key: string): string | undefined {
  if (!isRecord(record)) return undefined;
  const value = record[key];
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

function numberAt(record: unknown, key: string): number | undefined {
  if (!isRecord(record)) return undefined;
  const value = record[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function booleanAt(record: unknown, key: string): boolean | undefined {
  if (!isRecord(record)) return undefined;
  const value = record[key];
  return typeof value === "boolean" ? value : undefined;
}

function recordAt(record: unknown, key: string): JsonRecord | undefined {
  if (!isRecord(record)) return undefined;
  const value = record[key];
  return isRecord(value) ? value : undefined;
}

function recordsAt(record: unknown, key: string): readonly JsonRecord[] {
  if (!isRecord(record)) return [];
  const value = record[key];
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function stringArrayAt(record: unknown, key: string): readonly string[] {
  if (!isRecord(record)) return [];
  const value = record[key];
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function firstStringAt(
  record: unknown,
  keys: readonly string[],
  fallback: string,
): string {
  for (const key of keys) {
    const value = stringAt(record, key);
    if (value !== undefined && value !== "") return value;
  }
  return fallback;
}

function firstNumberAt(
  record: unknown,
  keys: readonly string[],
  fallback: number,
): number {
  for (const key of keys) {
    const value = numberAt(record, key);
    if (value !== undefined) return value;
  }
  return fallback;
}

function idOf(record: unknown, fallbackPrefix: string): string {
  return firstStringAt(
    record,
    ["id", "resourceId", "key"],
    `${fallbackPrefix}-unknown`,
  );
}

function updatedAt(record: unknown): string {
  return firstStringAt(record, ["updatedAt", "modifiedAt", "createdAt", "at"], "");
}

function slugKey(prefix: string, value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.:-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  const suffix = Date.now().toString(36);
  return `${prefix}-${slug || "item"}-${suffix}`.slice(0, 128);
}

function toRequirement(value: unknown): RequirementViewModel {
  return {
    id: idOf(value, "requirement"),
    key: firstStringAt(value, ["key", "requirementKey"], "REQ-UNKNOWN"),
    title: firstStringAt(value, ["title", "name", "summary"], "Untitled requirement"),
    status: firstStringAt(value, ["status", "state"], "unknown"),
    priority: firstStringAt(value, ["priority"], "medium"),
    updatedAt: updatedAt(value),
  };
}

function toPlan(value: unknown): PlanViewModel {
  const suiteIds = stringArrayAt(value, "suiteIds");
  return {
    id: idOf(value, "plan"),
    name: firstStringAt(value, ["name", "title", "key"], "Untitled plan"),
    status: firstStringAt(value, ["status", "state"], "unknown"),
    version: firstStringAt(
      value,
      ["version", "versionLabel", "releaseLabel"],
      String(firstNumberAt(value, ["versionNumber"], 1)),
    ),
    suiteCount: firstNumberAt(value, ["suiteCount", "suitesCount"], suiteIds.length),
    updatedAt: updatedAt(value),
  };
}

function toSuite(value: unknown): SuiteViewModel {
  const planIds = stringArrayAt(value, "planIds");
  return {
    id: idOf(value, "suite"),
    name: firstStringAt(value, ["name", "title", "key"], "Untitled suite"),
    planId: firstStringAt(value, ["planId"], planIds[0] ?? ""),
    planName: firstStringAt(value, ["planName", "planLabel"], ""),
    caseCount: firstNumberAt(
      value,
      ["caseCount", "casesCount"],
      stringArrayAt(value, "caseIds").length,
    ),
    status: firstStringAt(value, ["status", "state"], "unknown"),
    updatedAt: updatedAt(value),
  };
}

function toCase(value: unknown): CaseViewModel {
  const suiteIds = stringArrayAt(value, "suiteIds");
  return {
    id: idOf(value, "case"),
    key: firstStringAt(value, ["key", "caseKey"], "TC-UNKNOWN"),
    title: firstStringAt(value, ["title", "name", "summary"], "Untitled case"),
    suiteId: firstStringAt(value, ["suiteId"], suiteIds[0] ?? ""),
    suiteName: firstStringAt(value, ["suiteName", "suiteLabel"], ""),
    priority: firstStringAt(value, ["priority"], "medium"),
    status: firstStringAt(value, ["status", "state"], "unknown"),
    automationEligible:
      booleanAt(value, "automationEligible") ??
      stringArrayAt(value, "automationIds").length > 0,
    updatedAt: updatedAt(value),
  };
}

function toExecution(value: unknown): ExecutionViewModel {
  const testCase = recordAt(value, "case") ?? recordAt(value, "testCase");
  const assignee = recordAt(value, "assignee") ?? recordAt(value, "tester");
  return {
    id: idOf(value, "execution"),
    caseKey: firstStringAt(
      value,
      ["caseKey", "testCaseKey", "key"],
      firstStringAt(testCase, ["key"], "TC-UNKNOWN"),
    ),
    caseTitle: firstStringAt(
      value,
      ["caseTitle", "testCaseTitle", "title"],
      firstStringAt(testCase, ["title", "name"], "Untitled case"),
    ),
    status: firstStringAt(value, ["status", "state", "overallResult"], "unknown"),
    assignee: firstStringAt(
      value,
      ["assignee", "assigneeId", "testerId"],
      firstStringAt(assignee, ["name", "email", "id"], "Unassigned"),
    ),
    progressLabel: firstStringAt(value, ["progressLabel", "progress"], ""),
    updatedAt: updatedAt(value),
  };
}

function toEvidence(value: unknown): EvidenceViewModel {
  return {
    id: idOf(value, "evidence"),
    title: firstStringAt(value, ["title", "name"], "Untitled evidence"),
    kind: firstStringAt(value, ["kind", "type"], "note"),
    contentType: firstStringAt(value, ["contentType", "mimeType"], "text/plain"),
    sizeBytes: firstNumberAt(value, ["sizeBytes", "bytes"], 0),
    status: firstStringAt(value, ["status", "lifecycleStatus", "state"], "unknown"),
    linkedExecutionId:
      firstStringAt(
        value,
        ["linkedExecutionId", "executionId", "manualExecutionId"],
        "",
      ) || null,
    createdAt: firstStringAt(value, ["createdAt", "captureTime", "updatedAt"], ""),
  };
}

function toAutomationRun(value: unknown): AutomationRunViewModel {
  const counts =
    recordAt(value, "counts") ??
    recordAt(value, "summary") ??
    recordAt(value, "resultCounts");
  return {
    id: idOf(value, "automation"),
    adapter: firstStringAt(value, ["adapter", "adapterKind", "provider"], "unknown"),
    status: firstStringAt(value, ["status", "overallStatus", "state"], "unknown"),
    passed: firstNumberAt(
      value,
      ["passed", "passedCount"],
      firstNumberAt(counts, ["passed", "pass"], 0),
    ),
    failed: firstNumberAt(
      value,
      ["failed", "failedCount"],
      firstNumberAt(counts, ["failed", "fail"], 0),
    ),
    skipped: firstNumberAt(
      value,
      ["skipped", "skippedCount"],
      firstNumberAt(counts, ["skipped", "skip"], 0),
    ),
    importedAt: firstStringAt(value, ["importedAt", "completedAt", "createdAt"], ""),
  };
}

function toCoverage(value: unknown): CoverageSummaryViewModel {
  const covered = firstNumberAt(value, ["covered", "coveredCount"], 0);
  const total = firstNumberAt(value, ["total", "totalCount"], 0);
  const percentage = firstNumberAt(
    value,
    ["percentage", "percent"],
    total > 0 ? Math.round((covered / total) * 100) : 0,
  );
  return {
    id: idOf(value, "coverage"),
    dimension: firstStringAt(
      value,
      ["dimension", "kind", "subjectKind", "label"],
      "Coverage",
    ),
    covered,
    total,
    percentLabel: firstStringAt(value, ["percentLabel"], `${percentage}%`),
    status: firstStringAt(value, ["status", "state"], "unknown"),
  };
}

function toDefect(value: unknown): DefectLinkViewModel {
  return {
    id: idOf(value, "defect"),
    title: firstStringAt(
      value,
      ["title", "summary", "externalRef", "internalRef"],
      "Untitled defect",
    ),
    severity: firstStringAt(value, ["severity", "priority"], "unknown"),
    status: firstStringAt(value, ["status", "state"], "unknown"),
    linkedCaseKey:
      firstStringAt(
        value,
        ["linkedCaseKey", "caseKey"],
        stringArrayAt(value, "caseIds")[0] ?? "",
      ) || null,
    sourceLabel: firstStringAt(
      value,
      ["sourceLabel", "providerKind", "providerKey"],
      "Testing",
    ),
    updatedAt: updatedAt(value),
  };
}

function toQualitySummary(value: unknown): QualitySummaryViewModel {
  return {
    id: idOf(value, "quality"),
    title: firstStringAt(value, ["title", "name", "scopeLabel"], "Quality summary"),
    status: firstStringAt(value, ["status", "state", "overallStatus"], "unknown"),
    summary: firstStringAt(value, ["summary", "description", "detail"], ""),
    updatedAt: updatedAt(value),
  };
}

function toCertificationGate(value: unknown): CertificationGateViewModel {
  const status = firstStringAt(value, ["status", "state"], "unknown");
  return {
    id: idOf(value, "gate"),
    name: firstStringAt(value, ["name", "title", "key"], "Certification gate"),
    status: isGateStatus(status) ? status : "unknown",
    reason: firstStringAt(value, ["reason", "detail", "message"], ""),
    evaluatedAt: firstStringAt(value, ["evaluatedAt", "updatedAt"], ""),
    evaluator: firstStringAt(value, ["evaluator", "evaluatorId", "actor"], "system"),
  };
}

function isGateStatus(value: string): value is CertificationGateViewModel["status"] {
  return (
    value === "pass" ||
    value === "fail" ||
    value === "warning" ||
    value === "not_applicable" ||
    value === "unknown"
  );
}

function toCertificationApproval(value: unknown): CertificationApprovalViewModel {
  return {
    id: idOf(value, "approval"),
    stage: firstStringAt(value, ["stage", "name"], "approval"),
    decision: firstStringAt(value, ["decision", "state", "status"], "pending"),
    actor: firstStringAt(value, ["actor", "actorId", "userId"], "system"),
    decidedAt: firstStringAt(value, ["decidedAt", "updatedAt", "createdAt"], ""),
    comment: firstStringAt(value, ["comment", "reason", "comments"], "") || null,
  };
}

function toCertificationAudit(value: unknown): CertificationAuditViewModel {
  return {
    id: idOf(value, "audit"),
    action: firstStringAt(value, ["action", "eventType"], "certification.updated"),
    actor: firstStringAt(value, ["actor", "actorId", "userId"], "system"),
    at: firstStringAt(value, ["at", "createdAt", "updatedAt"], ""),
    detail: firstStringAt(value, ["detail", "message", "reason"], ""),
  };
}

function toCertification(value: unknown): CertificationViewModel {
  const recommendation = recordAt(value, "recommendation");
  return {
    id: idOf(value, "certification"),
    name: firstStringAt(value, ["name", "title", "key"], "Certification"),
    state: firstStringAt(value, ["state", "status"], "unknown"),
    recommendation: firstStringAt(
      value,
      ["recommendation"],
      firstStringAt(recommendation, ["status", "decision", "label"], "unknown"),
    ),
    recommendationAdvisoryOnly: true,
    gates: recordsAt(value, "gates").map(toCertificationGate),
    approvals: recordsAt(value, "approvals").map(toCertificationApproval),
    audit: recordsAt(value, "audit").map(toCertificationAudit),
    updatedAt: updatedAt(value),
  };
}

function toDashboard(value: unknown): DashboardViewModel {
  const cards = recordsAt(value, "cards");
  const metrics = recordAt(value, "metrics");
  const recentCertifications = recordsAt(value, "recentCertifications").map(
    toCertification,
  );
  const recentExecutions = recordsAt(value, "recentExecutions").map(toExecution);
  return {
    headline: firstStringAt(
      value,
      ["headline", "title"],
      "Testing & Certification overview",
    ),
    cards:
      cards.length > 0
        ? cards.map(toDashboardCard)
        : [
            dashboardCard(
              "requirements",
              "Requirements",
              firstStringAt(metrics, ["requirements", "requirementCount"], "0"),
              "neutral",
            ),
            dashboardCard(
              "executions",
              "Executions",
              firstStringAt(metrics, ["executions", "executionCount"], "0"),
              "success",
            ),
            dashboardCard(
              "certifications",
              "Certifications",
              firstStringAt(metrics, ["certifications", "certificationCount"], "0"),
              "warning",
            ),
            dashboardCard(
              "defects",
              "Defects",
              firstStringAt(metrics, ["defects", "defectCount"], "0"),
              "danger",
            ),
          ],
    recentCertifications,
    recentExecutions,
  };
}

function toDashboardCard(value: unknown): DashboardViewModel["cards"][number] {
  const tone = firstStringAt(value, ["tone"], "neutral");
  return dashboardCard(
    idOf(value, "card"),
    firstStringAt(value, ["label", "title"], "Metric"),
    firstStringAt(value, ["value", "count"], "0"),
    isDashboardTone(tone) ? tone : "neutral",
  );
}

function dashboardCard(
  id: string,
  label: string,
  value: string,
  tone: DashboardViewModel["cards"][number]["tone"],
): DashboardViewModel["cards"][number] {
  return { id, label, value, tone };
}

function isDashboardTone(
  value: string,
): value is DashboardViewModel["cards"][number]["tone"] {
  return (
    value === "neutral" ||
    value === "success" ||
    value === "warning" ||
    value === "danger"
  );
}

function asSingleItemCollection<T>(
  value: T,
  isEmpty: (item: T) => boolean,
): TestingCollectionResult<T> {
  return isEmpty(value) ? emptyCollection<T>() : { items: [value], total: 1 };
}

export function createHttpTestingClient(): TestingClient {
  return {
    getDashboard(options) {
      return getData("/testing/dashboard", toDashboard, options);
    },

    listRequirements(params, options) {
      return getCollection(
        `/testing/requirements${listQuery(params)}`,
        toRequirement,
        options,
      );
    },

    listPlans(params, options) {
      return getCollection(`/testing/plans${listQuery(params)}`, toPlan, options);
    },

    getPlan(planId, options) {
      return getData(`/testing/plans/${encodeURIComponent(planId)}`, toPlan, options);
    },

    createPlan(input: CreatePlanInput, options) {
      return mutateData(
        "/testing/plans",
        "POST",
        { key: slugKey("plan", input.name), name: input.name, status: "draft" },
        toPlan,
        options,
      );
    },

    listSuites(params, options) {
      return getCollection(`/testing/suites${listQuery(params)}`, toSuite, options);
    },

    createSuite(input: CreateSuiteInput, options) {
      return mutateData(
        "/testing/suites",
        "POST",
        {
          key: slugKey("suite", input.name),
          name: input.name,
          status: "draft",
          planIds: [input.planId],
        },
        toSuite,
        options,
      );
    },

    listCases(params, options) {
      return getCollection(`/testing/cases${listQuery(params)}`, toCase, options);
    },

    createCase(input: CreateCaseInput, options) {
      return mutateData(
        "/testing/cases",
        "POST",
        {
          key: slugKey("case", input.title),
          title: input.title,
          status: "draft",
          priority: "medium",
          suiteIds: [input.suiteId],
        },
        toCase,
        options,
      );
    },

    listExecutions(params, options) {
      return getCollection(
        `/testing/executions${listQuery(params)}`,
        toExecution,
        options,
      );
    },

    getExecution(executionId, options) {
      return getData(
        `/testing/executions/${encodeURIComponent(executionId)}`,
        toExecution,
        options,
      );
    },

    startExecution(input: StartExecutionInput, options) {
      return mutateData(
        "/testing/executions",
        "POST",
        {
          sessionId: slugKey("session", input.caseId),
          caseId: input.caseId,
          status: "in_progress",
        },
        toExecution,
        options,
      );
    },

    pauseExecution(executionId, options) {
      return mutateData(
        `/testing/executions/${encodeURIComponent(executionId)}/pause`,
        "POST",
        {},
        toExecution,
        options,
      );
    },

    resumeExecution(executionId, options) {
      return mutateData(
        `/testing/executions/${encodeURIComponent(executionId)}/resume`,
        "POST",
        {},
        toExecution,
        options,
      );
    },

    listEvidence(params, options) {
      return getCollection(
        `/testing/evidence${listQuery(params)}`,
        toEvidence,
        options,
      );
    },

    submitEvidence(input: EvidenceSubmitInput, options) {
      return mutateData(
        "/testing/evidence",
        "POST",
        {
          type: "note",
          title: input.title,
          storageRef: `metadata:${input.executionId}:${slugKey("evidence", input.title)}`,
          contentType: "text/plain",
          sizeBytes: 0,
          executionId: input.executionId,
          lifecycleStatus: "submitted",
        },
        toEvidence,
        options,
      );
    },

    listAutomationRuns(params, options) {
      return getCollection(
        `/testing/automation/imports${listQuery(params)}`,
        toAutomationRun,
        options,
      );
    },

    listCoverage(options) {
      return getCollection("/testing/coverage", toCoverage, options);
    },

    listDefects(params, options) {
      return getCollection(`/testing/defects${listQuery(params)}`, toDefect, options);
    },

    async listQualitySummaries(options) {
      const summary = await getData(
        "/testing/quality/summary",
        toQualitySummary,
        options,
      );
      return asSingleItemCollection(summary, (item) => item.id === "quality-unknown");
    },

    listCertifications(params, options) {
      return getCollection(
        `/testing/certifications${listQuery(params)}`,
        toCertification,
        options,
      );
    },

    getCertification(certificationId, options) {
      return getData(
        `/testing/certifications/${encodeURIComponent(certificationId)}`,
        toCertification,
        options,
      );
    },

    decideCertification(input: ApprovalDecisionInput, options) {
      const certificationId = encodeURIComponent(input.certificationId);
      if (input.decision === "approve") {
        return mutateData(
          `/testing/certifications/${certificationId}/approve`,
          "POST",
          input.comment ? { reason: input.comment } : {},
          toCertification,
          options,
        );
      }
      if (input.decision === "reject") {
        return mutateData(
          `/testing/certifications/${certificationId}/reject`,
          "POST",
          { reason: input.comment ?? "Rejected from Testing workbench." },
          toCertification,
          options,
        );
      }
      return mutateData(
        `/testing/certifications/${certificationId}/submit-review`,
        "POST",
        input.comment ? { reason: input.comment } : {},
        toCertification,
        options,
      );
    },

    archiveCertification(certificationId, options) {
      return mutateData(
        `/testing/certifications/${encodeURIComponent(certificationId)}`,
        "DELETE",
        {},
        toCertification,
        options,
      );
    },

    listReleaseReadiness(options) {
      void options;
      // No collection endpoint exists today; readiness is calculated per release/plan.
      return Promise.resolve(emptyCollection<ReleaseReadinessViewModel>());
    },

    async listReportPlaceholders(options) {
      const { createHttpReportingClient } = await import(
        "@/lib/reporting/reporting-client"
      );
      const reporting = createHttpReportingClient();
      try {
        const templates = await reporting.listTemplates(undefined, options);
        const items: ReportPlaceholderViewModel[] = templates.items.map(
          (template) => ({
            id: template.id,
            title: template.name,
            description: template.description ?? template.title,
            status: "placeholder" as const,
          }),
        );
        return { items, total: items.length };
      } catch {
        return emptyCollection<ReportPlaceholderViewModel>();
      }
    },

    listAdminSettings(options) {
      void options;
      return Promise.resolve(emptyCollection<AdminSettingViewModel>());
    },
  };
}
