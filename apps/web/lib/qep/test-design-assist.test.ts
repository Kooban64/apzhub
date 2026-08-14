import { describe, expect, it } from "vitest";

import type { ChangeImpactView } from "./scm-impact";
import { composeTestDesignPack } from "./test-design-assist";

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
    ],
    edges: [],
    inferredRequirementIds: ["REQ-100"],
    inferredDefectIds: [],
    matchedSuiteIds: ["suite-1"],
    ...overrides,
  };
}

describe("F7 test-design-assist", () => {
  it("composes REQ smoke + domain gap drafts from impact and evidence gaps", () => {
    const pack = composeTestDesignPack({
      changeEventId: "chg-demo-1",
      impact: impactFixture(),
      evidenceDomains: ["automation"],
    });
    expect(pack.advisory).toBe(true);
    expect(pack.inferredRequirementIds).toEqual(["REQ-100"]);
    expect(pack.matchedSuiteIds).toEqual(["suite-1"]);
    expect(pack.domainGaps).toContain("security");
    expect(pack.domainGaps).toContain("accessibility");
    expect(pack.domainGaps).not.toContain("automation");

    const kinds = new Set(pack.drafts.map((draft) => draft.kind));
    expect(kinds.has("requirement_smoke")).toBe(true);
    expect(kinds.has("domain_gap")).toBe(true);

    const reqDraft = pack.drafts.find((draft) => draft.kind === "requirement_smoke");
    expect(reqDraft?.requirementId).toBe("REQ-100");
    expect(reqDraft?.suiteId).toBe("suite-1");
    expect(reqDraft?.suggestedSteps.length).toBeGreaterThan(0);

    const security = pack.drafts.find((draft) => draft.domain === "security");
    expect(security?.type).toBe("security");
    expect(security?.why).toMatch(/No Security evidence/i);
  });

  it("falls back to path regression when no REQs and domains already covered", () => {
    const pack = composeTestDesignPack({
      changeEventId: "chg-demo-1",
      impact: impactFixture({
        inferredRequirementIds: [],
        riskLevel: "medium",
      }),
      evidenceDomains: [
        "automation",
        "ci",
        "accessibility",
        "security",
        "performance",
        "code_quality",
      ],
    });
    expect(pack.domainGaps).toEqual([]);
    expect(pack.drafts).toHaveLength(1);
    expect(pack.drafts[0]?.kind).toBe("path_regression");
  });

  it("normalizes REQ refs into draft titles while keeping advisory why text", () => {
    const pack = composeTestDesignPack({
      changeEventId: "chg-demo-1",
      impact: impactFixture({ inferredRequirementIds: ["REQ-auth-login"] }),
      evidenceDomains: [
        "automation",
        "ci",
        "accessibility",
        "security",
        "performance",
        "code_quality",
      ],
    });
    expect(pack.drafts[0]?.requirementId).toBe("REQ-auth-login");
    expect(pack.drafts[0]?.title).toContain("REQ-auth-login");
  });

  it("source policy: test-design-assist must not call cert mutation APIs", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const source = await fs.readFile(
      path.join(process.cwd(), "apps/web/lib/qep/test-design-assist.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/recordHumanCertificationDecision/);
    expect(source).not.toMatch(/submitDecision/);
    expect(source).not.toMatch(/evaluateChangeCertification/);
    expect(source).toMatch(/advisory: true/);
    expect(source).toMatch(/ai_suggestion/);
  });
});
