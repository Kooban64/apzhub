import { describe, expect, it } from "vitest";

import { buildRcDomainTiles } from "./certification-runtime";

describe("F5 RC domain face", () => {
  it("wires security/performance/code quality from evidence and gates (no hardcode empties)", () => {
    const tiles = buildRcDomainTiles({
      score: 100,
      readiness: "READY",
      residualRisk: "medium",
      gates: [
        {
          gateId: "gate_f4_automation",
          name: "Automation",
          status: "satisfied",
          reason: "ok",
          evidenceRefs: ["evidence://ev-1"],
          outstandingWork: [],
          category: "mandatory:coverage",
        },
        {
          gateId: "gate_f4_ci",
          name: "CI",
          status: "satisfied",
          reason: "ok",
          evidenceRefs: ["evidence://ev-2"],
          outstandingWork: [],
          category: "mandatory:coverage",
        },
        {
          gateId: "gate_f4_a11y_or_regression",
          name: "A11y",
          status: "satisfied",
          reason: "ok",
          evidenceRefs: ["evidence://ev-3"],
          outstandingWork: [],
          category: "mandatory:accessibility",
        },
        {
          gateId: "gate_f4_security",
          name: "Security",
          status: "satisfied",
          reason: "ok",
          evidenceRefs: ["evidence://ev-4"],
          outstandingWork: [],
          category: "mandatory:security",
        },
        {
          gateId: "gate_f4_performance",
          name: "Performance",
          status: "satisfied",
          reason: "ok",
          evidenceRefs: ["evidence://ev-5"],
          outstandingWork: [],
          category: "mandatory:performance",
        },
        {
          gateId: "gate_f4_code_quality",
          name: "Code quality",
          status: "satisfied",
          reason: "ok",
          evidenceRefs: ["evidence://ev-6"],
          outstandingWork: [],
          category: "mandatory:coverage",
        },
      ],
      evidenceLinks: [
        {
          evidenceId: "ev-1",
          domain: "automation",
          ref: "evidence://ev-1",
        },
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
      explainability: [
        {
          gateId: "gate_f4_automation",
          reason: "evidence present",
          evidenceEvaluated: ["evidence://ev-1"],
        },
      ],
      impactSummary: {
        riskLevel: "medium",
        requirementCount: 1,
        suiteMatchCount: 1,
        nodeCount: 5,
      },
    });

    const byId = Object.fromEntries(tiles.map((tile) => [tile.domainId, tile]));
    expect(byId.automation?.status).toBe("pass");
    expect(byId.coverage?.status).toBe("pass");
    expect(byId.accessibility?.status).toBe("pass");
    expect(byId.requirements?.status).toBe("pass");
    expect(byId.security?.status).toBe("pass");
    expect(byId.performance?.status).toBe("pass");
    expect(byId.code_quality?.status).toBe("pass");
    expect(byId.certification?.summary).toMatch(/awaiting human/i);
    expect(
      tiles.every(
        (tile) => !/vitest|playwright|axe|trivy|sonar|k6|cypress/i.test(tile.label),
      ),
    ).toBe(true);
  });

  it("marks missing security/performance as not_present from evidence absence (not hardcode)", () => {
    const tiles = buildRcDomainTiles({
      score: 50,
      readiness: "BLOCKED",
      residualRisk: "high",
      gates: [
        {
          gateId: "gate_f4_security",
          name: "Security",
          status: "failed",
          reason: "missing",
          evidenceRefs: [],
          outstandingWork: ["Provide security evidence"],
          category: "mandatory:security",
        },
        {
          gateId: "gate_f4_performance",
          name: "Performance",
          status: "failed",
          reason: "missing",
          evidenceRefs: [],
          outstandingWork: ["Provide performance evidence"],
          category: "mandatory:performance",
        },
      ],
      evidenceLinks: [],
      explainability: [],
      impactSummary: {
        riskLevel: "high",
        requirementCount: 0,
        suiteMatchCount: 0,
        nodeCount: 1,
      },
    });
    const byId = Object.fromEntries(tiles.map((tile) => [tile.domainId, tile]));
    expect(byId.security?.status).toBe("fail");
    expect(byId.performance?.status).toBe("fail");
    expect(byId.security?.summary).not.toMatch(/honest empty/i);
  });
});
