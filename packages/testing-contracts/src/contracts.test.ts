import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  APZ_TCMS_PERMISSIONS,
  CERTIFICATION_LIFECYCLE_STATUSES,
  CERTIFICATION_STATUS_LABELS,
  CERTIFICATION_STATUSES,
  CERTIFICATION_ENGINE_SERVICE_IDS,
  DEFAULT_APZ_TCMS_CONFIGURATION,
  MANUAL_TESTING_SERVICE_IDS,
  QUALITY_INTELLIGENCE_SERVICE_IDS,
  TESTING_CONTRACTS_VERSION,
  TESTING_EVENT_TYPES,
  TESTING_SERVICE_IDS,
  asAISuggestionId,
  asApprovalId,
  asAttachmentId,
  asAuditEventId,
  asAutomatedExecutionId,
  asAutomationJobId,
  asAutomationImportId,
  asAutomationRunId,
  asAutomationResultItemId,
  asAutomationImportHistoryId,
  asAutomationCoverageSnapshotId,
  asCertificationRecordId,
  asCoverageMetricId,
  asDashboardSnapshotId,
  asDefectLinkId,
  asEvidenceId,
  asExecutionSessionId,
  asManualExecutionId,
  asQualityGateId,
  asQualitySnapshotId,
  asRegressionAnalysisId,
  asRegressionSuiteId,
  asReleaseReadinessId,
  asRequirementId,
  asRiskId,
  asSignatureId,
  asTestCaseId,
  asTestCaseVersionId,
  asTestPlanId,
  asTestResultId,
  asTestRunId,
  asTestStepId,
  asTestSuiteId,
  asTraceabilityLinkId,
  asWitnessId,
  isCoverageMetricKind,
  isDefectProviderKind,
  isDefectStatus,
  canonicalizeTestStatus,
  canonicalizeExecutionStatus,
  canonicalizeCertificationStatus,
  certificationStatusLabel,
  createDefaultApzTcmsConfiguration,
  createTestingEventEnvelope,
  isApzTcmsPermission,
  isApprovalRole,
  isApprovalStatus,
  isAutomationType,
  isAutomationAdapterKind,
  isAutomationImportStatus,
  isNormalizedResultStatus,
  isBusinessCriticality,
  isCaseVersionReason,
  isCertificationStatus,
  isEnumMember,
  isEvidenceType,
  isExecutionApprovalState,
  isExecutionStatus,
  isExecutionType,
  isImpact,
  isLikelihood,
  isPlatformIdShape,
  isPriority,
  isRegressionImportance,
  isRiskLevel,
  isSeverity,
  isTestCaseLifecycleStatus,
  isTestResultStatus,
  isTestRunStatus,
  isTestStatus,
  isTestingEventType,
  isTraceabilityEntityKind,
  listApzTcmsPermissions,
  listPermissionsByPrefix,
} from "./index";

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function collectSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      files.push(...collectSourceFiles(full));
      continue;
    }
    if (full.endsWith(".ts") && !full.endsWith(".test.ts")) {
      files.push(full);
    }
  }
  return files;
}

describe("@apzhub/testing-contracts version and registries", () => {
  it("exports package version 0.10.0", () => {
    expect(TESTING_CONTRACTS_VERSION).toBe("0.10.0");
  });

  it("registers ten service interface ids", () => {
    expect(TESTING_SERVICE_IDS).toHaveLength(10);
    expect(TESTING_SERVICE_IDS).toContain("testing-service");
    expect(TESTING_SERVICE_IDS).toContain("certification-service");
    expect(TESTING_SERVICE_IDS).toContain("dashboard-service");
  });

  it("registers twelve manual testing service ids", () => {
    expect(MANUAL_TESTING_SERVICE_IDS).toHaveLength(12);
    expect(MANUAL_TESTING_SERVICE_IDS).toContain("manual-execution-service");
    expect(MANUAL_TESTING_SERVICE_IDS).toContain("certification-preparation-service");
  });

  it("registers nine quality intelligence service ids", () => {
    expect(QUALITY_INTELLIGENCE_SERVICE_IDS).toHaveLength(9);
    expect(QUALITY_INTELLIGENCE_SERVICE_IDS).toContain("defect-link-service");
    expect(QUALITY_INTELLIGENCE_SERVICE_IDS).toContain("quality-intelligence-service");
  });

  it("registers ten certification engine service ids", () => {
    expect(CERTIFICATION_ENGINE_SERVICE_IDS).toHaveLength(10);
    expect(CERTIFICATION_ENGINE_SERVICE_IDS).toContain("certification-workflow-service");
    expect(CERTIFICATION_ENGINE_SERVICE_IDS).toContain("certification-recommendation-service");
  });
});

describe("identifiers", () => {
  it("accepts valid platform id shapes", () => {
    expect(isPlatformIdShape("req_abc-123")).toBe(true);
    expect(isPlatformIdShape("a")).toBe(false);
    expect(isPlatformIdShape("")).toBe(false);
    expect(isPlatformIdShape(" bad")).toBe(false);
  });

  it("brands valid ids and rejects invalid shapes", () => {
    expect(asRequirementId("req_001")).toBe("req_001");
    expect(asTestPlanId("plan_001")).toBe("plan_001");
    expect(asTestSuiteId("suite_001")).toBe("suite_001");
    expect(asTestCaseId("case_42")).toBe("case_42");
    expect(asTestCaseVersionId("casever_01")).toBe("casever_01");
    expect(asTestStepId("step_01")).toBe("step_01");
    expect(asTestRunId("run_01")).toBe("run_01");
    expect(asTestResultId("result_01")).toBe("result_01");
    expect(asEvidenceId("ev_01")).toBe("ev_01");
    expect(asAttachmentId("att_01")).toBe("att_01");
    expect(asCertificationRecordId("cert_01")).toBe("cert_01");
    expect(asQualityGateId("gate_01")).toBe("gate_01");
    expect(asApprovalId("appr_01")).toBe("appr_01");
    expect(asRiskId("risk_01")).toBe("risk_01");
    expect(asTraceabilityLinkId("link_01")).toBe("link_01");
    expect(asAutomationJobId("job_01")).toBe("job_01");
    expect(asAutomationImportId("aimp_01")).toBe("aimp_01");
    expect(asAutomationRunId("arun_01")).toBe("arun_01");
    expect(asAutomationResultItemId("arit_01")).toBe("arit_01");
    expect(asAutomationImportHistoryId("aih_01")).toBe("aih_01");
    expect(asAutomationCoverageSnapshotId("acs_01")).toBe("acs_01");
    expect(asExecutionSessionId("sess_01")).toBe("sess_01");
    expect(asManualExecutionId("man_01")).toBe("man_01");
    expect(asAutomatedExecutionId("auto_01")).toBe("auto_01");
    expect(asDefectLinkId("def_01")).toBe("def_01");
    expect(asRegressionSuiteId("reg_01")).toBe("reg_01");
    expect(asCoverageMetricId("cov_01")).toBe("cov_01");
    expect(asAuditEventId("audit_01")).toBe("audit_01");
    expect(asAISuggestionId("ai_01")).toBe("ai_01");
    expect(asReleaseReadinessId("rr_01")).toBe("rr_01");
    expect(asSignatureId("sig_01")).toBe("sig_01");
    expect(asWitnessId("wit_01")).toBe("wit_01");
    expect(asDashboardSnapshotId("dash_01")).toBe("dash_01");
    expect(asQualitySnapshotId("qsnap_01")).toBe("qsnap_01");
    expect(asRegressionAnalysisId("regan_01")).toBe("regan_01");
    expect(() => asRequirementId("x")).toThrow(/Invalid platform identifier/);
  });
});

describe("enums", () => {
  it("validates membership helpers", () => {
    expect(isExecutionStatus("in_progress")).toBe(true);
    expect(isExecutionStatus("paused")).toBe(true);
    expect(isExecutionStatus("draft")).toBe(true);
    expect(isExecutionStatus("under_review")).toBe(true);
    expect(isExecutionStatus("planned")).toBe(true);
    expect(isExecutionStatus("nope")).toBe(false);
    expect(isTestStatus("ready")).toBe(true);
    expect(isTestStatus("review")).toBe(true);
    expect(isTestStatus("approved")).toBe(true);
    expect(isTestCaseLifecycleStatus("approved")).toBe(true);
    expect(isTestCaseLifecycleStatus("ready")).toBe(false);
    expect(canonicalizeTestStatus("ready")).toBe("approved");
    expect(canonicalizeTestStatus("draft")).toBe("draft");
    expect(canonicalizeExecutionStatus("planned")).toBe("draft");
    expect(canonicalizeExecutionStatus("queued")).toBe("assigned");
    expect(canonicalizeExecutionStatus("aborted")).toBe("cancelled");
    expect(canonicalizeExecutionStatus("failed")).toBe("blocked");
    expect(canonicalizeExecutionStatus("in_progress")).toBe("in_progress");
    expect(isTestResultStatus("pass")).toBe(true);
    expect(isTestResultStatus("not_executed")).toBe(true);
    expect(isTestRunStatus("completed")).toBe(true);
    expect(isEvidenceType("screenshot")).toBe(true);
    expect(isEvidenceType("url")).toBe(true);
    expect(isCertificationStatus("certified")).toBe(true);
    expect(isApprovalStatus("pending")).toBe(true);
    expect(isApprovalStatus("rework")).toBe(true);
    expect(isApprovalRole("reviewer")).toBe(true);
    expect(isSeverity("blocker")).toBe(true);
    expect(isPriority("high")).toBe(true);
    expect(isRiskLevel("critical")).toBe(true);
    expect(isLikelihood("likely")).toBe(true);
    expect(isImpact("major")).toBe(true);
    expect(isBusinessCriticality("mission_critical")).toBe(true);
    expect(isRegressionImportance("mandatory")).toBe(true);
    expect(isCaseVersionReason("cloned")).toBe(true);
    expect(isTraceabilityEntityKind("manual_execution")).toBe(true);
    expect(isExecutionApprovalState("pending_review")).toBe(true);
    expect(isAutomationType("e2e")).toBe(true);
    expect(isAutomationAdapterKind("vitest")).toBe(true);
    expect(isAutomationImportStatus("completed")).toBe(true);
    expect(isNormalizedResultStatus("timed_out")).toBe(true);
    expect(isExecutionType("manual")).toBe(true);
    expect(isDefectProviderKind("projects")).toBe(true);
    expect(isDefectStatus("reopened")).toBe(true);
    expect(isCoverageMetricKind("automation")).toBe(true);
    expect(isCoverageMetricKind("feature")).toBe(true);
    expect(isEnumMember(["a", "b"] as const, "a")).toBe(true);
  });

  it("exposes certification labels aligned to domain model", () => {
    expect(CERTIFICATION_LIFECYCLE_STATUSES).toHaveLength(12);
    expect(CERTIFICATION_STATUSES.length).toBeGreaterThanOrEqual(20);
    expect(certificationStatusLabel("draft")).toBe("Draft");
    expect(certificationStatusLabel("approved")).toBe("Approved");
    expect(certificationStatusLabel("development_ready")).toBe("Development Ready");
    expect(certificationStatusLabel("certified")).toBe("Certified");
    expect(certificationStatusLabel("failed_certification")).toBe(
      "Failed Certification",
    );
    expect(certificationStatusLabel("conditional_approval")).toBe(
      "Conditional Approval",
    );
    expect(Object.keys(CERTIFICATION_STATUS_LABELS)).toHaveLength(
      CERTIFICATION_STATUSES.length,
    );
    expect(canonicalizeCertificationStatus("certified")).toBe("approved");
    expect(canonicalizeCertificationStatus("failed_certification")).toBe("rejected");
    expect(canonicalizeCertificationStatus("conditional_approval")).toBe(
      "conditionally_approved",
    );
    expect(canonicalizeCertificationStatus("development_ready")).toBe("preparing");
    expect(canonicalizeCertificationStatus("uat_ready")).toBe("awaiting_review");
    expect(canonicalizeCertificationStatus("draft")).toBe("draft");
  });
});

describe("permissions catalogue", () => {
  it("lists all catalogue entries without duplicates", () => {
    const all = listApzTcmsPermissions();
    expect(all.length).toBeGreaterThan(30);
    expect(new Set(all).size).toBe(all.length);
    expect(all).toEqual(APZ_TCMS_PERMISSIONS);
  });

  it("supports prefix filtering and membership checks", () => {
    expect(isApzTcmsPermission("testing.view")).toBe(true);
    expect(isApzTcmsPermission("unknown.perm")).toBe(false);
    expect(listPermissionsByPrefix("certification.")).toContain(
      "certification.records.transition",
    );
    expect(listPermissionsByPrefix("certification.")).toEqual(
      expect.arrayContaining([
        "certification.create",
        "certification.approve",
        "certification.reject",
        "certification.override",
        "certification.audit",
      ]),
    );
    expect(listPermissionsByPrefix("dashboard.")).toEqual(
      expect.arrayContaining([
        "dashboard.view",
        "dashboard.refresh",
        "dashboard.admin",
      ]),
    );
    expect(listPermissionsByPrefix("quality.")).toEqual(
      expect.arrayContaining(["quality.view", "quality.compute", "quality.admin"]),
    );
    expect(listPermissionsByPrefix("defects.")).toContain("defects.link");
    expect(listPermissionsByPrefix("coverage.")).toContain("coverage.compute");
    expect(listPermissionsByPrefix("release.")).toContain("release.view");
  });
});

describe("configuration defaults", () => {
  it("returns a deep clone of defaults", () => {
    const config = createDefaultApzTcmsConfiguration();
    expect(config).toEqual(DEFAULT_APZ_TCMS_CONFIGURATION);
    const mutable = config as {
      limits: { maxStepsPerCase: number };
    };
    mutable.limits.maxStepsPerCase = 1;
    expect(DEFAULT_APZ_TCMS_CONFIGURATION.limits.maxStepsPerCase).toBe(100);
  });

  it("merges overrides while keeping AI auto-accept forbidden", () => {
    const config = createDefaultApzTcmsConfiguration({
      ai: { suggestionsEnabled: true, maxPendingSuggestionsPerUser: 5 },
      automation: {
        ingestionEnabled: true,
        allowedAdapterSourceIds: ["vitest-adapter"],
      },
      retention: { auditEventDays: 30 },
      evidence: { maxEvidencePerRun: 10, allowedEvidenceTypes: ["log"] },
      attachments: { maxSizeBytes: 1024, allowedContentTypes: ["text/plain"] },
      storage: { evidenceBucketRef: "custom-evidence" },
      certification: {
        requireWitness: true,
        defaultGateKeys: ["custom_gate"],
      },
      limits: { maxCasesPerSuite: 10 },
    });

    expect(config.ai.suggestionsEnabled).toBe(true);
    expect(config.ai.autoAcceptForbidden).toBe(true);
    expect(config.ai.maxPendingSuggestionsPerUser).toBe(5);
    expect(config.automation.ingestionEnabled).toBe(true);
    expect(config.automation.allowedAdapterSourceIds).toEqual(["vitest-adapter"]);
    expect(config.retention.auditEventDays).toBe(30);
    expect(config.evidence.allowedEvidenceTypes).toEqual(["log"]);
    expect(config.attachments.allowedContentTypes).toEqual(["text/plain"]);
    expect(config.storage.evidenceBucketRef).toBe("custom-evidence");
    expect(config.certification.defaultGateKeys).toEqual(["custom_gate"]);
    expect(config.limits.maxCasesPerSuite).toBe(10);
  });

  it("keeps default arrays when overrides omit them", () => {
    const config = createDefaultApzTcmsConfiguration({
      evidence: { maxEvidencePerRun: 3 },
      attachments: { maxAttachmentsPerParent: 2 },
      certification: { requireSignatureForCertified: false },
      automation: { maxConcurrentJobs: 2 },
    });

    expect(config.evidence.allowedEvidenceTypes).toEqual(
      DEFAULT_APZ_TCMS_CONFIGURATION.evidence.allowedEvidenceTypes,
    );
    expect(config.attachments.allowedContentTypes).toEqual(
      DEFAULT_APZ_TCMS_CONFIGURATION.attachments.allowedContentTypes,
    );
    expect(config.certification.defaultGateKeys).toEqual(
      DEFAULT_APZ_TCMS_CONFIGURATION.certification.defaultGateKeys,
    );
    expect(config.automation.allowedAdapterSourceIds).toEqual([]);
    expect(config.certification.requireSignatureForCertified).toBe(false);
  });
});

describe("events", () => {
  it("validates event types and builds envelopes", () => {
    expect(isTestingEventType("test_run.completed")).toBe(true);
    expect(isTestingEventType("test_run.running")).toBe(false);
    expect(TESTING_EVENT_TYPES).toContain("certification.state_changed");
    expect(TESTING_EVENT_TYPES).toContain("certification.created");
    expect(TESTING_EVENT_TYPES).toContain("certification.approved");
    expect(TESTING_EVENT_TYPES).toContain("certification.recommended");

    const event = createTestingEventEnvelope({
      eventType: "test_case.created",
      tenantId: "tenant_1",
      correlationId: "corr_1",
      payload: {
        testCaseId: asTestCaseId("case_1"),
        key: "TC-1",
        title: "Login",
      },
      actorUserId: "user_1",
      causationId: "cause_1",
    });

    expect(event.eventType).toBe("test_case.created");
    expect(event.tenantId).toBe("tenant_1");
    expect(event.correlationId).toBe("corr_1");
    expect(event.actorUserId).toBe("user_1");
    expect(event.causationId).toBe("cause_1");
    expect(event.occurredAt).toMatch(/^\d{4}-/);
    expect(event.payload.key).toBe("TC-1");
  });

  it("uses provided occurredAt when supplied", () => {
    const event = createTestingEventEnvelope({
      eventType: "test_run.completed",
      tenantId: "t",
      correlationId: "c",
      occurredAt: "2026-07-12T00:00:00.000Z",
      payload: {
        testRunId: "run_1" as never,
        status: "completed" as const,
        resultCount: 3,
      },
    });
    expect(event.occurredAt).toBe("2026-07-12T00:00:00.000Z");
  });
});

describe("service interface contracts", () => {
  it("defines TestingService and CertificationService operation shapes", () => {
    type TestingOps = keyof import("./services/testing-service").TestingService;
    type CertOps =
      keyof import("./services/certification-service").CertificationService;

    const testingOps: TestingOps[] = [
      "listRequirements",
      "createTestCase",
      "registerEvidenceMetadata",
      "createDefectLink",
    ];
    const certOps: CertOps[] = [
      "transitionCertificationState",
      "evaluateQualityGate",
      "decideApproval",
      "assessReleaseReadiness",
    ];

    expect(testingOps).toHaveLength(4);
    expect(certOps).toHaveLength(4);
  });
});

describe("boundary constraints", () => {
  it("does not import forbidden runner or platform-services packages", () => {
    const forbidden = [
      "playwright",
      "junit",
      "allure",
      "puppeteer",
      "cypress",
      "@apzhub/platform-services",
    ];
    const sourceFiles = collectSourceFiles(join(packageRoot, "src"));
    expect(sourceFiles.length).toBeGreaterThan(5);

    for (const file of sourceFiles) {
      if (file.endsWith(".test.ts")) continue;
      const content = readFileSync(file, "utf8");
      for (const token of forbidden) {
        expect(
          content,
          `${relative(packageRoot, file)} must not import ${token}`,
        ).not.toMatch(new RegExp(`from ["'].*${token.replace("/", "\\/")}.*["']`));
      }
      // vitest allowed only in *.test.ts (already skipped)
      expect(content).not.toMatch(/from ["']vitest["']/);
    }
  });
});
