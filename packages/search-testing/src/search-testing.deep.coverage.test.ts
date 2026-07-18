/**
 * APZSEARCH-013 deep coverage — hooks, throwing sink, validator edges, extras.
 */
import { describe, expect, it } from "vitest";
import {
  asApprovalId,
  asAutomationCoverageSnapshotId,
  asAutomationImportId,
  asAutomationRunId,
  asAutomatedExecutionId,
  asBenchmarkId,
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
  type Evidence,
  type ManualExecution,
  type Release,
  type Requirement,
  type TestCase,
  type TestPlan,
} from "@apzhub/testing-contracts";
import {
  createSearchIntegration,
  InMemorySearchPublicationSink,
} from "@apzhub/search-integration";

import {
  TestingSearchPublisher,
  createTestingSearchAdapter,
  createTestingSearchAdapterForTest,
  createTestingSearchPublisherForTest,
  createTestingSearchPublicationContext,
} from "./index";

const TS = "2026-01-01T00:00:00.000Z";

function ctx(overrides?: { permissions?: readonly string[] }) {
  return createTestingSearchPublicationContext({
    serviceContext: {
      tenantId: "tenant-a",
      userId: "user-1",
      correlationId: "corr-deep",
      permissions: overrides?.permissions ?? ["testing.read"],
      organisationId: "org-a",
    },
  });
}

const plan: TestPlan = {
  id: asTestPlanId("tpl_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
  tenantId: "tenant-a",
  key: "TP-D",
  name: "Deep plan",
  status: "ready",
  suiteIds: [],
  requirementIds: [],
  riskIds: [],
  createdAt: TS,
  updatedAt: TS,
};

const testCase: TestCase = {
  id: asTestCaseId("tca_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
  tenantId: "tenant-a",
  key: "TC-D",
  title: "Deep case",
  status: "approved",
  priority: "low",
  suiteIds: [],
  requirementIds: [],
  steps: [],
  createdAt: TS,
  updatedAt: TS,
};

const requirement: Requirement = {
  id: asRequirementId("req_cccccccccccccccccccccccccccccccc"),
  tenantId: "tenant-a",
  key: "REQ-D",
  title: "Deep req",
  priority: "medium",
  workItemRefs: [],
  riskIds: [],
  createdAt: TS,
  updatedAt: TS,
};

const evidence: Evidence = {
  id: asEvidenceId("evd_dddddddddddddddddddddddddddddddd"),
  tenantId: "tenant-a",
  type: "log",
  title: "Deep evidence",
  storageRef: "storage://hidden",
  createdAt: TS,
  updatedAt: TS,
};

const release: Release = {
  id: asReleaseId("rel_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  tenantId: "tenant-a",
  key: "REL-D",
  name: "Deep release",
  status: "draft",
  createdAt: TS,
  updatedAt: TS,
};

describe("APZSEARCH-013 deep coverage", () => {
  it("covers lifecycle hooks upsert/update/remove paths", () => {
    const adapter = createTestingSearchAdapterForTest();
    const context = ctx();
    const { hooks } = adapter;

    expect(hooks.onTestPlanUpserted(context, plan).ok).toBe(true);
    expect(hooks.onTestPlanUpserted(context, { ...plan, name: "Updated" }).ok).toBe(
      true,
    );
    expect(hooks.onTestCaseUpserted(context, testCase).ok).toBe(true);
    expect(hooks.onRequirementUpserted(context, requirement).ok).toBe(true);
    expect(hooks.onEvidenceUpserted(context, evidence).ok).toBe(true);
    expect(hooks.onReleaseUpserted(context, release).ok).toBe(true);
    expect(hooks.onTestPlanRemoved(context, plan.id).ok).toBe(true);
    expect(hooks.onTestCaseRemoved(context, testCase.id).ok).toBe(true);
    expect(hooks.onEntityRemoved(context, "requirement", requirement.id).ok).toBe(true);
  });

  it("covers publisher validation failure, lifecycle, and throwing sink", () => {
    class ThrowingSink extends InMemorySearchPublicationSink {
      override upsert(): never {
        throw new Error("storage credential boom");
      }
    }
    const sink = new ThrowingSink();
    const integration = createSearchIntegration({ sink });
    const publisher = new TestingSearchPublisher({
      integrationPublisher: integration.publisher,
    });
    const context = ctx();
    const fail = publisher.publish(context, {
      entityType: "test_case",
      entity: testCase,
    });
    expect(fail.ok).toBe(false);
    expect(fail.message).toMatch(/storage|credential|boom/i);

    const okAdapter = createTestingSearchAdapterForTest();
    expect(
      okAdapter.publisher.validate(context, {
        entityType: "test_case",
        entity: {
          ...testCase,
          title: "",
        },
      }).ok,
    ).toBe(false);

    const published = okAdapter.publisher.publish(context, {
      entityType: "test_plan",
      entity: plan,
    });
    expect(published.ok).toBe(true);
    const life = okAdapter.publisher.lifecycle(context, plan.id, "archived", "deep");
    expect(life.ok).toBe(true);

    const removeFail = okAdapter.publisher.remove(
      ctx({ permissions: [] }),
      "test_plan",
      "missing_id_xyz",
    );
    expect(removeFail.ok).toBe(false);
  });

  it("covers factory wiring variants and missing extras failures", () => {
    const integration = createSearchIntegration();
    const viaPublisher = createTestingSearchAdapter({
      integrationPublisher: integration.publisher,
      integration,
    });
    expect(viaPublisher.publisher).toBeDefined();

    const viaOptions = createTestingSearchAdapter({
      searchIntegrationOptions: { sink: integration.sink },
    });
    expect(viaOptions.publisher).toBeDefined();

    const viaIntegrationOnly = createTestingSearchAdapter({
      integration,
    });
    expect(viaIntegrationOnly.publisher).toBeDefined();

    const forTest = createTestingSearchPublisherForTest({
      sink: integration.sink,
    });
    expect(forTest).toBeDefined();

    const adapter = createTestingSearchAdapterForTest();
    const context = ctx();

    expect(() =>
      adapter.mapper.map(context, {
        entityType: "execution_step",
        entity: {
          id: asTestStepId("tst_ffffffffffffffffffffffffffffffff"),
          caseId: testCase.id,
          ordinal: 1,
          action: "x",
          expectedResult: "y",
        },
      }),
    ).toThrow(/tenantId/);

    expect(() =>
      adapter.mapper.map(context, {
        entityType: "automation_suite",
        entity: { name: "No id suite", cases: [] },
      }),
    ).toThrow(/id/);

    expect(() =>
      adapter.mapper.map(context, {
        entityType: "risk_summary",
        entity: {
          overallScore: 1,
          overallLevel: "low",
          factors: [],
          computedAt: TS,
        },
      }),
    ).toThrow(/entityId/);

    expect(() =>
      adapter.mapper.map(context, {
        entityType: "report_template",
        entity: {
          id: "rtt_ffffffffffffffffffffffffffffffff",
          reportType: "qa",
          name: "T",
          version: "1",
          revision: 1,
          title: "T",
          sections: [],
          builtin: true,
          createdAt: TS,
          updatedAt: TS,
        },
      }),
    ).toThrow(/tenantId/);

    expect(() =>
      adapter.mapper.map(context, {
        entityType: "release_manifest",
        entity: {
          releaseId: release.id,
          packageIds: [],
          candidateIds: [],
          scopeRefs: [],
          evidenceRefs: [],
          dependencyIds: [],
          generatedAt: TS,
          isDecision: false,
        },
      }),
    ).toThrow(/tenantId/);

    const execution: ManualExecution = {
      id: asManualExecutionId("mex_ffffffffffffffffffffffffffffffff"),
      tenantId: "tenant-a",
      sessionId: asExecutionSessionId("ses_ffffffffffffffffffffffffffffffff"),
      caseId: testCase.id,
      status: "in_progress",
      stepActuals: [],
      createdAt: TS,
      updatedAt: TS,
    };
    const mapped = adapter.mapper.map(context, {
      entityType: "test_execution",
      entity: execution,
    });
    expect(mapped.title).toContain("Execution");

    const approvalMapped = adapter.mapper.map(context, {
      entityType: "approval",
      entity: {
        id: asApprovalId("apr_ffffffffffffffffffffffffffffffff"),
        tenantId: "tenant-a",
        certificationRecordId: asCertificationRecordId(
          "cer_ffffffffffffffffffffffffffffffff",
        ),
        status: "pending",
        createdAt: TS,
        updatedAt: TS,
      },
    });
    expect(approvalMapped.entityType).toBe("approval");

    const canonicalSuite = adapter.mapper.map(context, {
      entityType: "automation_suite",
      entity: {
        name: "Canonical",
        key: "k1",
        status: "pass",
        cases: [{ title: "c1", status: "pass" }],
      },
      extras: {
        entityId: "asu_ffffffffffffffffffffffffffffffff",
        tenantId: "tenant-a",
      },
    });
    expect(canonicalSuite.metadata?.caseCount).toBe("1");

    const emptyPerms = createTestingSearchPublicationContext({
      serviceContext: {
        tenantId: "tenant-a",
        userId: "user-1",
        correlationId: "corr-empty",
        permissions: [],
      },
    });
    const noPerms = adapter.validator.validateDraft(emptyPerms, {
      entityId: "x",
      entityType: "test_case",
      title: "t",
      classification: "internal",
      permissions: [],
      metadata: { key: "k", status: "draft", priority: "low" },
    });
    expect(noPerms.valid).toBe(false);

    const unsupported = adapter.validator.validateDraft(context, {
      entityId: "x",
      entityType: "not_a_type",
      title: "t",
      classification: "internal",
      permissions: ["testing.read"],
      metadata: {},
    });
    expect(unsupported.valid).toBe(false);

    const providerLeak = adapter.validator.validateDraft(context, {
      entityId: "x",
      entityType: "test_case",
      title: "t",
      classification: "internal",
      permissions: ["testing.read"],
      metadata: {
        key: "k",
        status: "draft",
        priority: "low",
        meiliIndex: "bad",
      },
    });
    expect(providerLeak.valid).toBe(false);

    const bodyLeak = adapter.validator.validateDraft(context, {
      entityId: "x",
      entityType: "report_metadata",
      title: "t",
      classification: "internal",
      permissions: ["testing.read"],
      metadata: {
        reportType: "qa",
        outputFormat: "pdf",
        templateId: "t1",
        body: "secret-report",
      },
    });
    expect(bodyLeak.valid).toBe(false);
  });

  it("covers update path and metrics snapshot branches", () => {
    const adapter = createTestingSearchAdapterForTest();
    const context = ctx();
    expect(
      adapter.publisher.publish(context, {
        entityType: "test_case",
        entity: testCase,
      }).ok,
    ).toBe(true);
    expect(
      adapter.publisher.update(context, {
        entityType: "test_case",
        entity: { ...testCase, title: "Updated deep" },
      }).ok,
    ).toBe(true);
    expect(
      adapter.publisher.preview(context, {
        entityType: "requirement",
        entity: requirement,
      }).ok,
    ).toBe(true);

    const stats = adapter.publisher.statistics(context);
    expect(stats.published).toBeGreaterThan(0);
    expect(stats.updated).toBeGreaterThan(0);
    expect(stats.previewed).toBeGreaterThan(0);
    expect(stats.byEntityType.test_case).toBeGreaterThan(0);

    adapter.metrics.record("diagnostics", true);
    const snap = adapter.metrics.snapshot();
    expect(snap).toBeDefined();
  });

  it("covers remaining hooks, factory sink paths, publisher throws, validator edges", () => {
    const adapter = createTestingSearchAdapterForTest();
    const context = ctx();
    const { hooks } = adapter;
    const audit = {
      createdAt: TS,
      updatedAt: TS,
      tenantId: "tenant-a" as const,
      createdBy: "user-1",
    };

    const suiteEntity = {
      ...audit,
      id: asTestSuiteId("tsu_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
      key: "TS-H",
      name: "Hook suite",
      status: "ready" as const,
      planIds: [] as const,
      caseIds: [] as const,
      isRegression: false,
    };
    const run = {
      ...audit,
      id: asTestRunId("trn_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
      sessionId: asExecutionSessionId("ses_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
      executionType: "manual" as const,
      status: "completed" as const,
      resultIds: [] as const,
      evidenceIds: [] as const,
    };
    const autoRun = {
      ...audit,
      id: asAutomationRunId("aru_cccccccccccccccccccccccccccccccc"),
      executionId: asAutomatedExecutionId("aex_cccccccccccccccccccccccccccccccc"),
      title: "Auto",
      status: "pass" as const,
    };
    const imported = {
      ...audit,
      id: asAutomationImportId("aim_dddddddddddddddddddddddddddddddd"),
      adapterKind: "vitest" as const,
      adapterVersion: "1",
      externalRunRef: "r1",
      status: "completed" as const,
    };
    const coverage = {
      ...audit,
      id: asAutomationCoverageSnapshotId("acs_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
      summary: { covered: 1, total: 2, percentage: 50 },
    };
    const cert = {
      ...audit,
      id: asCertificationRecordId("cer_ffffffffffffffffffffffffffffffff"),
      key: "C1",
      name: "Cert",
      status: "draft" as const,
      gateIds: [] as const,
      approvalIds: [] as const,
    };
    const gate = {
      ...audit,
      id: asQualityGateId("qgt_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
      key: "g1",
      name: "Gate",
      status: "pending" as const,
    };
    const approval = {
      ...audit,
      id: asApprovalId("apr_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
      certificationRecordId: cert.id,
      status: "pending" as const,
    };
    const candidate = {
      ...audit,
      id: asReleaseCandidateId("rcd_cccccccccccccccccccccccccccccccc"),
      releaseId: release.id,
      label: "RC",
      status: "draft" as const,
    };
    const pkg = {
      ...audit,
      id: asReleasePackageId("rpk_dddddddddddddddddddddddddddddddd"),
      releaseId: release.id,
      name: "Pkg",
      versionLabel: "1.0.0",
    };
    const scope = {
      ...audit,
      id: asReleaseScopeId("rsc_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
      releaseId: release.id,
      kind: "plan" as const,
      refId: plan.id,
    };
    const relApproval = {
      ...audit,
      id: asReleaseApprovalId("rap_ffffffffffffffffffffffffffffffff"),
      releaseId: release.id,
      stageKind: "qa" as const,
      status: "pending" as const,
    };
    const relDecision = {
      ...audit,
      id: asReleaseDecisionId("rdc_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
      releaseId: release.id,
      verdict: "approved" as const,
      decidedByUserId: "user-1",
      decidedAt: TS,
      rationale: "ok",
      isAutomatic: false as const,
    };
    const relSummary = {
      id: asReleaseSummarySnapshotId("rsm_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
      releaseId: release.id,
      approvalStatuses: {},
      recommendationCode: "recommend_hold" as const,
      recommendationReasons: ["wait"],
      computedAt: TS,
      isDecision: false as const,
    };
    const risk = {
      overallScore: 10,
      overallLevel: "low" as const,
      factors: [],
      computedAt: TS,
    };
    const eng = {
      ...audit,
      id: asEngineeringSnapshotId("ens_cccccccccccccccccccccccccccccccc"),
      tenantId: "tenant-a",
      scope: { tenantId: "tenant-a" },
      qualityScore: {
        id: "q",
        scope: { tenantId: "tenant-a" },
        score: 1,
        weights: DEFAULT_QUALITY_SCORE_WEIGHTS,
        inputs: {
          coverage: 1,
          automation: 1,
          manualExecution: 1,
          failedTests: 0,
          openDefects: 0,
          certification: 1,
          approvals: 1,
          releaseReadiness: 1,
        },
        components: [],
        computedAt: TS,
      },
      health: {
        scope: { tenantId: "tenant-a" },
        status: "watch" as const,
        overallScore: 1,
        qualityScore: 1,
        stabilityScore: 1,
        releaseReadinessScore: 1,
        riskScore: 1,
        coverageScore: 1,
        automationScore: 1,
        manualExecutionScore: 1,
        certificationScore: 1,
        pipelineHealthScore: 1,
        indicators: [],
        risk,
        computedAt: TS,
        isDecision: false as const,
      },
      risk,
      indicators: [],
      trends: [],
      computedAt: TS,
    };
    const trend = {
      id: asTrendSeriesId("trs_dddddddddddddddddddddddddddddddd"),
      kind: "coverage" as const,
      scope: { tenantId: "tenant-a" },
      periodKind: "daily" as const,
      points: [{ at: TS, value: 1 }],
      direction: "stable" as const,
      delta: 0,
      computedAt: TS,
    };
    const benchmark = {
      ...audit,
      id: asBenchmarkId("bnm_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
      tenantId: "tenant-a",
      scope: { tenantId: "tenant-a" },
      metricKey: "automation",
      comparison: { current: 1, direction: "stable" as const },
      computedAt: TS,
    };
    const historical = {
      ...audit,
      id: asEngineeringHistoricalSnapshotId("ehs_ffffffffffffffffffffffffffffffff"),
      tenantId: "tenant-a",
      scope: { tenantId: "tenant-a" },
      period: { kind: "daily" as const, startAt: TS, endAt: TS },
      qualityScore: 1,
      engineeringHealthScore: 1,
      indicators: [],
      metrics: {},
      sourceRefs: {},
      computedAt: TS,
      immutable: true as const,
    };
    const defect = {
      ...audit,
      id: asDefectLinkId("def_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
      tenantId: "tenant-a",
      providerKind: "internal" as const,
      status: "open" as const,
      summary: "defect",
    };
    const reportMeta = {
      id: "rpt_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      tenantId: "tenant-a",
      requestId: "r",
      templateId: "t",
      reportType: "qa",
      outputFormat: "markdown" as const,
      parametersJson: "{}",
      generatedAt: TS,
      generatedBy: "user-1",
      version: "1",
      revision: 1,
      checksumSha256: "",
      byteLength: 1,
      preview: true,
      createdAt: TS,
      updatedAt: TS,
    };
    const reportTemplate = {
      id: "rtt_cccccccccccccccccccccccccccccccc",
      reportType: "qa",
      name: "T",
      version: "1",
      revision: 1,
      title: "T",
      sections: [],
      builtin: true,
      createdAt: TS,
      updatedAt: TS,
    };

    expect(hooks.onTestSuiteUpserted(context, suiteEntity).ok).toBe(true);
    expect(
      hooks.onTestExecutionUpserted(context, {
        id: asManualExecutionId("mex_dddddddddddddddddddddddddddddddd"),
        ...audit,
        sessionId: asExecutionSessionId("ses_dddddddddddddddddddddddddddddddd"),
        caseId: testCase.id,
        status: "paused",
        stepActuals: [],
      }).ok,
    ).toBe(true);
    expect(hooks.onTestRunUpserted(context, run).ok).toBe(true);
    expect(hooks.onApprovalUpserted(context, approval).ok).toBe(true);
    expect(hooks.onDefectUpserted(context, defect).ok).toBe(true);
    expect(hooks.onAutomationRunUpserted(context, autoRun).ok).toBe(true);
    expect(
      hooks.onAutomationSuiteUpserted(context, {
        id: "asu_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        title: "Suite",
        tenantId: "tenant-a",
        status: "pass",
      }).ok,
    ).toBe(true);
    expect(hooks.onImportedResultUpserted(context, imported).ok).toBe(true);
    expect(hooks.onCoverageSummaryUpserted(context, coverage).ok).toBe(true);
    expect(hooks.onCertificationUpserted(context, cert).ok).toBe(true);
    expect(hooks.onCertificationGateUpserted(context, gate).ok).toBe(true);
    expect(
      hooks.onCertificationApprovalUpserted(context, {
        ...approval,
        id: asApprovalId("apr_ffffffffffffffffffffffffffffffff"),
      }).ok,
    ).toBe(true);
    expect(
      hooks.onCertificationEvidenceUpserted(context, {
        id: "cev_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        title: "links",
        tenantId: "tenant-a",
      }).ok,
    ).toBe(true);
    expect(hooks.onCertificationDecisionUpserted(context, cert).ok).toBe(true);
    expect(hooks.onReleaseCandidateUpserted(context, candidate).ok).toBe(true);
    expect(hooks.onReleasePackageUpserted(context, pkg).ok).toBe(true);
    expect(hooks.onReleaseScopeUpserted(context, scope).ok).toBe(true);
    expect(hooks.onReleaseApprovalUpserted(context, relApproval).ok).toBe(true);
    expect(hooks.onReleaseDecisionUpserted(context, relDecision).ok).toBe(true);
    expect(
      hooks.onReleaseSummaryUpserted(context, relSummary, {
        tenantId: "tenant-a",
        parentRelease: release,
      }).ok,
    ).toBe(true);
    expect(hooks.onEngineeringSnapshotUpserted(context, eng).ok).toBe(true);
    expect(hooks.onEngineeringTrendUpserted(context, trend).ok).toBe(true);
    expect(hooks.onBenchmarkUpserted(context, benchmark).ok).toBe(true);
    expect(hooks.onHistoricalSnapshotUpserted(context, historical).ok).toBe(true);
    expect(hooks.onReportMetadataUpserted(context, reportMeta).ok).toBe(true);
    expect(
      hooks.onReportTemplateUpserted(context, reportTemplate, {
        tenantId: "tenant-a",
      }).ok,
    ).toBe(true);

    // Factory: integrationPublisher + sink path and searchIntegrationOptions sinkKind
    const integration = createSearchIntegration();
    expect(
      createTestingSearchAdapter({
        integrationPublisher: integration.publisher,
        sink: integration.sink,
      }).publisher,
    ).toBeDefined();
    expect(
      createTestingSearchAdapter({
        integrationPublisher: integration.publisher,
      }).publisher,
    ).toBeDefined();
    expect(
      createTestingSearchAdapter({
        integrationPublisher: integration.publisher,
        searchIntegrationOptions: { sink: integration.sink },
      }).publisher,
    ).toBeDefined();

    // Publisher rejection + throw paths
    const throwing = {
      publish: () => {
        throw new Error("boom publish");
      },
      update: () => {
        throw new Error("boom update");
      },
      preview: () => {
        throw new Error("boom preview");
      },
      remove: () => {
        throw new Error("boom remove");
      },
      lifecycle: () => {
        throw new Error("boom lifecycle");
      },
      validate: () => {
        throw new Error("boom validate");
      },
      getSink: () => adapter.integration.sink,
    } as never;

    const publisherThrow = new TestingSearchPublisher({
      integrationPublisher: throwing,
      mapper: adapter.mapper,
      validator: {
        validateDraft: () => ({
          valid: false,
          issues: [{ field: "title", code: "required", message: "forced" }],
        }),
      } as never,
    });
    expect(
      publisherThrow.publish(context, {
        entityType: "test_case",
        entity: testCase,
      }).ok,
    ).toBe(false);
    expect(
      publisherThrow.update(context, {
        entityType: "test_case",
        entity: testCase,
      }).ok,
    ).toBe(false);
    expect(
      publisherThrow.preview(context, {
        entityType: "test_case",
        entity: testCase,
      }).ok,
    ).toBe(false);

    const publisherOkMap = new TestingSearchPublisher({
      integrationPublisher: throwing,
    });
    expect(
      publisherOkMap.publish(context, {
        entityType: "test_case",
        entity: testCase,
      }).ok,
    ).toBe(false);
    expect(
      publisherOkMap.validate(context, {
        entityType: "test_case",
        entity: testCase,
      }).ok,
    ).toBe(false);
    expect(publisherOkMap.remove(context, "test_case", testCase.id).ok).toBe(false);
    expect(publisherOkMap.lifecycle(context, testCase.id, "removed").ok).toBe(false);
    expect(
      publisherOkMap.validate(context, {
        entityType: "test_case",
        entity: { ...testCase, tenantId: "other" },
      }).ok,
    ).toBe(false);

    // Validator edge paths
    expect(
      adapter.validator.validateDraft(context, {
        entityId: "",
        entityType: "test_case",
        title: "t",
        classification: "internal",
        permissions: ["testing.read"],
        metadata: { key: "k", status: "draft", priority: "low" },
      }).valid,
    ).toBe(false);
    expect(
      adapter.validator.validateDraft(context, {
        entityId: "storageKey_bad",
        entityType: "test_case",
        title: "t",
        classification: "internal",
        permissions: ["testing.read"],
        metadata: { key: "k", status: "draft", priority: "low" },
      }).valid,
    ).toBe(false);
    expect(
      adapter.validator.validateDraft(
        { ...context, tenantId: "" },
        {
          entityId: "ok",
          entityType: "test_case",
          title: "t",
          classification: "internal",
          permissions: ["testing.read"],
          metadata: { key: "k", status: "draft", priority: "low" },
        },
      ).valid,
    ).toBe(false);
    expect(
      adapter.validator.validateDraft(context, {
        entityId: "ok",
        entityType: "test_case",
        title: "t",
        classification: undefined as unknown as "internal",
        permissions: ["testing.read"],
        metadata: { key: "k", status: "draft", priority: "low" },
      }).valid,
    ).toBe(false);
    expect(
      adapter.validator.validateDraft(context, {
        entityId: "ok",
        entityType: "test_case",
        title: "t",
        classification: "internal",
        permissions: ["testing.read"],
        metadata: {
          key: "k",
          status: "draft",
          priority: "low",
          checksumHex: "abc",
        },
      }).valid,
    ).toBe(false);
    expect(
      adapter.validator.validateDraft(context, {
        entityId: "ok",
        entityType: "test_case",
        title: "t",
        classification: "internal",
        permissions: ["testing.read"],
        metadata: {
          key: "storageRef_value_leak",
          status: "draft",
          priority: "low",
        },
      }).valid,
    ).toBe(false);

    // Lifecycle remaining statuses + suggestion map
    const life = adapter.lifecycle;
    expect(life.suggestFromDomainStatus("queued")).toBe("draft");
    expect(life.suggestFromDomainStatus("passed")).toBe("validated");
    expect(life.suggestFromDomainStatus("ready")).toBe("validated");
    expect(life.suggestFromDomainStatus("completed")).toBe("validated");
    expect(life.suggestFromDomainStatus("released")).toBe("validated");
    expect(life.suggestFromDomainStatus("published")).toBe("validated");
    expect(life.suggestFromDomainStatus("retired")).toBe("archived");
    expect(life.suggestFromDomainStatus("expired")).toBe("archived");
    expect(life.suggestFromDomainStatus("cancelled")).toBe("removed");
    expect(life.suggestFromDomainStatus("withdrawn")).toBe("removed");
    expect(life.suggestFromDomainStatus("mystery")).toBe("validated");
    expect(life.suggestFromEntityStatus("release_manifest", "active")).toBe(
      "validated",
    );
    expect(life.suggestFromEntityStatus("report_metadata", "deleted")).toBe("removed");

    // Mapper optional / branch coverage helpers
    expect(
      adapter.mapper.map(context, {
        entityType: "certification_decision",
        entity: cert,
      }).entityType,
    ).toBe("certification_decision");
    expect(() =>
      adapter.mapper.map(context, {
        entityType: "certification_evidence",
        entity: { id: "cev_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", title: "x" },
      }),
    ).toThrow(/tenantId/);
    expect(() =>
      adapter.mapper.map(context, {
        entityType: "engineering_trend",
        entity: {
          ...trend,
          scope: {},
        },
      }),
    ).toThrow(/tenantId/);
    expect(() =>
      adapter.mapper.map(context, {
        entityType: "certification_decision",
        entity: {
          id: "cde_cccccccccccccccccccccccccccccccc",
          certificationRecordId: cert.id,
          status: "certified",
        },
      }),
    ).toThrow(/tenantId/);
    expect(() =>
      adapter.mapper.map(context, {
        entityType: "risk_summary",
        entity: risk,
        extras: { entityId: "rsk_dddddddddddddddddddddddddddddddd" },
      }),
    ).toThrow(/tenantId/);
  });
});
