import { describe, expect, it } from "vitest";

import type { ChangeImpactView } from "./scm-impact";
import type { CertificationEvaluation } from "./certification-runtime";
import { composeChangeAdvice } from "./qi-change-advice";

function impactFixture(overrides: Partial<ChangeImpactView> = {}): ChangeImpactView {
  return {
    changeEventId: "chg-demo-1",
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
    inferredRequirementIds: [],
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
    score: 33,
    readiness: "BLOCKED",
    title: "Release Candidate demo",
    summary: "Blocked",
    advisory: true,
    governanceDecisionId: "gov-1",
    residualRisk: "high",
    compositionSatisfied: false,
    gates: [
      {
        gateId: "gate_f4_ci",
        name: "CI",
        status: "failed",
        reason: "missing",
        evidenceRefs: [],
        outstandingWork: ["Provide CI evidence"],
        category: "mandatory:coverage",
      },
    ],
    evidenceLinks: [
      {
        evidenceId: "ev-1",
        domain: "automation",
        ref: "evidence://ev-1",
      },
    ],
    explainability: [
      {
        gateId: "gate_f4_ci",
        reason: "evidence_ref_present(ci) missing",
        evidenceEvaluated: [],
      },
    ],
    domains: [
      {
        domainId: "coverage",
        label: "Coverage",
        status: "fail",
        summary: "No CI",
        evidenceIds: [],
        explainRefs: ["gate_f4_ci"],
      },
    ],
    ...overrides,
  };
}

describe("F6 qi-change-advice", () => {
  it("produces gap/risk/regression/blocker kinds with artifact links", () => {
    const bundle = composeChangeAdvice({
      tenantId: "tenant-1",
      changeEventId: "chg-demo-1",
      impact: impactFixture(),
      evidenceLinks: [
        { evidenceId: "ev-1", domain: "automation", ref: "evidence://ev-1" },
      ],
      latestEvaluation: certFixture(),
    });
    expect(bundle.advisory).toBe(true);
    const kinds = new Set(bundle.advice.map((item) => item.kind));
    expect(kinds.has("gap")).toBe(true);
    expect(kinds.has("risk")).toBe(true);
    expect(kinds.has("regression")).toBe(true);
    expect(kinds.has("blocker")).toBe(true);
    expect(
      bundle.advice.every(
        (item) =>
          item.advisory === true &&
          item.explanation.decisionPath.length > 0 &&
          Array.isArray(item.explanation.artifacts),
      ),
    ).toBe(true);
  });

  it("source policy: qi-change-advice must not call cert mutation APIs", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const source = await fs.readFile(
      path.join(process.cwd(), "apps/web/lib/qep/qi-change-advice.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/recordHumanCertificationDecision/);
    expect(source).not.toMatch(/submitDecision/);
    expect(source).not.toMatch(/evaluateChangeCertification/);
    expect(source).not.toMatch(/acceptRegressionProposal/);
    expect(source).toMatch(/advisory: true/);
  });
});

describe("F6 certification human-actor policy", () => {
  it("rejects qi: actors from recording GO/NO-GO", async () => {
    const { recordHumanCertificationDecision } =
      await import("./certification-runtime");
    await expect(
      recordHumanCertificationDecision({
        evaluationId: "cert-missing",
        actorId: "qi:f6-agent",
        outcome: "GO",
        rationale: "should never work",
      }),
    ).rejects.toThrow(/human_actor_required/);
  });
});
