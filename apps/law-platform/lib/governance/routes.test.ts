import { describe, expect, it } from "vitest";

import {
  isLawGovernanceRoute,
  lawCataloguePath,
  lawHomePath,
  lawQuestionDetailPath,
  lawQuestionsPath,
  resolveLawGovernanceRoute,
} from "./routes";

describe("law governance routes (N-03)", () => {
  it("detects governance paths and excludes practice prefixes", () => {
    expect(isLawGovernanceRoute("/workspace/law")).toBe(true);
    expect(isLawGovernanceRoute("/workspace/law/home")).toBe(true);
    expect(isLawGovernanceRoute("/workspace/law/questions")).toBe(true);
    expect(isLawGovernanceRoute("/workspace/law/dashboard")).toBe(false);
    expect(isLawGovernanceRoute("/workspace/law/clients")).toBe(false);
    expect(isLawGovernanceRoute("/workspace/law/trust/accounts")).toBe(false);
  });

  it("resolves governance companion routes", () => {
    expect(resolveLawGovernanceRoute(lawHomePath())).toEqual({ kind: "home" });
    expect(resolveLawGovernanceRoute(lawQuestionsPath())).toEqual({
      kind: "questions",
    });
    expect(resolveLawGovernanceRoute(lawQuestionDetailPath("GQ-01"))).toEqual({
      kind: "question-detail",
      questionId: "GQ-01",
    });
    expect(resolveLawGovernanceRoute(lawCataloguePath())).toEqual({
      kind: "catalogue",
    });
    expect(resolveLawGovernanceRoute("/workspace/law/context")).toEqual({
      kind: "context",
    });
    expect(resolveLawGovernanceRoute("/workspace/law/help")).toEqual({
      kind: "help",
    });
    expect(resolveLawGovernanceRoute("/workspace/law/settings")).toEqual({
      kind: "settings",
    });
  });
});
