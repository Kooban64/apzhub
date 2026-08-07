import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_GOVERNANCE_QUESTION_CATALOGUE,
  getGovernanceQuestion,
  GOVERNANCE_CAPABILITIES,
  GOVERNANCE_HOME_PROMPTS,
} from "./enterprise-governance-questions";

describe("enterprise governance questions (N-03)", () => {
  it("covers GQ-01 through GQ-05", () => {
    for (const id of ["GQ-01", "GQ-02", "GQ-03", "GQ-04", "GQ-05"]) {
      const q = getGovernanceQuestion(id);
      expect(q).toBeDefined();
      expect(q?.question.endsWith("?")).toBe(true);
      expect(q?.question.toLowerCase()).not.toContain("matter");
      expect(q?.question.toLowerCase()).not.toContain("billing");
    }
  });

  it("organises catalogue by governance capabilities", () => {
    expect(GOVERNANCE_CAPABILITIES.length).toBeGreaterThanOrEqual(5);
    expect(ENTERPRISE_GOVERNANCE_QUESTION_CATALOGUE.length).toBe(5);
  });

  it("provides home attention prompts without practice nouns", () => {
    expect(GOVERNANCE_HOME_PROMPTS.length).toBeGreaterThanOrEqual(4);
    for (const prompt of GOVERNANCE_HOME_PROMPTS) {
      expect(prompt.prompt.toLowerCase()).not.toContain("trust accounting");
      expect(prompt.prompt.toLowerCase()).not.toContain("invoice");
    }
  });
});
