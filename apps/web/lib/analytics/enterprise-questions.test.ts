import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_QUESTION_CATALOGUE,
  getEnterpriseQuestion,
  INSIGHT_HORIZONS,
  listQuestionsByDomain,
  listQuestionsByHorizon,
} from "./enterprise-questions";

describe("enterprise questions catalogue (N-03)", () => {
  it("covers three insight horizons", () => {
    expect(INSIGHT_HORIZONS.map((h) => h.id)).toEqual([
      "operational",
      "tactical",
      "strategic",
    ]);
    for (const horizon of INSIGHT_HORIZONS) {
      expect(listQuestionsByHorizon(horizon.id).length).toBeGreaterThan(0);
    }
  });

  it("includes approved enterprise questions and decision context", () => {
    for (const id of ["EQ-E01", "EQ-M01", "EQ-S01", "EQ-T01", "EQ-W01", "EQ-Q01"]) {
      const question = getEnterpriseQuestion(id);
      expect(question).toBeDefined();
      expect(question?.whyItMatters.length).toBeGreaterThan(0);
      expect(question?.possibleActions.length).toBeGreaterThan(0);
      expect(question?.relatedProducts.length).toBeGreaterThan(0);
    }
  });

  it("organises by business domain", () => {
    expect(listQuestionsByDomain("projects").length).toBeGreaterThan(0);
    expect(listQuestionsByDomain("support").length).toBeGreaterThan(0);
    expect(listQuestionsByDomain("time").length).toBeGreaterThan(0);
    expect(listQuestionsByDomain("workflow").length).toBeGreaterThan(0);
  });

  it("never frames catalogue entries as dashboards", () => {
    for (const item of ENTERPRISE_QUESTION_CATALOGUE) {
      expect(item.question.toLowerCase()).not.toContain("dashboard");
      expect(item.question.endsWith("?")).toBe(true);
    }
  });
});
