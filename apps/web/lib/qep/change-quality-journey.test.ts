import { describe, expect, it } from "vitest";

import type { ChangeImpactView } from "./scm-impact";
import type { CertificationEvaluation } from "./certification-runtime";
import { composeTestDesignPack } from "./test-design-assist";
import { composeChangeQualityJourney } from "./change-quality-journey";

function impactFixture(overrides: Partial<ChangeImpactView> = {}): ChangeImpactView {
  return {
    changeEventId: "chg-demo-1",
    repositoryId: "repo-1",
    correlationId: "corr-1",
    riskLevel: "high",
    summary: "Impact fixture",
    nodes: [
      {
        nodeId: "change:chg-demo-1",
        assetType: "commit",
        name: "demo",
        reason: "heartbeat",
        depth: 0,
      },
      {
        nodeId: "suite:suite-1",
        assetType: "test_suite",
        name: "Suite 1",
        reason: "path match",
        depth: 1,
      },
    ],
    edges: [],
    inferredRequirementIds: ["REQ-100"],
    inferredDefectIds: [],
    matchedSuiteIds: ["suite-1"],
    ...overrides,
  };
}

function certFixture(
  overrides: Partial<CertificationEvaluation> = {},
): CertificationEvaluation {
  return {
    evaluationId: "cert-1",
    changeEventId: "chg-demo-1",
    tenantId: "tenant-1",
    createdAt: "2026-08-09T00:00:00.000Z",
    actorId: "user-1",
    score: 100,
    readiness: "READY",
    title: "Release Candidate demo",
    summary: "Ready",
    advisory: true,
    governanceDecisionId: "gov-1",
    residualRisk: "low",
    compositionSatisfied: true,
    gates: [
      {
        gateId: "gate_f4_automation",
        name: "Automation",
        status: "satisfied",
        reason: "ok",
        evidenceRefs: ["evidence://ev-1"],
        outstandingWork: [],
        category: "mandatory:automation",
      },
    ],
    evidenceLinks: [
      { evidenceId: "ev-1", domain: "automation", ref: "evidence://ev-1" },
      { evidenceId: "ev-2", domain: "ci", ref: "evidence://ev-2" },
      {
        evidenceId: "ev-3",
        domain: "accessibility",
        ref: "evidence://ev-3",
      },
      { evidenceId: "ev-4", domain: "security", ref: "evidence://ev-4" },
      {
        evidenceId: "ev-5",
        domain: "performance",
        ref: "evidence://ev-5",
      },
      {
        evidenceId: "ev-6",
        domain: "code_quality",
        ref: "evidence://ev-6",
      },
    ],
    explainability: [],
    impactSummary: {
      riskLevel: "high",
      requirementCount: 1,
      suiteMatchCount: 1,
      nodeCount: 2,
    },
    ...overrides,
  };
}

describe("F8 change-quality-journey", () => {
  it("composes five steps with deep links and picks a next step", () => {
    const impact = impactFixture();
    const designPack = composeTestDesignPack({
      changeEventId: "chg-demo-1",
      impact,
      evidenceDomains: ["automation"],
    });
    const journey = composeChangeQualityJourney({
      tenantId: "tenant-1",
      changeEventId: "chg-demo-1",
      impact,
      designPack,
      evidenceLinks: [
        { evidenceId: "ev-1", domain: "automation", ref: "evidence://ev-1" },
      ],
      latestEvaluation: undefined,
    });
    expect(journey.advisory).toBe(true);
    expect(journey.steps).toHaveLength(5);
    expect(journey.steps.map((step) => step.stepId)).toEqual([
      "impact",
      "propose_design",
      "evidence_domains",
      "rc_evaluate",
      "human_go_nogo",
    ]);
    expect(journey.deepLinks.designAssist).toContain("designAssist=");
    expect(journey.deepLinks.rc).toContain("changeEventId=");
    expect(journey.deepLinks.qi).toContain("changeEventId=");
    expect(journey.nextStepId).toBeTruthy();
    expect(journey.steps.every((step) => step.href.length > 0)).toBe(true);
  });

  it("marks human GO complete when decision is present", () => {
    const impact = impactFixture();
    const designPack = composeTestDesignPack({
      changeEventId: "chg-demo-1",
      impact,
      evidenceDomains: [
        "automation",
        "ci",
        "accessibility",
        "security",
        "performance",
        "code_quality",
      ],
    });
    const journey = composeChangeQualityJourney({
      tenantId: "tenant-1",
      changeEventId: "chg-demo-1",
      impact,
      designPack,
      evidenceLinks: certFixture().evidenceLinks,
      latestEvaluation: certFixture({
        humanDecision: {
          outcome: "GO",
          rationale: "Ship it",
          actorId: "user-1",
          decidedAt: "2026-08-09T01:00:00.000Z",
          approvalDecisionId: "dec-1",
          approvalBundleId: "bundle-1",
        },
      }),
    });
    const human = journey.steps.find((step) => step.stepId === "human_go_nogo");
    expect(human?.status).toBe("complete");
    expect(journey.certificationSummary?.humanDecision).toBe("GO");
  });

  it("source policy: journey must not call cert/design mutation APIs", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const source = await fs.readFile(
      path.join(process.cwd(), "apps/web/lib/qep/change-quality-journey.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/recordHumanCertificationDecision/);
    expect(source).not.toMatch(/submitDecision/);
    expect(source).not.toMatch(/evaluateChangeCertification/);
    expect(source).not.toMatch(/acceptTestDesignProposal/);
    expect(source).not.toMatch(/acceptRegressionProposal/);
    expect(source).toMatch(/advisory: true/);
  });
});
