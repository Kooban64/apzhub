/**
 * APZSEARCH-013 — Testing Search Publication Adapter tests.
 */
import { describe, expect, it } from "vitest";
import {
  asApprovalId,
  asAutomationCoverageSnapshotId,
  asAutomationImportId,
  asAutomationRunId,
  asAutomatedExecutionId,
  asBenchmarkId,
  asCertificationGateDefinitionId,
  asCertificationRecordId,
  asDefectLinkId,
  asEngineeringHistoricalSnapshotId,
  asEngineeringSnapshotId,
  asEvidenceId,
  asExecutionSessionId,
  asManualExecutionId,
  asQualityGateId,
  asReleaseApprovalId,
  asReleaseCandidateId,
  asReleaseDecisionId,
  asReleaseId,
  asReleasePackageId,
  asReleaseScopeId,
  asReleaseSummarySnapshotId,
  asRequirementId,
  asTestCaseId,
  asTestPlanId,
  asTestRunId,
  asTestStepId,
  asTestSuiteId,
  asTrendSeriesId,
  DEFAULT_QUALITY_SCORE_WEIGHTS,
  type Approval,
  type AutomationCoverageSnapshot,
  type AutomationImport,
  type AutomationRun,
  type Benchmark,
  type CertificationGateDefinition,
  type CertificationRecord,
  type DefectLink,
  type EngineeringRiskSummary,
  type EngineeringSnapshot,
  type Evidence,
  type HistoricalSnapshot,
  type ManualExecution,
  type QualityGate,
  type Release,
  type ReleaseApproval,
  type ReleaseCandidate,
  type ReleaseDecision,
  type ReleaseManifest,
  type ReleasePackage,
  type ReleaseScope,
  type ReleaseSummary,
  type ReportGenerationMetadata,
  type ReportTemplate,
  type Requirement,
  type TestCase,
  type TestPlan,
  type TestRun,
  type TestStep,
  type TestSuite,
  type TrendSeries,
} from "@apzhub/testing-contracts";
import { createSearchIntegration } from "@apzhub/search-integration";

import {
  SEARCH_TESTING_VERSION,
  TESTING_SEARCH_ENTITY_TYPES,
  createTestingSearchAdapter,
  createTestingSearchAdapterForTest,
  createTestingSearchPublisher,
  createTestingSearchPublicationContext,
  isTestingSearchEntityType,
  looksLikeStorageLeak,
} from "./index";

const TS = "2026-01-01T00:00:00.000Z";
const TENANT = "tenant-a";

function ctx(tenantId = TENANT, org = "org-a") {
  return createTestingSearchPublicationContext({
    serviceContext: {
      tenantId,
      userId: "user-1",
      correlationId: "corr-013",
      permissions: ["testing.read", "search.query.execute"],
      organisationId: org,
      workspaceId: "ws_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    },
  });
}

const audit = {
  createdAt: TS,
  updatedAt: TS,
  tenantId: TENANT,
  createdBy: "user-1",
};

const plan: TestPlan = {
  ...audit,
  id: asTestPlanId("tpl_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
  key: "TP-1",
  name: "Release plan",
  description: "Main plan",
  status: "approved",
  suiteIds: [],
  requirementIds: [],
  riskIds: [],
  releaseLabel: "1.0",
  ownerId: "user-1",
  versionNumber: 2,
};

const suite: TestSuite = {
  ...audit,
  id: asTestSuiteId("tsu_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
  key: "TS-1",
  name: "Smoke",
  status: "ready",
  planIds: [plan.id],
  caseIds: [],
  isRegression: false,
  ownerId: "user-1",
};

const testCase: TestCase = {
  ...audit,
  id: asTestCaseId("tca_cccccccccccccccccccccccccccccccc"),
  key: "TC-1",
  title: "Login works",
  description: "User can login",
  status: "approved",
  priority: "high",
  suiteIds: [suite.id],
  requirementIds: [],
  steps: [],
  riskLevel: "major",
  ownerId: "user-1",
  versionNumber: 1,
  tags: ["smoke"],
};

const step: TestStep = {
  id: asTestStepId("tst_dddddddddddddddddddddddddddddddd"),
  caseId: testCase.id,
  ordinal: 1,
  action: "Open login",
  expectedResult: "Form visible",
};

const execution: ManualExecution = {
  ...audit,
  id: asManualExecutionId("mex_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  sessionId: asExecutionSessionId("ses_ffffffffffffffffffffffffffffffff"),
  caseId: testCase.id,
  status: "completed",
  assigneeId: "user-1",
  overallResult: "pass",
  approvalState: "approved",
  stepActuals: [],
};

const run: TestRun = {
  ...audit,
  id: asTestRunId("trn_11111111111111111111111111111111"),
  sessionId: execution.sessionId,
  caseId: testCase.id,
  executionType: "manual",
  status: "completed",
  resultIds: [],
  evidenceIds: [],
};

const evidence: Evidence = {
  ...audit,
  id: asEvidenceId("evd_22222222222222222222222222222222"),
  type: "screenshot",
  title: "Login screenshot",
  description: "Evidence meta",
  storageRef: "s3://secret-bucket/obj",
  contentHash: "deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
  checksum: "aa".repeat(32),
  sizeBytes: 2048,
  mimeType: "image/png",
  url: "https://example.com/?token=abc",
  lifecycleStatus: "verified",
  runId: run.id,
  authorUserId: "user-1",
};

const requirement: Requirement = {
  ...audit,
  id: asRequirementId("req_33333333333333333333333333333333"),
  key: "REQ-1",
  title: "Auth required",
  description: "Must authenticate",
  priority: "high",
  workItemRefs: [],
  riskIds: [],
  tags: ["security"],
  ownerId: "user-1",
};

const defect: DefectLink = {
  ...audit,
  id: asDefectLinkId("def_44444444444444444444444444444444"),
  tenantId: TENANT,
  providerKind: "internal",
  status: "open",
  severity: "critical",
  priority: "high",
  summary: "Login fails",
  internalRef: "BUG-9",
  ownerUserId: "user-1",
};

const approval: Approval = {
  ...audit,
  id: asApprovalId("apr_55555555555555555555555555555555"),
  certificationRecordId: asCertificationRecordId(
    "cer_66666666666666666666666666666666",
  ),
  status: "approved",
  subjectKind: "certification",
  subjectId: "cer_66666666666666666666666666666666",
  decidedAt: TS,
  decidedByUserId: "user-1",
};

const certification: CertificationRecord = {
  ...audit,
  id: asCertificationRecordId("cer_66666666666666666666666666666666"),
  key: "CERT-1",
  name: "Prod cert",
  status: "certified",
  gateIds: [],
  approvalIds: [approval.id],
  productLabel: "portal",
  releaseLabel: "1.0",
  certifiedAt: TS,
  currentRecommendation: "ready_for_approval",
};

const qualityGate: QualityGate = {
  ...audit,
  id: asQualityGateId("qgt_77777777777777777777777777777777"),
  key: "coverage",
  name: "Coverage gate",
  status: "passed",
  certificationRecordId: certification.id,
};

const gateDef: CertificationGateDefinition = {
  ...audit,
  id: asCertificationGateDefinitionId("cgd_88888888888888888888888888888888"),
  gateKey: "approvals",
  name: "Approvals gate",
  kind: "approval",
  required: true,
  enabled: true,
};

const automationRun: AutomationRun = {
  ...audit,
  id: asAutomationRunId("aru_99999999999999999999999999999999"),
  executionId: asAutomatedExecutionId("aex_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
  title: "Suite run",
  status: "pass",
  tags: ["ci"],
  organisationId: "org-a",
  revision: 1,
};

const imported: AutomationImport = {
  ...audit,
  id: asAutomationImportId("aim_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
  adapterKind: "vitest",
  adapterVersion: "1.0.0",
  externalRunRef: "run-123",
  status: "completed",
  checksum: "ff".repeat(32),
  payloadFingerprint: "should-never-appear",
  organisationId: "org-a",
  revision: 2,
};

const coverage: AutomationCoverageSnapshot = {
  ...audit,
  id: asAutomationCoverageSnapshotId("acs_cccccccccccccccccccccccccccccccc"),
  importId: imported.id,
  summary: { covered: 8, total: 10, percentage: 80, kind: "requirement" },
  coveredCount: 8,
  totalCount: 10,
  percentage: 80,
  organisationId: "org-a",
};

const release: Release = {
  ...audit,
  id: asReleaseId("rel_dddddddddddddddddddddddddddddddd"),
  key: "REL-1",
  name: "1.0 Release",
  status: "approved",
  description: "Ship it",
  organisationId: "org-a",
};

const candidate: ReleaseCandidate = {
  ...audit,
  id: asReleaseCandidateId("rcd_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  releaseId: release.id,
  label: "RC1",
  status: "ready_for_approval",
};

const pkg: ReleasePackage = {
  ...audit,
  id: asReleasePackageId("rpk_ffffffffffffffffffffffffffffffff"),
  releaseId: release.id,
  name: "Web package",
  versionLabel: "1.0.0",
};

const scope: ReleaseScope = {
  ...audit,
  id: asReleaseScopeId("rsc_12121212121212121212121212121212"),
  releaseId: release.id,
  kind: "plan",
  refId: plan.id,
  label: "Main plan",
};

const releaseApproval: ReleaseApproval = {
  ...audit,
  id: asReleaseApprovalId("rap_13131313131313131313131313131313"),
  releaseId: release.id,
  stageKind: "qa",
  status: "approved",
  decidedAt: TS,
  decidedByUserId: "user-1",
};

const releaseDecision: ReleaseDecision = {
  ...audit,
  id: asReleaseDecisionId("rdc_14141414141414141414141414141414"),
  releaseId: release.id,
  verdict: "approved",
  decidedByUserId: "user-1",
  decidedAt: TS,
  rationale: "All gates green",
  isAutomatic: false,
};

const manifest: ReleaseManifest = {
  releaseId: release.id,
  packageIds: [pkg.id],
  candidateIds: [candidate.id],
  scopeRefs: [],
  evidenceRefs: [],
  dependencyIds: [],
  generatedAt: TS,
  isDecision: false,
};

const releaseSummary: ReleaseSummary = {
  id: asReleaseSummarySnapshotId("rsm_15151515151515151515151515151515"),
  releaseId: release.id,
  approvalStatuses: { qa: "approved" },
  recommendationCode: "recommend_release",
  recommendationReasons: ["coverage ok"],
  computedAt: TS,
  isDecision: false,
};

const risk: EngineeringRiskSummary = {
  overallScore: 42,
  overallLevel: "medium",
  factors: [],
  computedAt: TS,
};

const qualityScore = {
  id: "qs_1",
  scope: { tenantId: TENANT, organisationId: "org-a" },
  score: 80,
  weights: DEFAULT_QUALITY_SCORE_WEIGHTS,
  inputs: {
    coverage: 80,
    automation: 70,
    manualExecution: 75,
    failedTests: 5,
    openDefects: 2,
    certification: 90,
    approvals: 85,
    releaseReadiness: 80,
  },
  components: [],
  computedAt: TS,
};

const health = {
  scope: { tenantId: TENANT },
  status: "healthy" as const,
  overallScore: 80,
  qualityScore: 80,
  stabilityScore: 80,
  releaseReadinessScore: 80,
  riskScore: 20,
  coverageScore: 80,
  automationScore: 70,
  manualExecutionScore: 75,
  certificationScore: 90,
  pipelineHealthScore: 85,
  indicators: [],
  risk,
  computedAt: TS,
  isDecision: false as const,
};

const engSnapshot: EngineeringSnapshot = {
  ...audit,
  id: asEngineeringSnapshotId("ens_16161616161616161616161616161616"),
  tenantId: TENANT,
  scope: { tenantId: TENANT, organisationId: "org-a" },
  qualityScore,
  health,
  risk,
  indicators: [],
  trends: [],
  computedAt: TS,
  label: "Weekly snapshot",
};

const trend: TrendSeries = {
  id: asTrendSeriesId("trs_17171717171717171717171717171717"),
  kind: "quality",
  scope: { tenantId: TENANT, organisationId: "org-a" },
  periodKind: "weekly",
  points: [{ at: TS, value: 80 }],
  direction: "improving",
  delta: 2,
  computedAt: TS,
};

const benchmark: Benchmark = {
  ...audit,
  id: asBenchmarkId("bnm_18181818181818181818181818181818"),
  tenantId: TENANT,
  scope: { tenantId: TENANT },
  metricKey: "coverage",
  comparison: { current: 80, direction: "increase" },
  computedAt: TS,
  label: "Coverage benchmark",
};

const historical: HistoricalSnapshot = {
  ...audit,
  id: asEngineeringHistoricalSnapshotId("ehs_19191919191919191919191919191919"),
  tenantId: TENANT,
  scope: { tenantId: TENANT },
  period: { kind: "weekly", startAt: TS, endAt: TS, label: "W1" },
  qualityScore: 80,
  engineeringHealthScore: 78,
  indicators: [],
  metrics: {},
  sourceRefs: {},
  computedAt: TS,
  immutable: true,
};

const reportMeta: ReportGenerationMetadata = {
  id: "rpt_20202020202020202020202020202020",
  tenantId: TENANT,
  organisationId: "org-a",
  requestId: "req-1",
  templateId: "tpl-1",
  reportType: "qa",
  outputFormat: "markdown",
  parametersJson: "{}",
  generatedAt: TS,
  generatedBy: "user-1",
  version: "1",
  revision: 1,
  checksumSha256: "ab".repeat(32),
  byteLength: 512,
  preview: false,
  createdAt: TS,
  updatedAt: TS,
};

const reportTemplate: ReportTemplate = {
  id: "rtt_21212121212121212121212121212121",
  reportType: "qa",
  name: "QA template",
  version: "1",
  revision: 1,
  title: "QA Report",
  description: "Template meta",
  sections: [],
  builtin: false,
  createdAt: TS,
  updatedAt: TS,
};

describe("APZSEARCH-013 search-testing", () => {
  it("ships version and entity catalogue", () => {
    expect(SEARCH_TESTING_VERSION).toBe("0.1.0");
    expect(TESTING_SEARCH_ENTITY_TYPES.length).toBeGreaterThanOrEqual(30);
    expect(isTestingSearchEntityType("test_case")).toBe(true);
    expect(isTestingSearchEntityType("test_run")).toBe(true);
    expect(isTestingSearchEntityType("document")).toBe(false);
    expect(looksLikeStorageLeak("storageRef_abc")).toBe(true);
    expect(looksLikeStorageLeak("payloadFingerprint")).toBe(true);
    expect(looksLikeStorageLeak("tca_cccccccccccccccccccccccccccccccc")).toBe(
      false,
    );
  });

  it("maps and publishes core Testing entity types without leakage", () => {
    const adapter = createTestingSearchAdapterForTest();
    const context = ctx();

    const inputs = [
      { entityType: "test_plan" as const, entity: plan },
      { entityType: "test_suite" as const, entity: suite },
      { entityType: "test_case" as const, entity: testCase },
      {
        entityType: "test_execution" as const,
        entity: execution,
        extras: { title: "Manual exec login" },
      },
      { entityType: "test_run" as const, entity: run, extras: { title: "Run 1" } },
      {
        entityType: "execution_step" as const,
        entity: step,
        extras: {
          tenantId: TENANT,
          parentCase: testCase,
          parentExecution: execution,
        },
      },
      { entityType: "evidence" as const, entity: evidence },
      { entityType: "approval" as const, entity: approval },
      { entityType: "requirement" as const, entity: requirement },
      { entityType: "defect" as const, entity: defect },
      { entityType: "automation_run" as const, entity: automationRun },
      {
        entityType: "automation_suite" as const,
        entity: {
          id: "asu_22222222222222222222222222222222",
          title: "Canonical suite",
          status: "pass",
          tenantId: TENANT,
          caseCount: 3,
          key: "suite-a",
        },
      },
      { entityType: "imported_result" as const, entity: imported },
      { entityType: "coverage_summary" as const, entity: coverage },
      { entityType: "certification" as const, entity: certification },
      { entityType: "certification_gate" as const, entity: qualityGate },
      {
        entityType: "certification_approval" as const,
        entity: {
          ...approval,
          id: asApprovalId("apr_26262626262626262626262626262626"),
        },
      },
      {
        entityType: "certification_evidence" as const,
        entity: {
          id: "cev_23232323232323232323232323232323",
          title: "Cert evidence links",
          tenantId: TENANT,
          certificationRecordId: certification.id,
          labels: ["req", "exec"],
          links: {
            requirementIds: [requirement.id],
            planIds: [plan.id],
            suiteIds: [],
            caseIds: [],
            executionIds: [],
            evidenceIds: [evidence.id],
            coverageIds: [],
            defectIds: [],
            riskIds: [],
            readinessSummaryIds: [],
            qualitySummaryIds: [],
          },
        },
      },
      {
        entityType: "certification_decision" as const,
        entity: {
          id: "cde_27272727272727272727272727272727",
          tenantId: TENANT,
          certificationRecordId: certification.id,
          status: "certified",
          title: "Certification decision",
          decidedAt: TS,
          decidedByUserId: "user-1",
        },
      },
      { entityType: "release" as const, entity: release },
      { entityType: "release_candidate" as const, entity: candidate },
      { entityType: "release_package" as const, entity: pkg },
      { entityType: "release_scope" as const, entity: scope },
      { entityType: "release_approval" as const, entity: releaseApproval },
      { entityType: "release_decision" as const, entity: releaseDecision },
      {
        entityType: "release_manifest" as const,
        entity: manifest,
        extras: { tenantId: TENANT, parentRelease: release },
      },
      {
        entityType: "release_summary" as const,
        entity: releaseSummary,
        extras: { tenantId: TENANT, parentRelease: release },
      },
      { entityType: "engineering_snapshot" as const, entity: engSnapshot },
      { entityType: "engineering_trend" as const, entity: trend },
      { entityType: "benchmark" as const, entity: benchmark },
      { entityType: "historical_snapshot" as const, entity: historical },
      {
        entityType: "risk_summary" as const,
        entity: risk,
        extras: { entityId: "rsk_24242424242424242424242424242424", tenantId: TENANT },
      },
      { entityType: "report_metadata" as const, entity: reportMeta },
      {
        entityType: "report_template" as const,
        entity: reportTemplate,
        extras: { tenantId: TENANT },
      },
    ];

    for (const input of inputs) {
      const preview = adapter.publisher.preview(context, input);
      expect(preview.ok, `${input.entityType}: ${preview.message}`).toBe(true);
      expect(preview.previewMetadata?.productId).toBe("testing");
      expect(JSON.stringify(preview.previewMetadata)).not.toMatch(
        /storageRef|s3:\/\/|payloadFingerprint|deadbeef|should-never-appear/i,
      );

      const published = adapter.publisher.publish(context, input);
      expect(published.ok, input.entityType).toBe(true);
      expect(published.lifecycleState).toBe("published");
    }

    expect(adapter.integration.sink.count()).toBe(inputs.length);

    const evidenceDraft = adapter.mapper.mapEvidence(context, evidence);
    expect(evidenceDraft.metadata).not.toHaveProperty("storageRef");
    expect(evidenceDraft.metadata?.checksumPresent).toBe("true");
    expect(JSON.stringify(evidenceDraft.metadata)).not.toMatch(/deadbeef|token=abc/i);

    const importDraft = adapter.mapper.mapImportedResult(context, imported);
    expect(importDraft.metadata).not.toHaveProperty("payloadFingerprint");
    expect(importDraft.metadata).not.toHaveProperty("checksum");
    expect(importDraft.metadata?.checksumPresent).toBe("true");

    const reportDraft = adapter.mapper.mapReportMetadata(context, reportMeta);
    expect(reportDraft.metadata).not.toHaveProperty("checksumSha256");
    expect(reportDraft.metadata).not.toHaveProperty("body");
    expect(reportDraft.metadata?.checksumPresent).toBe("true");
  });

  it("rejects storage leakage and tenant mismatches", () => {
    const adapter = createTestingSearchAdapterForTest();
    const context = ctx();

    expect(() =>
      adapter.mapper.mapTestCase(context, {
        ...testCase,
        id: "storageKey_leaky" as TestCase["id"],
      }),
    ).toThrow(/storage/);

    expect(() =>
      adapter.mapper.mapTestCase(context, {
        ...testCase,
        tenantId: "other-tenant",
      }),
    ).toThrow(/tenant mismatch/);

    const storageReject = adapter.validator.validateDraft(context, {
      entityId: "tca_ok",
      entityType: "test_case",
      title: "X",
      classification: "confidential",
      permissions: ["testing.read"],
      metadata: {
        key: "TC",
        status: "approved",
        priority: "high",
        storageRef: "secret/object",
      },
    });
    expect(storageReject.valid).toBe(false);
    expect(
      storageReject.issues.some((i) => i.code === "storage_leakage"),
    ).toBe(true);

    const published = adapter.publisher.publish(context, {
      entityType: "test_case",
      entity: testCase,
    });
    expect(published.ok).toBe(true);

    const crossTenantRemove = adapter.publisher.remove(
      ctx("other-tenant"),
      "test_case",
      testCase.id,
    );
    expect(crossTenantRemove.ok).toBe(false);
  });

  it("supports production factory with explicit sink and rejects silent memory", () => {
    expect(() => createTestingSearchAdapter()).toThrow(/explicit sink/);
    expect(() => createTestingSearchPublisher()).toThrow(/explicit sink/);

    const integration = createSearchIntegration();
    const adapter = createTestingSearchAdapter({
      sink: integration.sink,
    });
    expect(
      adapter.publisher.publish(ctx(), {
        entityType: "requirement",
        entity: requirement,
      }).ok,
    ).toBe(true);

    const publisher = createTestingSearchPublisher({
      integrationPublisher: integration.publisher,
      integration,
    });
    expect(publisher).toBeDefined();
  });

  it("maps gate definition and decision-shaped certification decision", () => {
    const adapter = createTestingSearchAdapterForTest();
    const context = ctx();

    const gateDraft = adapter.mapper.map(
      context,
      { entityType: "certification_gate", entity: gateDef },
    );
    expect(gateDraft.metadata?.gateKey).toBe("approvals");
    expect(gateDraft.metadata?.required).toBe("true");

    const decision = adapter.mapper.map(context, {
      entityType: "certification_decision",
      entity: {
        id: "cde_25252525252525252525252525252525",
        tenantId: TENANT,
        certificationRecordId: certification.id,
        status: "certified",
        decidedAt: TS,
        decidedByUserId: "user-1",
        title: "Ship decision",
      },
    });
    expect(decision.entityType).toBe("certification_decision");
    expect(decision.metadata?.decisionStatus).toBe("certified");
  });
});
