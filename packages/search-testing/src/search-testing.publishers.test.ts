/**
 * APZSEARCH-013 specialised publisher routing + Quality/Pipeline mapping.
 */
import { describe, expect, it } from "vitest";
import {
  asCoverageMetricId,
  asDefectLinkId,
  asPipelineId,
  asPipelineImportId,
  asPipelineRunId,
  type CoverageMetric,
  type DefectLink,
  type Pipeline,
  type PipelineImport,
  type PipelineRun,
  type QualitySummary,
} from "@apzhub/testing-contracts";

import {
  AutomationPublisher,
  CertificationPublisher,
  EngineeringIntelligencePublisher,
  ManualTestingPublisher,
  PipelinePublisher,
  QualityPublisher,
  ReleasePublisher,
  ReportingMetadataPublisher,
  TESTING_SEARCH_DOMAIN_ENTITY_TYPES,
  createTestingSearchAdapterForTest,
  createTestingSearchPublicationContext,
} from "./index";

const TS = "2026-01-01T00:00:00.000Z";
const TENANT = "tenant-a";

function ctx(tenantId = TENANT) {
  return createTestingSearchPublicationContext({
    serviceContext: {
      tenantId,
      userId: "user-1",
      correlationId: "corr-013-pub",
      permissions: ["testing.read", "search.query.execute"],
      organisationId: "org-a",
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

describe("APZSEARCH-013 specialised publishers", () => {
  it("routes entity types to specialised publisher domains", () => {
    const adapter = createTestingSearchAdapterForTest();
    const pubs = adapter.publisher.getSpecialisedPublishers();

    expect(pubs.manual.getMapper()).toBeDefined();
    expect(pubs.automation.getMapper()).toBeDefined();
    expect(pubs.certification.getMapper()).toBeDefined();
    expect(pubs.release.getMapper()).toBeDefined();
    expect(pubs.engineeringIntelligence.getMapper()).toBeDefined();
    expect(pubs.quality.getMapper()).toBeDefined();
    expect(pubs.reportingMetadata.getMapper()).toBeDefined();
    expect(pubs.pipeline.getMapper()).toBeDefined();

    expect(adapter.mapper.getManualMapper()).toBe(pubs.manual.getMapper());
    expect(adapter.mapper.getAutomationMapper()).toBe(pubs.automation.getMapper());
    expect(adapter.mapper.getCertificationMapper()).toBe(
      pubs.certification.getMapper(),
    );
    expect(adapter.mapper.getReleaseMapper()).toBe(pubs.release.getMapper());
    expect(adapter.mapper.getEngineeringMapper()).toBe(
      pubs.engineeringIntelligence.getMapper(),
    );
    expect(adapter.mapper.getQualityMapper()).toBe(pubs.quality.getMapper());
    expect(adapter.mapper.getReportingMapper()).toBe(
      pubs.reportingMetadata.getMapper(),
    );
    expect(adapter.mapper.getPipelineMapper()).toBe(pubs.pipeline.getMapper());

    expect(pubs.manual).toBeInstanceOf(ManualTestingPublisher);
    expect(pubs.automation).toBeInstanceOf(AutomationPublisher);
    expect(pubs.certification).toBeInstanceOf(CertificationPublisher);
    expect(pubs.release).toBeInstanceOf(ReleasePublisher);
    expect(pubs.engineeringIntelligence).toBeInstanceOf(
      EngineeringIntelligencePublisher,
    );
    expect(pubs.quality).toBeInstanceOf(QualityPublisher);
    expect(pubs.reportingMetadata).toBeInstanceOf(ReportingMetadataPublisher);
    expect(pubs.pipeline).toBeInstanceOf(PipelinePublisher);

    expect(adapter.publisher.resolvePublisher("test_case").domain).toBe("manual");
    expect(adapter.publisher.resolvePublisher("automation_run").domain).toBe(
      "automation",
    );
    expect(adapter.publisher.resolvePublisher("certification").domain).toBe(
      "certification",
    );
    expect(adapter.publisher.resolvePublisher("release").domain).toBe("release");
    expect(adapter.publisher.resolvePublisher("engineering_snapshot").domain).toBe(
      "engineering_intelligence",
    );
    expect(adapter.publisher.resolvePublisher("quality_summary").domain).toBe(
      "quality",
    );
    expect(adapter.publisher.resolvePublisher("report_metadata").domain).toBe(
      "reporting_metadata",
    );
    expect(adapter.publisher.resolvePublisher("pipeline_run").domain).toBe("pipeline");

    expect(TESTING_SEARCH_DOMAIN_ENTITY_TYPES.quality).toContain("defect_summary");
    expect(TESTING_SEARCH_DOMAIN_ENTITY_TYPES.pipeline).toContain("pipeline_import");
  });

  it("publishes quality and pipeline metadata without leakage", () => {
    const adapter = createTestingSearchAdapterForTest();
    const context = ctx();

    const coverageMetric: CoverageMetric = {
      ...audit,
      id: asCoverageMetricId("cov_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
      kind: "feature",
      subjectId: "subj_1",
      coveredCount: 8,
      totalCount: 10,
      percentage: 80,
      computedAt: TS,
    };

    const qualitySummary: QualitySummary = {
      scope: { tenantId: TENANT, releaseLabel: "1.0" },
      coverageMetrics: [coverageMetric],
      openDefectsByStatus: { open: 2, closed: 1 },
      openDefectsByPriority: { high: 1 },
      computedAt: TS,
    };

    const defectSummaryInput = {
      id: "dfs_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      title: "Open defects rollup",
      tenantId: TENANT,
      status: "open",
      openCount: 2,
      totalCount: 3,
    };

    const defectLink: DefectLink = {
      ...audit,
      id: asDefectLinkId("dfl_cccccccccccccccccccccccccccccccc"),
      providerKind: "projects",
      status: "open",
      summary: "Linked defect meta",
      severity: "major",
      url: "https://example.com/never-publish",
    };

    const pipeline: Pipeline = {
      ...audit,
      id: asPipelineId("pl_dddddddddddddddddddddddddddddddd"),
      key: "ci-main",
      name: "Main CI",
      providerKind: "github_actions",
      status: "active",
      secretRefs: [{ name: "TOKEN", reference: "vault://secret" }],
      variables: [{ name: "FOO", source: "env" }],
      revision: 3,
    };

    const pipelineImport: PipelineImport = {
      ...audit,
      id: asPipelineImportId("pi_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
      providerKind: "github_actions",
      adapterVersion: "1.0.0",
      externalRunRef: "run-99",
      status: "completed",
      checksum: "deadbeefdeadbeefdeadbeefdeadbeef",
      payloadFingerprint: "should-never-appear",
      pipelineId: pipeline.id,
      startedAt: TS,
      completedAt: TS,
    };

    const pipelineRun: PipelineRun = {
      ...audit,
      id: asPipelineRunId("pr_ffffffffffffffffffffffffffffffff"),
      pipelineId: pipeline.id,
      importId: pipelineImport.id,
      providerKind: "github_actions",
      externalRunRef: "run-99",
      status: "passed",
      stages: [],
      jobs: [],
      artifacts: [],
      approvals: [],
      events: [],
      environment: { name: "ci" },
      links: {},
      summary: { overallStatus: "passed" },
      logs: [{ name: "build.log", uriReference: "s3://never" }],
      secretRefs: [{ name: "TOKEN", reference: "vault://secret" }],
      startedAt: TS,
      completedAt: TS,
      durationMs: 1200,
      revision: 1,
    };

    const qualityPub = adapter.specialisedPublishers.quality.publish(context, {
      entityType: "quality_summary",
      entity: qualitySummary,
      extras: { entityId: "qsm_11111111111111111111111111111111" },
    });
    expect(qualityPub.ok, qualityPub.message).toBe(true);

    const covPub = adapter.publisher.publish(context, {
      entityType: "quality_coverage_summary",
      entity: coverageMetric,
    });
    expect(covPub.ok).toBe(true);

    const dfsPub = adapter.publisher.publish(context, {
      entityType: "defect_summary",
      entity: defectSummaryInput,
    });
    expect(dfsPub.ok).toBe(true);

    const dfsLink = adapter.publisher.preview(context, {
      entityType: "defect_summary",
      entity: defectLink,
    });
    expect(dfsLink.ok).toBe(true);
    expect(JSON.stringify(dfsLink.previewMetadata)).not.toMatch(
      /example\.com|never-publish/i,
    );

    const pipePub = adapter.specialisedPublishers.pipeline.publish(context, {
      entityType: "pipeline",
      entity: pipeline,
    });
    expect(pipePub.ok, pipePub.message).toBe(true);

    const runPub = adapter.publisher.publish(context, {
      entityType: "pipeline_run",
      entity: pipelineRun,
    });
    expect(runPub.ok, runPub.message).toBe(true);

    const importPub = adapter.publisher.publish(context, {
      entityType: "pipeline_import",
      entity: pipelineImport,
    });
    expect(importPub.ok, importPub.message).toBe(true);

    const pipeDraft = adapter.mapper.mapPipeline(context, pipeline);
    expect(pipeDraft.metadata).not.toHaveProperty("secretRefs");
    expect(pipeDraft.metadata?.secretsPresent).toBe("true");
    expect(JSON.stringify(pipeDraft)).not.toMatch(/vault:\/\/|TOKEN|bar/);

    const runDraft = adapter.mapper.mapPipelineRun(context, pipelineRun);
    expect(runDraft.metadata).not.toHaveProperty("logs");
    expect(runDraft.metadata?.logsPresent).toBe("true");
    expect(JSON.stringify(runDraft.metadata)).not.toMatch(
      /s3:\/\/|vault:\/\/|deadbeef/i,
    );

    const importDraft = adapter.mapper.mapPipelineImport(context, pipelineImport);
    expect(importDraft.metadata).not.toHaveProperty("checksum");
    expect(importDraft.metadata).not.toHaveProperty("payloadFingerprint");
    expect(importDraft.metadata?.checksumPresent).toBe("true");

    const rejected = adapter.specialisedPublishers.manual.publish(context, {
      entityType: "pipeline",
      entity: pipeline,
    } as never);
    expect(rejected.ok).toBe(false);
    expect(rejected.message).toMatch(/does not accept/i);

    const unknown = adapter.publisher.publish(context, {
      entityType: "not_a_type",
      entity: pipeline,
    } as never);
    expect(unknown.ok).toBe(false);

    const qualityDraft = adapter.mapper.map(context, {
      entityType: "quality_summary",
      entity: qualitySummary,
      extras: { entityId: "qsm_11111111111111111111111111111111" },
    });
    expect(qualityDraft.entityType).toBe("quality_summary");
    expect(qualityDraft.metadata?.openDefectCount).toBe("3");

    const withSnapshot: QualitySummary = {
      ...qualitySummary,
      snapshot: {
        ...audit,
        id: "qss_22222222222222222222222222222222" as never,
        tenantId: TENANT,
        scope: { tenantId: TENANT },
        metrics: {
          passRate: 1,
          failRate: 0,
          blockedRate: 0,
          skippedRate: 0,
          automationRatio: 0.5,
          manualRatio: 0.5,
          evidenceCompleteness: 1,
          approvalCompleteness: 1,
          executionCompleteness: 1,
          coverageCompleteness: 1,
          riskScore: 0,
          defectDensity: 0,
          severityDistribution: {},
          openDefectImpact: 0,
          totalExecutions: 1,
          openDefectCount: 0,
        },
        computedAt: TS,
        label: "Snap A",
      },
      readiness: {
        dimensions: {
          execution: { key: "execution", score: 1, status: "ready", reasons: [] },
          coverage: { key: "coverage", score: 1, status: "ready", reasons: [] },
          evidence: { key: "evidence", score: 1, status: "ready", reasons: [] },
          approval: { key: "approval", score: 1, status: "ready", reasons: [] },
          automation: {
            key: "automation",
            score: 1,
            status: "ready",
            reasons: [],
          },
          defect: { key: "defect", score: 1, status: "ready", reasons: [] },
          risk: { key: "risk", score: 1, status: "ready", reasons: [] },
        },
        overallScore: 0.95,
        suggestedStatus: "ready",
        blockingFactors: [],
        computedAt: TS,
        isDecision: false,
      },
    };
    const snapDraft = adapter.mapper.mapQualitySummary(context, withSnapshot);
    expect(snapDraft.entityId).toContain("qss_");
    expect(snapDraft.title).toBe("Snap A");
    expect(snapDraft.metadata?.overallScore).toBe("0.95");

    const leanPipeline: Pipeline = {
      ...audit,
      id: asPipelineId("pl_33333333333333333333333333333333"),
      key: "lean",
      name: "Lean",
      providerKind: "generic_ci",
      status: "archived",
    };
    const leanDraft = adapter.mapper.mapPipeline(context, leanPipeline);
    expect(leanDraft.metadata?.secretsPresent).toBe("false");

    const leanRun: PipelineRun = {
      ...pipelineRun,
      id: asPipelineRunId("pr_44444444444444444444444444444444"),
      logs: undefined,
      secretRefs: undefined,
      durationMs: undefined,
      startedAt: undefined,
      completedAt: undefined,
      revision: undefined,
    };
    const leanRunDraft = adapter.mapper.mapPipelineRun(context, leanRun);
    expect(leanRunDraft.metadata?.logsPresent).toBe("false");
    expect(leanRunDraft.metadata?.secretsPresent).toBe("false");

    expect(
      adapter.publisher.validate(context, {
        entityType: "defect_summary",
        entity: {
          id: "dfs_55555555555555555555555555555555",
          tenantId: TENANT,
          title: "No counts",
        },
      }).ok,
    ).toBe(false);

    expect(
      adapter.publisher.update(context, {
        entityType: "quality_coverage_summary",
        entity: coverageMetric,
      }).ok,
    ).toBe(true);

    expect(
      adapter.specialisedPublishers.pipeline.remove(
        context,
        "pipeline",
        String(pipeline.id),
      ).ok,
    ).toBe(true);
  });

  it("rejects pipeline storage leakage on entity id", () => {
    const adapter = createTestingSearchAdapterForTest();
    expect(() =>
      adapter.mapper.mapPipeline(ctx(), {
        ...audit,
        id: "storageRef_leaky" as Pipeline["id"],
        key: "x",
        name: "Bad",
        providerKind: "github_actions",
        status: "active",
      }),
    ).toThrow(/storage/);
  });
});
